import { APIProvider, Map, AdvancedMarker, InfoWindow, useMap } from '@vis.gl/react-google-maps';
import { useEffect, useMemo, useState, useRef } from 'react';
import { Card } from '../ui/card';
import { format } from 'date-fns';
import { fr, enUS, es, id as idLocale, zhCN } from 'date-fns/locale';
import { useTranslation } from '@/hooks/useTranslation';
import html2canvas from 'html2canvas';
import { Button } from '../ui/button';
import { Download } from 'lucide-react';
import { toast } from 'sonner';

interface PlannedOffer {
  id: string;
  offer_id: string;
  planned_time?: string;
  notes?: string;
  offers: {
    id: string;
    title: string;
    slug: string;
    partners: {
      id: string;
      name: string;
      lat?: number;
      lng?: number;
      address?: string;
    };
  };
}

interface ItineraryDay {
  id: string;
  day_date: string;
  day_order: number;
  cities?: {
    id: string;
    name: string;
    geo_center_lat?: number;
    geo_center_lng?: number;
  };
  itinerary_planned_offers?: PlannedOffer[];
}

interface ItineraryMapProps {
  days: ItineraryDay[];
  onOfferClick?: (offerId: string) => void;
  itineraryTitle?: string;
}

// Color palette for different days
const dayColors = [
  '#FF6B6B', // Red
  '#4ECDC4', // Teal
  '#45B7D1', // Blue
  '#FFA07A', // Orange
  '#98D8C8', // Mint
  '#F7DC6F', // Yellow
  '#BB8FCE', // Purple
  '#85C1E2', // Sky Blue
];

const localeMap = {
  fr: fr,
  en: enUS,
  es: es,
  id: idLocale,
  zh: zhCN,
};

export function ItineraryMap({ days, onOfferClick, itineraryTitle }: ItineraryMapProps) {
  const { t, language } = useTranslation();
  const currentLocale = localeMap[language] || fr;
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [selectedOffer, setSelectedOffer] = useState<{
    offer: PlannedOffer;
    dayIndex: number;
    dayDate: string;
  } | null>(null);

  const handleDownloadMap = async () => {
    if (!mapContainerRef.current) return;
    
    try {
      toast.info(t('travelPlanner.generatingMap') || 'Génération de la carte...');
      
      const canvas = await html2canvas(mapContainerRef.current, {
        useCORS: true,
        allowTaint: true,
        scale: 2,
        logging: false,
      });
      
      canvas.toBlob((blob) => {
        if (!blob) {
          toast.error(t('common.error') || 'Erreur lors de la génération');
          return;
        }
        
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = `${itineraryTitle || 'itinerary'}-map.png`;
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
        
        toast.success(t('travelPlanner.mapDownloaded') || 'Carte téléchargée !');
      }, 'image/png');
    } catch (error) {
      console.error('Error downloading map:', error);
      toast.error(t('common.error') || 'Erreur lors du téléchargement');
    }
  };

    // Collect all offers with locations
    const offersWithLocation: Array<{
      offer: PlannedOffer;
      dayIndex: number;
      dayDate: string;
      lat: number;
      lng: number;
    }> = [];

    days.forEach((day, index) => {
      day.itinerary_planned_offers?.forEach((plannedOffer) => {
        const lat = plannedOffer.offers?.partners?.lat;
        const lng = plannedOffer.offers?.partners?.lng;
        
        if (lat && lng) {
          offersWithLocation.push({
            offer: plannedOffer,
            dayIndex: index,
            dayDate: day.day_date,
            lat: Number(lat),
            lng: Number(lng),
          });
        }
      });
    });

    // Calculate center
    const center = offersWithLocation.length > 0
      ? {
          lat: offersWithLocation.reduce((sum, item) => sum + item.lat, 0) / offersWithLocation.length,
          lng: offersWithLocation.reduce((sum, item) => sum + item.lng, 0) / offersWithLocation.length,
        }
      : { lat: -8.3405, lng: 115.1889 }; // Bali center

    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

    if (!apiKey) {
      return (
        <Card className="relative w-full h-[500px] overflow-hidden border-border/50 flex items-center justify-center">
          <p className="text-muted-foreground">Google Maps API key not configured</p>
        </Card>
      );
    }

    if (offersWithLocation.length === 0) {
      return (
        <Card className="relative w-full h-[500px] overflow-hidden border-border/50 flex items-center justify-center">
          <p className="text-muted-foreground">{t('travelPlanner.noPlannedLocations')}</p>
        </Card>
      );
    }

    return (
      <div className="space-y-4" ref={mapContainerRef}>
        {/* Legend */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold">{t('travelPlanner.legend')}</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadMap}
              className="gap-2"
            >
              <Download className="w-4 h-4" />
              {t('travelPlanner.downloadMap') || 'Télécharger'}
            </Button>
          </div>
          <div className="flex flex-wrap gap-3">
            {days.map((day, index) => {
              const hasOffers = day.itinerary_planned_offers && day.itinerary_planned_offers.length > 0;
              if (!hasOffers) return null;
              
              return (
                <div key={day.id} className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded-full ring-2 ring-white shadow"
                    style={{ backgroundColor: dayColors[index % dayColors.length] }}
                  />
                  <span className="text-xs text-muted-foreground">
                    {t('travelPlanner.day')} {day.day_order} - {format(new Date(day.day_date), 'd MMM', { locale: currentLocale })}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Map */}
        <Card className="relative w-full h-[500px] overflow-hidden border-border/50">
          <APIProvider apiKey={apiKey}>
            <InnerMap
              center={center}
              offersWithLocation={offersWithLocation}
              onOfferClick={onOfferClick}
              currentLocale={currentLocale}
              t={t}
            />
          </APIProvider>
      </Card>
    </div>
  );
}

function InnerMap({ center, offersWithLocation, onOfferClick, currentLocale, t }: {
  center: { lat: number; lng: number };
  offersWithLocation: Array<{
    offer: PlannedOffer;
    dayIndex: number;
    dayDate: string;
    lat: number;
    lng: number;
  }>;
  onOfferClick?: (offerId: string) => void;
  currentLocale: any;
  t: any;
}) {
  const [selectedOffer, setSelectedOffer] = useState<{
    offer: PlannedOffer;
    dayIndex: number;
    dayDate: string;
  } | null>(null);
  const map = useMap("balipass-itinerary-map");
  const [polylines, setPolylines] = useState<any[]>([]);

  // Group offers by day to create routes
  const offersByDay = useMemo(() => {
    const grouped: Record<number, Array<{
      offer: PlannedOffer;
      dayIndex: number;
      dayDate: string;
      lat: number;
      lng: number;
    }>> = {};
    offersWithLocation.forEach(item => {
      if (!grouped[item.dayIndex]) {
        grouped[item.dayIndex] = [];
      }
      grouped[item.dayIndex].push(item);
    });
    return grouped;
  }, [offersWithLocation]);

  // Fit bounds to include all markers
  useEffect(() => {
    if (!map || offersWithLocation.length === 0) return;
    const g = (window as any).google;
    if (!g?.maps) return;

    const bounds = new g.maps.LatLngBounds();
    offersWithLocation.forEach(({ lat, lng }) => bounds.extend({ lat, lng }));
    map.fitBounds(bounds, 64);
  }, [map, offersWithLocation.length]);

  // Draw polylines between points of each day
  useEffect(() => {
    if (!map) return;
    const g = (window as any).google;
    if (!g?.maps) return;

    // Clear existing polylines
    polylines.forEach(line => line.setMap(null));
    const newPolylines: any[] = [];

    // Create a polyline for each day with multiple points
    Object.entries(offersByDay).forEach(([dayIndexStr, dayOffers]) => {
      if (dayOffers.length < 2) return; // Need at least 2 points to draw a line

      const dayIndex = parseInt(dayIndexStr);
      const path = dayOffers.map(({ lat, lng }) => ({ lat, lng }));
      const color = dayColors[dayIndex % dayColors.length];

      const polyline = new g.maps.Polyline({
        path,
        geodesic: true,
        strokeColor: color,
        strokeOpacity: 0.7,
        strokeWeight: 3,
        icons: [{
          icon: {
            path: 'M 0,-1 0,1',
            strokeOpacity: 1,
            scale: 3
          },
          offset: '0',
          repeat: '15px'
        }],
        map
      });

      newPolylines.push(polyline);
    });

    setPolylines(newPolylines);

    return () => {
      newPolylines.forEach(line => line.setMap(null));
    };
  }, [map, offersByDay]);

  return (
    <Map
      defaultCenter={center}
      defaultZoom={11}
      mapId="balipass-itinerary-map"
      gestureHandling="greedy"
      disableDefaultUI={false}
    >
      {offersWithLocation.map((item, idx) => {
        const color = dayColors[item.dayIndex % dayColors.length];
        
        return (
          <AdvancedMarker
            key={`${item.offer.id}-${idx}`}
            position={{ lat: item.lat, lng: item.lng }}
            onClick={() => setSelectedOffer(item)}
          >
            <div
              className="w-6 h-6 rounded-full shadow-lg ring-2 ring-white border border-white flex items-center justify-center text-white text-xs font-bold"
              style={{ backgroundColor: color }}
              aria-label={item.offer.offers.partners.name}
            >
              {item.dayIndex + 1}
            </div>
          </AdvancedMarker>
        );
      })}

      {selectedOffer && (
        <InfoWindow
          position={{ 
            lat: selectedOffer.offer.offers.partners.lat!, 
            lng: selectedOffer.offer.offers.partners.lng! 
          }}
          onCloseClick={() => setSelectedOffer(null)}
        >
          <div 
            className="p-2 cursor-pointer max-w-xs"
            onClick={() => {
              if (onOfferClick) {
                onOfferClick(selectedOffer.offer.offer_id);
              }
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <div
                className="w-4 h-4 rounded-full ring-1 ring-gray-300"
                style={{ backgroundColor: dayColors[selectedOffer.dayIndex % dayColors.length] }}
              />
              <span className="text-xs font-semibold text-gray-600">
                {t('travelPlanner.day')} {selectedOffer.dayIndex + 1} - {format(new Date(selectedOffer.dayDate), 'd MMM', { locale: currentLocale })}
              </span>
            </div>
            <h3 className="font-bold text-sm mb-1">{selectedOffer.offer.offers.partners.name}</h3>
            <p className="text-xs text-gray-600 mb-1">{selectedOffer.offer.offers.title}</p>
            {selectedOffer.offer.planned_time && (
              <p className="text-xs text-gray-500">🕐 {selectedOffer.offer.planned_time}</p>
            )}
            {selectedOffer.offer.notes && (
              <p className="text-xs text-gray-500 mt-1 italic">{selectedOffer.offer.notes}</p>
            )}
          </div>
        </InfoWindow>
      )}
    </Map>
  );
}

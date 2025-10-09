import { APIProvider, Map, AdvancedMarker, InfoWindow, useMap } from '@vis.gl/react-google-maps';
import { useEffect, useMemo, useState } from 'react';
import { Card } from '../ui/card';
import { format } from 'date-fns';
import { fr, enUS, es, id as idLocale, zhCN } from 'date-fns/locale';
import { useTranslation } from '@/hooks/useTranslation';

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

export function ItineraryMap({ days, onOfferClick }: ItineraryMapProps) {
  const { t, language } = useTranslation();
  const currentLocale = localeMap[language] || fr;
  const [selectedOffer, setSelectedOffer] = useState<{
    offer: PlannedOffer;
    dayIndex: number;
    dayDate: string;
  } | null>(null);

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
    <div className="space-y-4">
      {/* Legend */}
      <Card className="p-4">
        <h3 className="text-sm font-semibold mb-3">{t('travelPlanner.legend')}</h3>
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

  // Group offers by day to create routes (sorted by planned_time)
  const offersByDay = useMemo(() => {
    const grouped: Record<number, Array<{
      offer: PlannedOffer;
      dayIndex: number;
      dayDate: string;
      lat: number;
      lng: number;
      offerIndex: number;
    }>> = {};
    
    offersWithLocation.forEach(item => {
      if (!grouped[item.dayIndex]) {
        grouped[item.dayIndex] = [];
      }
      grouped[item.dayIndex].push({
        ...item,
        offerIndex: grouped[item.dayIndex].length
      });
    });
    
    // Sort each day's offers by planned_time if available
    Object.keys(grouped).forEach(dayIndex => {
      grouped[parseInt(dayIndex)].sort((a, b) => {
        const timeA = a.offer.planned_time || '00:00';
        const timeB = b.offer.planned_time || '00:00';
        return timeA.localeCompare(timeB);
      });
      // Update offerIndex after sorting
      grouped[parseInt(dayIndex)].forEach((item, idx) => {
        item.offerIndex = idx;
      });
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
        strokeOpacity: 0.8,
        strokeWeight: 4,
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
      {Object.entries(offersByDay).flatMap(([dayIndexStr, dayOffers]) => {
        const dayIndex = parseInt(dayIndexStr);
        const color = dayColors[dayIndex % dayColors.length];
        const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        
        return dayOffers.map((item) => (
          <AdvancedMarker
            key={`${item.offer.id}`}
            position={{ lat: item.lat, lng: item.lng }}
            onClick={() => setSelectedOffer(item)}
          >
            <div
              className="w-8 h-8 rounded-full shadow-lg ring-2 ring-white flex items-center justify-center text-white text-xs font-bold"
              style={{ backgroundColor: color }}
              aria-label={item.offer.offers.partners.name}
            >
              {dayIndex + 1}{letters[item.offerIndex]}
            </div>
          </AdvancedMarker>
        ));
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

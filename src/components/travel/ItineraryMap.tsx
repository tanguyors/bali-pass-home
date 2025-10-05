import { APIProvider, Map, AdvancedMarker, InfoWindow, useMap } from '@vis.gl/react-google-maps';
import { useEffect, useMemo, useState } from 'react';
import { Card } from '../ui/card';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

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

export function ItineraryMap({ days, onOfferClick }: ItineraryMapProps) {
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
        <p className="text-muted-foreground">Aucun lieu planifié avec coordonnées</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Legend */}
      <Card className="p-4">
        <h3 className="text-sm font-semibold mb-3">Légende</h3>
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
                  Jour {day.day_order} - {format(new Date(day.day_date), 'd MMM', { locale: fr })}
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
          />
        </APIProvider>
      </Card>
    </div>
  );
}

function InnerMap({ center, offersWithLocation, onOfferClick }: {
  center: { lat: number; lng: number };
  offersWithLocation: Array<{
    offer: PlannedOffer;
    dayIndex: number;
    dayDate: string;
    lat: number;
    lng: number;
  }>;
  onOfferClick?: (offerId: string) => void;
}) {
  const [selectedOffer, setSelectedOffer] = useState<{
    offer: PlannedOffer;
    dayIndex: number;
    dayDate: string;
  } | null>(null);
  const map = useMap("balipass-itinerary-map");

  // Fit bounds to include all markers
  useEffect(() => {
    if (!map || offersWithLocation.length === 0) return;
    const g = (window as any).google;
    if (!g?.maps) return;

    const bounds = new g.maps.LatLngBounds();
    offersWithLocation.forEach(({ lat, lng }) => bounds.extend({ lat, lng }));
    // Add padding so markers aren't at the edges
    map.fitBounds(bounds, 64);
  }, [map, offersWithLocation.length]);

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
                Jour {selectedOffer.dayIndex + 1} - {format(new Date(selectedOffer.dayDate), 'd MMM', { locale: fr })}
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


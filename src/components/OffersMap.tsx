import { APIProvider, Map, AdvancedMarker, InfoWindow } from '@vis.gl/react-google-maps';
import { useState } from 'react';
import { Card } from './ui/card';

interface Offer {
  id: string;
  title: string;
  partner: {
    name: string;
    lat?: number;
    lng?: number;
  };
}

interface OffersMapProps {
  offers: Offer[];
  onOfferClick?: (offerId: string) => void;
}

export function OffersMap({ offers, onOfferClick }: OffersMapProps) {
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);

  // Filter offers with valid coordinates
  const offersWithLocation = offers.filter(
    offer => offer.partner?.lat && offer.partner?.lng
  );

  // Calculate center and bounds
  const center = offersWithLocation.length > 0
    ? {
        lat: offersWithLocation.reduce((sum, offer) => sum + (offer.partner.lat || 0), 0) / offersWithLocation.length,
        lng: offersWithLocation.reduce((sum, offer) => sum + (offer.partner.lng || 0), 0) / offersWithLocation.length,
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

  return (
    <Card className="relative w-full h-[500px] overflow-hidden border-border/50">
      <APIProvider apiKey={apiKey}>
        <Map
          defaultCenter={center}
          defaultZoom={11}
          mapId="balipass-map"
          gestureHandling="greedy"
          disableDefaultUI={false}
        >
          {offersWithLocation.map((offer) => (
            <AdvancedMarker
              key={offer.id}
              position={{ lat: offer.partner.lat!, lng: offer.partner.lng! }}
              onClick={() => setSelectedOffer(offer)}
            >
              <div
                className="w-5 h-5 rounded-full bg-primary shadow ring-2 ring-white border border-white"
                aria-label={offer.partner.name}
              />
            </AdvancedMarker>
          ))}

          {selectedOffer && (
            <InfoWindow
              position={{ lat: selectedOffer.partner.lat!, lng: selectedOffer.partner.lng! }}
              onCloseClick={() => setSelectedOffer(null)}
            >
              <div 
                className="p-2 cursor-pointer"
                onClick={() => {
                  if (onOfferClick) {
                    onOfferClick(selectedOffer.id);
                  }
                }}
              >
                <h3 className="font-bold text-sm mb-1">{selectedOffer.partner.name}</h3>
                <p className="text-xs text-muted-foreground">{selectedOffer.title}</p>
              </div>
            </InfoWindow>
          )}
        </Map>
      </APIProvider>
    </Card>
  );
}

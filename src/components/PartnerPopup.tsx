import { MapPin, Phone, Star, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';

interface Offer {
  id: string;
  title: string;
  value_number: number | null;
  promo_type: string;
}

interface Partner {
  id: string;
  name: string;
  slug: string;
  lat: number;
  lng: number;
  address: string | null;
  phone: string | null;
  logo_url: string | null;
  cover_url: string | null;
  city: { name: string };
  offers: Offer[];
}

interface PartnerPopupProps {
  partner: Partner;
  userLocation: { lat: number; lng: number } | null;
  onClose: () => void;
}

export function PartnerPopup({ partner, userLocation, onClose }: PartnerPopupProps) {
  const navigate = useNavigate();

  const getBestOffer = () => {
    if (!partner.offers.length) return null;
    
    return partner.offers.reduce((best, current) => {
      if (!best) return current;
      if (current.value_number && best.value_number) {
        return current.value_number > best.value_number ? current : best;
      }
      return current;
    }, partner.offers[0]);
  };

  const calculateDistance = () => {
    if (!userLocation) return null;
    
    const R = 6371; // Earth's radius in km
    const dLat = (partner.lat - userLocation.lat) * Math.PI / 180;
    const dLon = (partner.lng - userLocation.lng) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(userLocation.lat * Math.PI / 180) * Math.cos(partner.lat * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    
    return distance < 1 ? `${Math.round(distance * 1000)}m` : `${distance.toFixed(1)}km`;
  };

  const bestOffer = getBestOffer();
  const distance = calculateDistance();

  const openDirections = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${partner.lat},${partner.lng}`;
    window.open(url, '_blank');
  };

  return (
    <Card className="w-80 shadow-xl border-0 overflow-hidden">
      {partner.cover_url && (
        <div className="h-24 bg-cover bg-center relative" style={{ backgroundImage: `url(${partner.cover_url})` }}>
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        </div>
      )}
      
      <CardContent className="p-4">
        <div className="flex gap-3 mb-3">
          {partner.logo_url && (
            <img
              src={partner.logo_url}
              alt={partner.name}
              className="w-12 h-12 rounded-lg object-cover border-2 border-background shadow-sm"
            />
          )}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-base leading-tight mb-1">
              {partner.name}
            </h3>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <MapPin className="w-3 h-3" />
              <span className="truncate">{partner.city.name}</span>
              {distance && (
                <>
                  <span>•</span>
                  <span>{distance}</span>
                </>
              )}
            </div>
            {partner.phone && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="w-3 h-3" />
                <span>{partner.phone}</span>
              </div>
            )}
          </div>
        </div>

        {bestOffer && (
          <div className="mb-3">
            <Badge variant="secondary" className="text-xs">
              {bestOffer.promo_type === 'percent' 
                ? `-${bestOffer.value_number}%` 
                : bestOffer.title
              }
            </Badge>
          </div>
        )}

        {partner.address && (
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
            {partner.address}
          </p>
        )}

        <div className="flex gap-2">
          <Button 
            size="sm" 
            className="flex-1"
            onClick={() => {
              navigate(`/partner/${partner.slug}`);
              onClose();
            }}
          >
            Voir les offres
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={openDirections}
          >
            <Navigation className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import { Search, Filter, MapPin, Star, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FloatingActionButton } from '@/components/FloatingActionButton';
import { FilterBottomSheet } from '@/components/FilterBottomSheet';
import { BottomNavigation } from '@/components/BottomNavigation';

interface Partner {
  id: string;
  name: string;
  slug: string;
  lat: number | null;
  lng: number | null;
  address: string | null;
  logo_url: string | null;
  cover_url: string | null;
  city: {
    name: string;
  };
  offers: Array<{
    id: string;
    title: string;
    value_number: number | null;
    promo_type: string;
  }>;
}

const mapContainerStyle = {
  width: '100%',
  height: '100vh',
};

const center = {
  lat: -8.409518, // Bali center
  lng: 115.188919,
};

const Map: React.FC = () => {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: 'AIzaSyBFw0Qbyq9zTFTd-tUY6dQTl0JiXk-JvJ0', // This should be replaced with your actual Google Maps API key
  });

  const fetchPartners = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('partners')
        .select(`
          id,
          name,
          slug,
          lat,
          lng,
          address,
          logo_url,
          cover_url,
          cities (name),
          offers (
            id,
            title,
            value_number,
            promo_type
          )
        `)
        .eq('status', 'approved')
        .not('lat', 'is', null)
        .not('lng', 'is', null);

      if (error) {
        console.error('Error fetching partners:', error);
        return;
      }

      const formattedPartners = data?.map(partner => ({
        ...partner,
        city: partner.cities || { name: 'Bali' },
        offers: partner.offers || [],
      })) || [];

      setPartners(formattedPartners);
    } catch (error) {
      console.error('Error:', error);
    }
  }, []);

  useEffect(() => {
    fetchPartners();
  }, [fetchPartners]);

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  }, []);

  const filteredPartners = useMemo(() => {
    if (!searchQuery) return partners;
    
    return partners.filter(partner =>
      partner.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      partner.offers.some(offer => 
        offer.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  }, [partners, searchQuery]);

  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  const centerOnUserLocation = () => {
    if (userLocation && map) {
      map.panTo(userLocation);
      map.setZoom(15);
    }
  };

  const centerOnPartner = (partner: Partner) => {
    if (partner.lat && partner.lng && map) {
      map.panTo({ lat: partner.lat, lng: partner.lng });
      map.setZoom(16);
      setSelectedPartner(partner);
    }
  };

  const getBestOffer = (partner: Partner) => {
    if (!partner.offers.length) return null;
    
    return partner.offers.reduce((best, current) => {
      if (!best) return current;
      if (current.value_number && best.value_number) {
        return current.value_number > best.value_number ? current : best;
      }
      return current;
    }, partner.offers[0]);
  };

  const getMarkerIcon = (partner: Partner) => {
    const bestOffer = getBestOffer(partner);
    const hasOffer = bestOffer && bestOffer.value_number;
    
    return {
      url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
        <svg width="40" height="50" viewBox="0 0 40 50" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 0C8.95 0 0 8.95 0 20C0 35 20 50 20 50S40 35 40 20C40 8.95 31.05 0 20 0Z" fill="#059669"/>
          <circle cx="20" cy="20" r="12" fill="white"/>
          <text x="20" y="26" text-anchor="middle" fill="#059669" font-size="10" font-weight="bold">
            ${hasOffer ? `-${bestOffer.value_number}%` : '★'}
          </text>
        </svg>
      `)}`,
      scaledSize: new google.maps.Size(40, 50),
      anchor: new google.maps.Point(20, 50),
    };
  };

  if (!isLoaded) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <div className="relative h-screen bg-background">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="flex items-center gap-2 p-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher un partenaire ou une offre…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setIsFilterOpen(true)}
          >
            <Filter className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={centerOnUserLocation}
          >
            <MapPin className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Map */}
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={userLocation || center}
        zoom={12}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={{
          disableDefaultUI: true,
          zoomControl: true,
          gestureHandling: 'greedy',
        }}
      >
        {/* User location marker */}
        {userLocation && (
          <Marker
            position={userLocation}
            icon={{
              url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
                <svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="10" cy="10" r="8" fill="#3B82F6" stroke="white" stroke-width="2"/>
                  <circle cx="10" cy="10" r="3" fill="white"/>
                </svg>
              `)}`,
              scaledSize: new google.maps.Size(20, 20),
            }}
          />
        )}

        {/* Partner markers */}
        {filteredPartners.map((partner) => (
          partner.lat && partner.lng && (
            <Marker
              key={partner.id}
              position={{ lat: partner.lat, lng: partner.lng }}
              icon={getMarkerIcon(partner)}
              onClick={() => setSelectedPartner(partner)}
            />
          )
        ))}

        {/* Info window */}
        {selectedPartner && 
         selectedPartner.lat && 
         selectedPartner.lng && 
         typeof selectedPartner.lat === 'number' && 
         typeof selectedPartner.lng === 'number' && (
          <InfoWindow
            position={{ 
              lat: Number(selectedPartner.lat), 
              lng: Number(selectedPartner.lng) 
            }}
            onCloseClick={() => setSelectedPartner(null)}
          >
            <div className="w-64">
              <Card className="border-0 shadow-none">
                <CardContent className="p-3">
                  <div className="flex gap-3">
                    {selectedPartner.logo_url && (
                      <img
                        src={selectedPartner.logo_url}
                        alt={selectedPartner.name}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm truncate">
                        {selectedPartner.name}
                      </h3>
                      <p className="text-xs text-muted-foreground truncate">
                        {selectedPartner.city.name}
                      </p>
                      {getBestOffer(selectedPartner) && (
                        <Badge variant="secondary" className="text-xs mt-1">
                          -{getBestOffer(selectedPartner)?.value_number}%
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    className="w-full mt-3"
                    onClick={() => {
                      // Navigate to partner detail page
                      window.location.href = `/partner/${selectedPartner.slug}`;
                    }}
                  >
                    Voir l'offre
                  </Button>
                </CardContent>
              </Card>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>

      {/* Partners list at bottom */}
      <div className="absolute bottom-20 left-0 right-0 z-10">
        <div className="px-4">
          <div className="flex gap-3 overflow-x-auto pb-2">
            {filteredPartners.slice(0, 10).map((partner) => {
              const bestOffer = getBestOffer(partner);
              return (
                <Card 
                  key={partner.id}
                  className="min-w-[200px] cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => centerOnPartner(partner)}
                >
                  <CardContent className="p-3">
                    <div className="flex gap-2">
                      {partner.logo_url && (
                        <img
                          src={partner.logo_url}
                          alt={partner.name}
                          className="w-10 h-10 rounded object-cover"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm truncate">
                          {partner.name}
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          {partner.city.name}
                        </p>
                        {bestOffer && (
                          <Badge variant="secondary" className="text-xs mt-1">
                            -{bestOffer.value_number}%
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>

      {/* Filter bottom sheet */}
      <FilterBottomSheet
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
      />

      {/* Floating QR button */}
      <FloatingActionButton />

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
};

export default Map;
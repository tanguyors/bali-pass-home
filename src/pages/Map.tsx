import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Search, Filter, MapPin, Star, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FloatingActionButton } from '@/components/FloatingActionButton';
import { FilterBottomSheet } from '@/components/FilterBottomSheet';
import { BottomNavigation } from '@/components/BottomNavigation';
import { useCapacitorMap } from '@/hooks/useCapacitorMap';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface Partner {
  id: string;
  name: string;
  slug: string;
  lat: number | null;
  lng: number | null;
  address: string | null;
  phone: string | null;
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
  const [markerIds, setMarkerIds] = useState<Record<string, string>>({});

  const {
    mapRef,
    map,
    isLoaded,
    addMarker,
    clearMarkers,
    panTo,
    setOnMarkerClickListener,
  } = useCapacitorMap({
    center: userLocation || center,
    zoom: 12,
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
          phone,
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

  const centerOnUserLocation = useCallback(() => {
    if (userLocation) {
      panTo(userLocation, 15);
    }
  }, [userLocation, panTo]);

  const centerOnPartner = useCallback((partner: Partner) => {
    if (partner.lat && partner.lng) {
      panTo({ lat: partner.lat, lng: partner.lng }, 16);
      setSelectedPartner(partner);
    }
  }, [panTo]);

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

  // Add markers when partners are loaded and map is ready
  useEffect(() => {
    if (!isLoaded || !map || !filteredPartners.length) return;

    const addMarkersToMap = async () => {
      // Clear existing markers
      await clearMarkers();
      const newMarkerIds: Record<string, string> = {};

      // Add user location marker if available
      if (userLocation) {
        const userMarkerId = await addMarker({
          coordinate: userLocation,
          title: 'Ma position',
        });
        newMarkerIds['user-location'] = userMarkerId;
      }

      // Add partner markers
      for (const partner of filteredPartners) {
        if (partner.lat && partner.lng) {
          const bestOffer = getBestOffer(partner);
          const markerId = await addMarker({
            coordinate: { lat: partner.lat, lng: partner.lng },
            title: partner.name,
            snippet: bestOffer ? `Offre: -${bestOffer.value_number}%` : 'Partenaire',
          });
          newMarkerIds[partner.id] = markerId;
        }
      }

      setMarkerIds(newMarkerIds);
    };

    addMarkersToMap();
  }, [isLoaded, map, filteredPartners, userLocation, addMarker, clearMarkers]);

  // Set marker click listener
  useEffect(() => {
    if (!isLoaded || !map) return;

    setOnMarkerClickListener((markerId) => {
      const partner = filteredPartners.find(p => markerIds[p.id] === markerId);
      if (partner) {
        setSelectedPartner(partner);
      }
    });
  }, [isLoaded, map, filteredPartners, markerIds, setOnMarkerClickListener]);

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement de la carte...</p>
        </div>
      </div>
    );
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

      {/* Map Container */}
      <div className="w-full h-full pt-20 pb-20">
        <div 
          ref={mapRef}
          style={{
            display: 'inline-block',
            width: '100%',
            height: '100%',
          }}
        />
      </div>

      {/* Partners list at bottom */}
      <div className="absolute bottom-20 left-0 right-0 z-10">
        <div className="px-4">
          <div className="flex gap-3 overflow-x-auto pb-2">
            {filteredPartners.slice(0, 10).map((partner) => {
              const bestOffer = getBestOffer(partner);
              return (
                <Card 
                  key={partner.id}
                  className="min-w-[200px] cursor-pointer hover:shadow-lg transition-shadow bg-card/95 backdrop-blur-sm"
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

      {/* Partner Details Dialog */}
      <Dialog open={!!selectedPartner} onOpenChange={() => setSelectedPartner(null)}>
        <DialogContent className="w-[90%] max-w-md">
          {selectedPartner && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedPartner.name}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex gap-3">
                  {selectedPartner.logo_url && (
                    <img
                      src={selectedPartner.logo_url}
                      alt={selectedPartner.name}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                  )}
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">
                      📍 {selectedPartner.city.name}
                    </p>
                    {selectedPartner.address && (
                      <p className="text-sm text-muted-foreground">
                        {selectedPartner.address}
                      </p>
                    )}
                    {selectedPartner.phone && (
                      <p className="text-sm text-muted-foreground">
                        📞 {selectedPartner.phone}
                      </p>
                    )}
                  </div>
                </div>
                
                {getBestOffer(selectedPartner) && (
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <p className="text-sm font-medium">Meilleure offre</p>
                    <Badge variant="default" className="mt-1">
                      -{getBestOffer(selectedPartner)?.value_number}%
                    </Badge>
                  </div>
                )}
                
                <Button 
                  className="w-full"
                  onClick={() => {
                    window.location.href = `/partner/${selectedPartner.slug}`;
                  }}
                >
                  Voir l'offre
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

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
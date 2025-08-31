import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MapControls } from '@/components/MapControls';
import { PartnerPopup } from '@/components/PartnerPopup';
import { MapFilters, MapFilters as MapFiltersType } from '@/components/MapFilters';
import { BottomNavigation } from '@/components/BottomNavigation';
import { FloatingActionButton } from '@/components/FloatingActionButton';
import { supabase } from '@/integrations/supabase/client';
import { useGeolocation } from '@/hooks/useGeolocation';

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

const Map = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const popupRef = useRef<mapboxgl.Popup | null>(null);

  const [mapboxToken, setMapboxToken] = useState<string>('');
  const [partners, setPartners] = useState<Partner[]>([]);
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState<MapFiltersType>({
    categories: [],
    maxDistance: null,
    hasOffers: false
  });

  const { latitude, longitude, error: locationError } = useGeolocation();
  const userLocation = latitude && longitude ? { lat: latitude, lng: longitude } : null;

  // Fetch Mapbox token
  useEffect(() => {
    const fetchMapboxToken = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('get-mapbox-token');
        if (error) throw error;
        setMapboxToken(data.token);
      } catch (error) {
        console.error('Error fetching Mapbox token:', error);
      }
    };

    fetchMapboxToken();
  }, []);

  // Fetch partners
  useEffect(() => {
    const fetchPartners = async () => {
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
    };

    fetchPartners();
  }, []);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || !mapboxToken) return;

    mapboxgl.accessToken = mapboxToken;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: userLocation ? [userLocation.lng, userLocation.lat] : [115.188919, -8.409518],
      zoom: userLocation ? 13 : 9,
      pitch: 0,
      bearing: 0
    });

    // Add navigation controls
    map.current.addControl(
      new mapboxgl.NavigationControl({
        showCompass: true,
        showZoom: false
      }),
      'top-right'
    );

    // Add user location marker if available
    if (userLocation) {
      new mapboxgl.Marker({
        color: '#3B82F6',
        scale: 0.8
      })
        .setLngLat([userLocation.lng, userLocation.lat])
        .addTo(map.current);
    }

    return () => {
      map.current?.remove();
    };
  }, [mapboxToken, userLocation]);

  // Filter partners based on search and filters
  const filteredPartners = useMemo(() => {
    let filtered = partners;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(partner =>
        partner.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        partner.offers.some(offer => 
          offer.title.toLowerCase().includes(searchQuery.toLowerCase())
        ) ||
        partner.city.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Category filter
    if (filters.categories.length > 0) {
      // This would need category info in partner data
      // For now, we'll keep all partners
    }

    // Distance filter
    if (userLocation && filters.maxDistance) {
      filtered = filtered.filter(partner => {
        const distance = calculateDistance(
          userLocation.lat, 
          userLocation.lng, 
          partner.lat, 
          partner.lng
        );
        return distance <= filters.maxDistance!;
      });
    }

    // Offers filter
    if (filters.hasOffers) {
      filtered = filtered.filter(partner => partner.offers.length > 0);
    }

    return filtered;
  }, [partners, searchQuery, filters, userLocation]);

  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Update markers when partners change
  useEffect(() => {
    if (!map.current) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Add new markers
    filteredPartners.forEach(partner => {
      const bestOffer = partner.offers.reduce((best, current) => {
        if (!best) return current;
        if (current.value_number && best.value_number) {
          return current.value_number > best.value_number ? current : best;
        }
        return current;
      }, partner.offers[0]);

      // Create custom marker element
      const el = document.createElement('div');
      el.className = 'w-10 h-10 cursor-pointer transition-transform hover:scale-110';
      el.innerHTML = `
        <div class="relative">
          <div class="w-10 h-10 bg-primary rounded-full border-2 border-background shadow-lg flex items-center justify-center">
            <span class="text-xs font-bold text-primary-foreground">
              ${bestOffer?.value_number ? `-${bestOffer.value_number}%` : '★'}
            </span>
          </div>
          ${partner.offers.length > 0 ? '<div class="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full"></div>' : ''}
        </div>
      `;

      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([partner.lng, partner.lat])
        .addTo(map.current!);

      // Add click handler
      el.addEventListener('click', () => {
        setSelectedPartner(partner);
        map.current?.flyTo({
          center: [partner.lng, partner.lat],
          zoom: 15,
          duration: 1000
        });
      });

      markersRef.current.push(marker);
    });
  }, [filteredPartners]);

  const handleZoomIn = useCallback(() => {
    map.current?.zoomIn();
  }, []);

  const handleZoomOut = useCallback(() => {
    map.current?.zoomOut();
  }, []);

  const handleLocationClick = useCallback(() => {
    if (userLocation && map.current) {
      map.current.flyTo({
        center: [userLocation.lng, userLocation.lat],
        zoom: 15,
        duration: 1000
      });
    }
  }, [userLocation]);

  const activeFiltersCount = filters.categories.length + 
    (filters.hasOffers ? 1 : 0) + 
    (filters.maxDistance && filters.maxDistance < 50 ? 1 : 0);

  return (
    <div className="relative h-screen bg-background overflow-hidden">
      {/* Map container */}
      <div ref={mapContainer} className="absolute inset-0" />

      {/* Map controls */}
      <MapControls
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onFilterClick={() => setIsFilterOpen(true)}
        onLocationClick={handleLocationClick}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        activeFilters={activeFiltersCount}
        userLocation={userLocation}
      />

      {/* Partner popup */}
      {selectedPartner && (
        <div className="absolute inset-x-4 bottom-32 z-40 flex justify-center">
          <PartnerPopup
            partner={selectedPartner}
            userLocation={userLocation}
            onClose={() => setSelectedPartner(null)}
          />
        </div>
      )}

      {/* Location error */}
      {locationError && (
        <div className="absolute top-20 left-4 right-4 z-40">
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
            <p className="text-sm text-orange-700">
              📍 Géolocalisation non disponible. Les fonctionnalités de proximité sont désactivées.
            </p>
          </div>
        </div>
      )}

      {/* Results counter */}
      <div className="absolute bottom-24 left-4 z-40">
        <div className="bg-background/95 backdrop-blur-sm border border-border rounded-full px-3 py-1 shadow-sm">
          <p className="text-xs text-muted-foreground">
            {filteredPartners.length} partenaire{filteredPartners.length !== 1 ? 's' : ''}
            {searchQuery && ` pour "${searchQuery}"`}
          </p>
        </div>
      </div>

      {/* Map filters */}
      <MapFilters
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        onFiltersChange={setFilters}
        userLocation={userLocation}
      />

      {/* Floating Action Button */}
      <FloatingActionButton />

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
};

export default Map;

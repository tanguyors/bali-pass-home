import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useGeolocation } from './useGeolocation';

export interface Offer {
  id: string;
  title: string;
  short_desc: string | null;
  long_desc: string | null;
  value_text: string | null;
  promo_type: string;
  value_number: number | null;
  is_featured: boolean;
  partner: {
    id: string;
    name: string;
    address: string | null;
    phone: string | null;
    photos: string[] | null;
    lat: number | null;
    lng: number | null;
  };
  category: {
    id: string;
    name: string;
    icon: string | null;
  };
  distance?: number;
  isFavorite?: boolean;
}

export interface FiltersType {
  category: string | null;
  city: string | null;
  sortBy: 'relevance' | 'distance' | 'discount' | 'newest';
  maxDistance: number | null;
}

export function useOffers() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FiltersType>({
    category: null,
    city: null,
    sortBy: 'relevance',
    maxDistance: null,
  });
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  
  const { latitude, longitude, calculateDistance } = useGeolocation();
  const pageSize = 20;

  // Fetch user favorites
  const fetchFavorites = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('favorites')
        .select('offer_id')
        .eq('user_id', user.id);

      if (data) {
        setFavorites(new Set(data.map(fav => fav.offer_id)));
      }
    } catch (error) {
      console.error('Error fetching favorites:', error);
    }
  }, []);

  // Fetch offers
  const fetchOffers = useCallback(async (reset = false) => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('offers')
        .select(`
          id,
          title,
          short_desc,
          long_desc,
          value_text,
          promo_type,
          value_number,
          is_featured,
          partner:partners(id, name, address, phone, photos, lat, lng, city_id),
          category:categories(id, name, icon)
        `)
        .eq('is_active', true);

      // Apply search filter
      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,short_desc.ilike.%${searchQuery}%`);
      }

      // Apply category filter
      if (filters.category) {
        query = query.eq('category_id', filters.category);
      }

      // Note: City filter will be applied after data fetching since we need to join with partners

      // Pagination
      const currentPage = reset ? 0 : page;
      const from = currentPage * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to);

      const { data, error } = await query;

      if (error) {
        setError(error.message);
        return;
      }

      if (data) {
        // Apply city filter if specified
        let filteredData = data;
        if (filters.city) {
          // First fetch the partners in the specified city
          const { data: cityPartners } = await supabase
            .from('partners')
            .select('id')
            .eq('city_id', filters.city)
            .eq('status', 'approved');
          
          const partnerIds = cityPartners?.map(p => p.id) || [];
          filteredData = data.filter(offer => 
            offer.partner && partnerIds.includes(offer.partner.id)
          );
        }

        // Calculate distances if geolocation is available
        const offersWithDistance = filteredData.map(offer => ({
          ...offer,
          distance: (latitude && longitude && offer.partner?.lat && offer.partner?.lng)
            ? calculateDistance(latitude, longitude, offer.partner.lat, offer.partner.lng)
            : undefined,
          isFavorite: favorites.has(offer.id),
        }));

        // Apply distance filter
        let filteredOffers = offersWithDistance;
        if (filters.maxDistance && latitude && longitude) {
          filteredOffers = offersWithDistance.filter(offer => 
            offer.distance === undefined || offer.distance <= filters.maxDistance!
          );
        }

        // Apply sorting with VIP priority by default
        filteredOffers.sort((a, b) => {
          // If no filters are applied (default state), prioritize featured offers
          const isDefaultState = !filters.category && !searchQuery && filters.sortBy === 'relevance';
          
          if (isDefaultState) {
            // Featured offers first
            if (a.is_featured && !b.is_featured) return -1;
            if (!a.is_featured && b.is_featured) return 1;
          }
          
          // Then apply the selected sorting
          switch (filters.sortBy) {
            case 'distance':
              if (a.distance === undefined) return 1;
              if (b.distance === undefined) return -1;
              return a.distance - b.distance;
            case 'discount':
              const aDiscount = a.value_number || 0;
              const bDiscount = b.value_number || 0;
              return bDiscount - aDiscount;
            case 'newest':
              return b.id.localeCompare(a.id);
            case 'relevance':
            default:
              return 0;
          }
        });

        if (reset) {
          setOffers(filteredOffers);
          setPage(1);
        } else {
          setOffers(prev => [...prev, ...filteredOffers]);
          setPage(prev => prev + 1);
        }

        setHasMore(data.length === pageSize);
      }
    } catch (error) {
      setError('Une erreur s\'est produite lors du chargement des offres');
      console.error('Error fetching offers:', error);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, filters, page, latitude, longitude, calculateDistance, favorites, pageSize]);

  // Toggle favorite
  const toggleFavorite = useCallback(async (offerId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const isFavorite = favorites.has(offerId);

      if (isFavorite) {
        await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('offer_id', offerId);
        
        setFavorites(prev => {
          const newSet = new Set(prev);
          newSet.delete(offerId);
          return newSet;
        });
      } else {
        await supabase
          .from('favorites')
          .insert({ user_id: user.id, offer_id: offerId });
        
        setFavorites(prev => new Set([...prev, offerId]));
      }

      // Update offers list
      setOffers(prev => prev.map(offer => 
        offer.id === offerId 
          ? { ...offer, isFavorite: !isFavorite }
          : offer
      ));
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  }, [favorites]);

  // Load more offers
  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      fetchOffers(false);
    }
  }, [loading, hasMore, fetchOffers]);

  // Reset and fetch
  const refreshOffers = useCallback(() => {
    setPage(0);
    fetchOffers(true);
  }, [fetchOffers]);

  // Effects
  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      refreshOffers();
    }, 300); // Debounce search

    return () => clearTimeout(timeoutId);
  }, [searchQuery, filters]);

  // Update favorites in offers when favorites change
  useEffect(() => {
    setOffers(prev => prev.map(offer => ({
      ...offer,
      isFavorite: favorites.has(offer.id)
    })));
  }, [favorites]);

  return {
    offers,
    loading,
    error,
    hasMore,
    searchQuery,
    setSearchQuery,
    filters,
    setFilters,
    toggleFavorite,
    loadMore,
    refreshOffers,
  };
}
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { SearchHeader } from '@/components/SearchHeader';
import { OffersList } from '@/components/OffersList';
import { BottomNavigation } from '@/components/BottomNavigation';
import { FloatingActionButton } from '@/components/FloatingActionButton';
import { FilterBottomSheet } from '@/components/FilterBottomSheet';
import { useOffers } from '@/hooks/useOffers';
import { useGeolocation } from '@/hooks/useGeolocation';

interface Category {
  id: string;
  name: string;
  icon: string;
}

const Explorer = () => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [categories, setCategories] = useState<Category[]>([]);
  
  const { latitude, longitude, error: locationError } = useGeolocation();
  
  const {
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
  } = useOffers();

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase
          .from('categories')
          .select('id, name, icon')
          .order('name');

        if (error) {
          console.error('Error fetching categories:', error);
          return;
        }

        if (data) {
          setCategories(data.map(cat => ({
            ...cat,
            icon: cat.icon || '📂'
          })));
        }
      } catch (error) {
        console.error('Error:', error);
      }
    };

    fetchCategories();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Search Header */}
      <SearchHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        filters={filters}
        onFiltersChange={setFilters}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onFilterClick={() => setIsFilterOpen(true)}
        categories={categories}
        resultsCount={offers.length}
        userLocation={latitude && longitude ? { latitude, longitude } : null}
      />

      {/* Location error message */}
      {locationError && (
        <div className="px-4 py-2 bg-orange-50 border-b border-orange-200">
          <p className="text-xs text-orange-600">
            📍 Géolocalisation non disponible. Les fonctionnalités de proximité sont désactivées.
          </p>
        </div>
      )}
      
      {/* Main Content */}
      <main className="pb-20 pt-4">
        <OffersList
          offers={offers}
          loading={loading}
          hasMore={hasMore}
          onLoadMore={loadMore}
          onToggleFavorite={toggleFavorite}
          viewMode={viewMode}
          error={error}
        />
      </main>
      
      {/* Filter Bottom Sheet */}
      <FilterBottomSheet 
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
      />
      
      {/* Floating Action Button */}
      <FloatingActionButton />
      
      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
};

export default Explorer;
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { OffersList } from '@/components/OffersList';
import { BottomNavigation } from '@/components/BottomNavigation';
import { FloatingActionButton } from '@/components/FloatingActionButton';
import { FilterSheet, FilterState } from '@/components/FilterSheet';
import { SimpleFilter } from '@/components/SimpleFilter';
import { Button } from '@/components/ui/button';
import { Grid3X3, List } from 'lucide-react';
import { useOffers } from '@/hooks/useOffers';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useLanguage } from '@/contexts/LanguageContext';

interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
}

interface City {
  id: string;
  name: string;
}

const Explorer = () => {
  const [searchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [categories, setCategories] = useState<Category[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const isNearbyMode = searchParams.get('nearby') === 'true';
  const categoryFromUrl = searchParams.get('category');
  
  const [currentFilters, setCurrentFilters] = useState<FilterState>({
    city: '',
    category: '',
    sortBy: isNearbyMode ? 'distance' : 'relevance',
    distance: isNearbyMode ? 10 : undefined
  });
  const { t } = useLanguage();
  
  const { latitude, longitude, error: locationError, loading: locationLoading } = useGeolocation();
  
  const {
    offers,
    loading,
    error,
    hasMore,
    filters,
    setFilters,
    toggleFavorite,
    loadMore,
  } = useOffers(latitude, longitude);

  // Fetch categories and cities
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase
          .from('categories')
          .select('id, name, slug, icon')
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

    const fetchCities = async () => {
      try {
        const { data, error } = await supabase
          .from('cities')
          .select('id, name')
          .order('name');

        if (error) {
          console.error('Error fetching cities:', error);
          return;
        }

        if (data) {
          setCities(data);
        }
      } catch (error) {
        console.error('Error:', error);
      }
    };

    fetchCategories();
    fetchCities();
  }, []);

  // Apply category filter from URL when categories are loaded
  useEffect(() => {
    if (categoryFromUrl && categories.length > 0) {
      // Find category by slug
      const category = categories.find(cat => cat.slug === categoryFromUrl);
      if (category) {
        const newFilters = { ...currentFilters, category: category.id };
        setCurrentFilters(newFilters);
        setFilters({
          category: category.id,
          city: null,
          sortBy: 'relevance',
          maxDistance: null,
        });
      }
    }
  }, [categoryFromUrl, categories]);

  // Apply initial filters when component mounts or nearby mode changes
  useEffect(() => {
    if (isNearbyMode && !categoryFromUrl) {
      setFilters({
        category: null,
        city: null,
        sortBy: 'distance',
        maxDistance: 10,
      });
    }
  }, [isNearbyMode, setFilters, categoryFromUrl]);

  const handleApplyFilters = (newFilters: FilterState) => {
    setCurrentFilters(newFilters);
    // Apply filters to the useOffers hook
    setFilters({
      category: newFilters.category || null,
      city: newFilters.city || null,
      sortBy: newFilters.sortBy as "relevance" | "newest" | "distance" | "discount",
      maxDistance: newFilters.distance || null,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Location error message */}
      {locationError && (
        <div className="px-4 py-2 bg-orange-50 border-b border-orange-200">
          <p className="text-xs text-orange-600">
            {t('explorer.location_not_available')}
          </p>
        </div>
      )}
      
      {/* Main Content */}
      <main className="pb-20">
        {/* Header Section */}
        <div className="px-4 pt-6 pb-4 bg-background">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-2">
              {isNearbyMode ? t('explorer.nearby_offers') : t('explorer.discover_offers')}
            </h1>
            {isNearbyMode && (
              <div className="inline-flex items-center gap-2 mb-2">
                <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-medium">
                  📍 {t('explorer.nearby_mode')} (10km)
                </div>
              </div>
            )}
            <p className="text-muted-foreground text-sm">
              {isNearbyMode ? t('explorer.nearby_subtitle') : t('explorer.discover_subtitle')}
            </p>
          </div>
        </div>
        
        {/* Simple Category Filter */}
        <SimpleFilter
          categories={categories}
          cities={cities}
          selectedCategory={currentFilters.category}
          selectedCity={currentFilters.city}
          onCategoryChange={(categoryId) => {
            const newFilters = { ...currentFilters, category: categoryId || '' };
            handleApplyFilters(newFilters);
          }}
          onCityChange={(cityId) => {
            const newFilters = { ...currentFilters, city: cityId || '' };
            handleApplyFilters(newFilters);
          }}
          offersCount={offers.length}
        />
        
        {/* View Mode Toggle */}
        <div className="px-4 py-3 bg-muted/30 border-b border-border">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-foreground">
              {t('simple_filter.results')}
            </h3>
            <div className="flex bg-background rounded-lg border border-border overflow-hidden">
              <Button
                variant={viewMode === 'grid' ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="rounded-none border-r border-border"
              >
                <Grid3X3 className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode('list')}
                className="rounded-none"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
        
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
      
      {/* Floating Action Button */}
      <FloatingActionButton />
      
      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
};

export default Explorer;
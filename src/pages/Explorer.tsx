import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { SearchHeader } from '@/components/SearchHeader';
import { OffersList } from '@/components/OffersList';
import { BottomNavigation } from '@/components/BottomNavigation';
import { FloatingActionButton } from '@/components/FloatingActionButton';
import { FilterSheet, FilterState } from '@/components/FilterSheet';
import { SimpleFilter } from '@/components/SimpleFilter';
import { SimpleSearch } from '@/components/SimpleSearch';
import { PartnerCard } from '@/components/PartnerCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Grid3X3, List } from 'lucide-react';
import { useOffers } from '@/hooks/useOffers';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useLanguage } from '@/contexts/LanguageContext';

interface Category {
  id: string;
  name: string;
  icon: string;
}

interface Partner {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logo_url?: string;
  cover_url?: string;
  address?: string;
  cities?: {
    name: string;
  };
  offers?: Array<{
    id: string;
    title: string;
    value_text?: string;
    is_active: boolean;
  }>;
}

const Explorer = () => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [categories, setCategories] = useState<Category[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [partnersLoading, setPartnersLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('offers');
  const [currentFilters, setCurrentFilters] = useState<FilterState>({
    city: '',
    category: '',
    sortBy: 'relevance',
    distance: undefined
  });
  const { t } = useLanguage();
  
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

  // Fetch partners
  const fetchPartners = async () => {
    setPartnersLoading(true);
    try {
      const { data, error } = await supabase
        .from('partners')
        .select(`
          id,
          name,
          slug,
          description,
          logo_url,
          cover_url,
          address,
          cities (
            name
          ),
          offers (
            id,
            title,
            value_text,
            is_active
          )
        `)
        .eq('status', 'approved')
        .order('name');

      if (error) {
        console.error('Error fetching partners:', error);
        return;
      }

      setPartners(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setPartnersLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'partners') {
      fetchPartners();
    }
  }, [activeTab]);

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
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          {/* Tabs Header */}
          <div className="px-4 pt-4 pb-2 bg-background border-b border-border">
            <TabsList className="grid w-full grid-cols-2 h-12 bg-muted rounded-xl">
              <TabsTrigger 
                value="offers" 
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-lg font-semibold"
              >
                {t('explorer.offers')}
              </TabsTrigger>
              <TabsTrigger 
                value="partners" 
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-lg font-semibold"
              >
                {t('explorer.partners')}
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Offers Tab */}
          <TabsContent value="offers" className="mt-0">
            {/* Simple Search */}
            <SimpleSearch
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
            />
            
            {/* Simple Category Filter */}
            <SimpleFilter
              categories={categories}
              selectedCategory={currentFilters.category}
              onCategoryChange={(categoryId) => {
                const newFilters = { ...currentFilters, category: categoryId || '' };
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
          </TabsContent>

          {/* Partners Tab */}
          <TabsContent value="partners" className="mt-0">
            <div className="px-4 pt-4">
              {partnersLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-sm text-muted-foreground">{t('explorer.loading_partners')}</p>
                  </div>
                </div>
              ) : partners.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground mb-4">{t('explorer.no_partners')}</p>
                </div>
              ) : (
                <div className={viewMode === 'grid' 
                  ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4' 
                  : 'space-y-4'
                }>
                  {partners.map((partner) => (
                    <PartnerCard
                      key={partner.id}
                      partner={partner}
                      viewMode={viewMode}
                    />
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>
      
      {/* Floating Action Button */}
      <FloatingActionButton />
      
      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
};

export default Explorer;
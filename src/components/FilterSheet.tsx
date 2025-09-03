import React, { useEffect, useState } from 'react';
import { X, MapPin, Tag, TrendingUp, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { FilterChip } from './FilterChip';
import { FilterSegmentControl } from './FilterSegmentControl';
import { useLanguage } from '@/contexts/LanguageContext';

interface FilterSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilters: (filters: FilterState) => void;
  currentFilters: FilterState;
}

export interface FilterState {
  city: string;
  category: string;
  sortBy: string;
  distance?: number;
}

interface City {
  id: string;
  name: string;
  slug: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string;
}

export const FilterSheet: React.FC<FilterSheetProps> = ({
  isOpen,
  onClose,
  onApplyFilters,
  currentFilters
}) => {
  const { t } = useLanguage();
  const [cities, setCities] = useState<City[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tempFilters, setTempFilters] = useState<FilterState>(currentFilters);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchFilterData();
      setTempFilters(currentFilters);
    }
  }, [isOpen, currentFilters]);

  const fetchFilterData = async () => {
    setLoading(true);
    try {
      const [citiesResult, categoriesResult] = await Promise.all([
        supabase
          .from('cities')
          .select('id, name, slug')
          .order('name', { ascending: true }),
        supabase
          .from('categories')
          .select('id, name, slug, icon')
          .order('name', { ascending: true })
      ]);

      if (citiesResult.data) setCities(citiesResult.data);
      if (categoriesResult.data) setCategories(categoriesResult.data);
    } catch (error) {
      console.error('Error fetching filter data:', error);
    } finally {
      setLoading(false);
    }
  };

  const sortOptions = [
    { id: 'relevance', label: t('explorer.relevance'), icon: '⭐' },
    { id: 'newest', label: t('explorer.newest'), icon: '🆕' },
    { id: 'distance', label: t('explorer.distance'), icon: '📍' },
    { id: 'discount', label: t('explorer.price'), icon: '💰' }
  ];

  const distanceOptions = [
    { id: '', label: t('explorer.all_distances'), icon: '🌍' },
    { id: '5', label: '5 km', icon: '🚶' },
    { id: '10', label: '10 km', icon: '🚴' },
    { id: '25', label: '25 km', icon: '🚗' }
  ];

  const handleApply = () => {
    onApplyFilters(tempFilters);
    onClose();
  };

  const handleClear = () => {
    const clearedFilters = {
      city: '',
      category: '',
      sortBy: 'relevance',
      distance: undefined
    };
    setTempFilters(clearedFilters);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (tempFilters.city) count++;
    if (tempFilters.category) count++;
    if (tempFilters.sortBy !== 'relevance') count++;
    if (tempFilters.distance) count++;
    return count;
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl border-0 bg-background/95 backdrop-blur-xl">
        <div className="flex flex-col h-full">
          {/* Header */}
          <SheetHeader className="flex-shrink-0 pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <SlidersHorizontal className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <SheetTitle className="text-xl font-bold">
                    {t('filter.title')}
                  </SheetTitle>
                  {getActiveFiltersCount() > 0 && (
                  <p className="text-sm text-muted-foreground">
                    {getActiveFiltersCount()} {t('filter.active_filters')}
                  </p>
                  )}
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="w-10 h-10 rounded-full"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </SheetHeader>

          <Separator className="mb-6" />

          {/* Content */}
          <ScrollArea className="flex-1 pr-4">
            <div className="space-y-8">
              {/* Sort By */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-semibold">{t('filter.sort_by')}</h3>
                </div>
                <FilterSegmentControl
                  options={sortOptions}
                  selectedId={tempFilters.sortBy}
                  onSelectionChange={(id) => setTempFilters(prev => ({ ...prev, sortBy: id }))}
                />
              </div>

              {/* Location */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-semibold">{t('filter.location')}</h3>
                </div>
                
                {/* Distance */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-muted-foreground">
                    {t('filter.distance')}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {distanceOptions.map((option) => (
                      <FilterChip
                        key={option.id}
                        label={option.label}
                        icon={option.icon}
                        isSelected={tempFilters.distance?.toString() === option.id}
                        onClick={() => setTempFilters(prev => ({ 
                          ...prev, 
                          distance: option.id ? parseInt(option.id) : undefined 
                        }))}
                        variant="compact"
                      />
                    ))}
                  </div>
                </div>

                {/* Cities */}
                {cities.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-muted-foreground">
                      {t('filter.city')}
                    </h4>
                    {loading ? (
                      <div className="flex items-center justify-center py-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        <FilterChip
                          label={t('filter.all_cities')}
                          icon="🏙️"
                          isSelected={!tempFilters.city}
                          onClick={() => setTempFilters(prev => ({ ...prev, city: '' }))}
                          variant="compact"
                        />
                        {cities.map((city) => (
                          <FilterChip
                            key={city.id}
                            label={city.name}
                            icon="📍"
                            isSelected={tempFilters.city === city.id}
                            onClick={() => setTempFilters(prev => ({ ...prev, city: city.id }))}
                            variant="compact"
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Categories */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Tag className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-semibold">{t('filter.category')}</h3>
                </div>
                
                {loading ? (
                  <div className="flex items-center justify-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    <FilterChip
                      label={t('filter.all_categories')}
                      icon="📂"
                      isSelected={!tempFilters.category}
                      onClick={() => setTempFilters(prev => ({ ...prev, category: '' }))}
                      variant="compact"
                    />
                    {categories.map((category) => (
                      <FilterChip
                        key={category.id}
                        label={category.name}
                        icon={category.icon || '📄'}
                        isSelected={tempFilters.category === category.id}
                        onClick={() => setTempFilters(prev => ({ ...prev, category: category.id }))}
                        variant="compact"
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </ScrollArea>

          {/* Footer Actions */}
          <div className="flex-shrink-0 pt-6">
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleClear}
                className="flex-1 h-12 rounded-full font-medium"
                disabled={getActiveFiltersCount() === 0}
              >
                {t('filter.clear_all')}
              </Button>
              <Button
                onClick={handleApply}
                className="flex-1 h-12 rounded-full font-medium bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
              >
                {t('filter.apply_filters')}
                {getActiveFiltersCount() > 0 && (
                  <span className="ml-2 px-2 py-0.5 bg-white/20 rounded-full text-xs">
                    {getActiveFiltersCount()}
                  </span>
                )}
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
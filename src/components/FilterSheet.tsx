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
      <SheetContent side="bottom" className="h-[90vh] rounded-t-3xl border-0 bg-background/95 backdrop-blur-xl p-0">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex-shrink-0 p-4 pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <SlidersHorizontal className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-bold">{t('filter.title')}</h2>
                  {getActiveFiltersCount() > 0 && (
                    <p className="text-xs text-muted-foreground">
                      {getActiveFiltersCount()} {t('filter.active_filters')}
                    </p>
                  )}
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="w-8 h-8 rounded-full"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <Separator className="mx-4 mb-2" />

          {/* Content */}
          <ScrollArea className="flex-1 px-4">
            <div className="space-y-6 pb-4">
              {/* Sort By */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  <h3 className="text-base font-semibold">{t('filter.sort_by')}</h3>
                </div>
                <FilterSegmentControl
                  options={sortOptions}
                  selectedId={tempFilters.sortBy}
                  onSelectionChange={(id) => setTempFilters(prev => ({ ...prev, sortBy: id }))}
                />
              </div>

              {/* Location */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary" />
                  <h3 className="text-base font-semibold">{t('filter.location')}</h3>
                </div>
                
                {/* Distance */}
                <div className="space-y-2">
                  <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    {t('filter.distance')}
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
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
                  <div className="space-y-2">
                    <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      {t('filter.city')}
                    </h4>
                    {loading ? (
                      <div className="flex items-center justify-center py-4">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
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
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-primary" />
                  <h3 className="text-base font-semibold">{t('filter.category')}</h3>
                </div>
                
                {loading ? (
                  <div className="flex items-center justify-center py-4">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
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
          <div className="flex-shrink-0 p-4 pt-2">
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleClear}
                className="flex-1 h-11 rounded-full font-medium text-sm"
                disabled={getActiveFiltersCount() === 0}
              >
                {t('filter.clear_all')}
              </Button>
              <Button
                onClick={handleApply}
                className="flex-1 h-11 rounded-full font-medium text-sm bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
              >
                {t('filter.apply_filters')}
                {getActiveFiltersCount() > 0 && (
                  <span className="ml-1.5 px-1.5 py-0.5 bg-white/20 rounded-full text-xs font-bold">
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
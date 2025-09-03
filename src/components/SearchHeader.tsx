import { useState } from 'react';
import { Search, Filter, Grid3X3, List, MapPin } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FiltersType } from '@/hooks/useOffers';
import { useLanguage } from '@/contexts/LanguageContext';

interface SearchHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filters: FiltersType;
  onFiltersChange: (filters: FiltersType) => void;
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  onFilterClick: () => void;
  categories: Array<{ id: string; name: string; icon: string }>;
  resultsCount: number;
  userLocation: { latitude: number; longitude: number } | null;
}

export function SearchHeader({
  searchQuery,
  onSearchChange,
  filters,
  onFiltersChange,
  viewMode,
  onViewModeChange,
  onFilterClick,
  categories,
  resultsCount,
  userLocation
}: SearchHeaderProps) {
  const { t } = useLanguage();
  
  const activeFiltersCount = [
    filters.category,
    filters.city,
    filters.maxDistance,
    filters.sortBy !== 'relevance' ? filters.sortBy : null
  ].filter(Boolean).length;

  const selectedCategory = categories.find(cat => cat.id === filters.category);

  return (
    <div className="sticky top-0 z-40 bg-background border-b border-border">
      {/* Main search bar */}
      <div className="flex items-center gap-3 h-14 px-4">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder={t('explorer.search_placeholder')}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 pr-4 h-10 rounded-full border-border bg-background shadow-sm"
          />
        </div>
        
        {/* Filter Button */}
        <Button
          variant="outline"
          size="icon"
          onClick={onFilterClick}
          className="w-10 h-10 rounded-full bg-background shadow-sm border-border hover:bg-muted relative"
        >
          <Filter className="w-4 h-4" />
          {activeFiltersCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 w-5 h-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {activeFiltersCount}
            </Badge>
          )}
        </Button>

        {/* View Mode Toggle */}
        <div className="flex rounded-full border border-border bg-background overflow-hidden">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onViewModeChange('grid')}
            className={`w-8 h-8 p-0 rounded-none ${
              viewMode === 'grid' ? 'bg-muted' : ''
            }`}
          >
            <Grid3X3 className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onViewModeChange('list')}
            className={`w-8 h-8 p-0 rounded-none ${
              viewMode === 'list' ? 'bg-muted' : ''
            }`}
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Quick filters row */}
      {activeFiltersCount > 0 && (
        <div className="px-4 py-3 border-t border-border bg-muted/30">
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {/* Category filter */}
            <Select 
              value={filters.category || 'all'} 
              onValueChange={(value) => 
                onFiltersChange({ ...filters, category: value === 'all' ? null : value })
              }
            >
              <SelectTrigger className="w-auto h-8 rounded-full text-xs bg-background">
                <SelectValue placeholder="Catégorie">
                  {selectedCategory && (
                    <span className="flex items-center gap-1">
                      {selectedCategory.icon} {selectedCategory.name}
                    </span>
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('explorer.all_categories')}</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    <span className="flex items-center gap-2">
                      {category.icon} {category.name}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Sort filter */}
            <Select 
              value={filters.sortBy} 
              onValueChange={(value: any) => 
                onFiltersChange({ ...filters, sortBy: value })
              }
            >
              <SelectTrigger className="w-auto h-8 rounded-full text-xs bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="relevance">{t('explorer.relevance')}</SelectItem>
                <SelectItem value="distance" disabled={!userLocation}>
                  <span className="flex items-center gap-2">
                    <MapPin className="w-3 h-3" />
                    {t('explorer.distance')}
                  </span>
                </SelectItem>
                <SelectItem value="discount">{t('explorer.price')}</SelectItem>
                <SelectItem value="newest">{t('explorer.newest')}</SelectItem>
              </SelectContent>
            </Select>

            {/* Distance filter (only if location available) */}
            {userLocation && (
              <Select 
                value={filters.maxDistance?.toString() || 'all'} 
                onValueChange={(value) => 
                  onFiltersChange({ 
                    ...filters, 
                    maxDistance: value === 'all' ? null : parseInt(value) 
                  })
                }
              >
                <SelectTrigger className="w-auto h-8 rounded-full text-xs bg-background">
                  <SelectValue placeholder="Distance">
                    {filters.maxDistance && `${filters.maxDistance} km`}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('explorer.all_distances')}</SelectItem>
                  <SelectItem value="5">5 km</SelectItem>
                  <SelectItem value="10">10 km</SelectItem>
                  <SelectItem value="25">25 km</SelectItem>
                  <SelectItem value="50">50 km</SelectItem>
                </SelectContent>
              </Select>
            )}

            {/* Clear filters */}
            {activeFiltersCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onFiltersChange({
                  category: null,
                  city: null,
                  sortBy: 'relevance',
                  maxDistance: null,
                })}
                className="h-8 px-3 rounded-full text-xs text-muted-foreground hover:text-foreground"
              >
                {t('explorer.clear')}
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Results count */}
      <div className="px-4 py-2 bg-muted/20 border-t border-border">
        <p className="text-xs text-muted-foreground">
          {resultsCount} {resultsCount <= 1 ? t('explorer.offer_found') : t('explorer.offers_found')}
          {searchQuery && ` ${t('explorer.search_for')} "${searchQuery}"`}
        </p>
      </div>
    </div>
  );
}
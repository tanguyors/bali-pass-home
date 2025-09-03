import React from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/contexts/LanguageContext';

interface Category {
  id: string;
  name: string;
  icon: string;
}

interface City {
  id: string;
  name: string;
}

interface SimpleFilterProps {
  categories: Category[];
  cities: City[];
  selectedCategory: string | null;
  selectedCity: string | null;
  onCategoryChange: (categoryId: string | null) => void;
  onCityChange: (cityId: string | null) => void;
  offersCount: number;
  className?: string;
}

export const SimpleFilter: React.FC<SimpleFilterProps> = ({
  categories,
  cities,
  selectedCategory,
  selectedCity,
  onCategoryChange,
  onCityChange,
  offersCount,
  className = ''
}) => {
  const { t } = useLanguage();

  return (
    <div className={`bg-background border-b border-border ${className}`}>
      {/* Section Header */}
      <div className="px-4 pt-4 pb-3">
        <h2 className="text-lg font-bold text-foreground mb-1">
          {t('filter.filter_by_category')}
        </h2>
        <p className="text-xs text-muted-foreground">
          {offersCount} {offersCount === 1 ? t('simple_filter.offer_available') : t('simple_filter.offers_available')}
        </p>
      </div>

      {/* Category Grid - More Compact */}
      <div className="px-4 pb-3">
        <div className="grid grid-cols-3 gap-2">
          {/* All Categories Button */}
          <button
            onClick={() => onCategoryChange(null)}
            className={`p-2 rounded-lg border transition-all duration-200 flex items-center gap-2 text-sm ${
              !selectedCategory
                ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                : 'bg-background text-foreground border-border hover:border-primary/50 hover:bg-muted/50'
            }`}
          >
            <span className="text-base">📂</span>
            <span className="font-medium text-left flex-1 truncate">
              {t('filter.all_categories')}
            </span>
          </button>
          
          {/* Individual Category Buttons */}
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => onCategoryChange(category.id)}
              className={`p-2 rounded-lg border transition-all duration-200 flex items-center gap-2 text-sm ${
                selectedCategory === category.id
                  ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                  : 'bg-background text-foreground border-border hover:border-primary/50 hover:bg-muted/50'
              }`}
            >
              <span className="text-base">{category.icon}</span>
              <span className="font-medium text-left flex-1 truncate">
                {category.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* City Filter Section - Dropdown */}
      <div className="px-4 pb-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-base font-semibold text-foreground">
            {t('filter.city')}
          </h3>
          {selectedCity && (
            <button
              onClick={() => onCityChange(null)}
              className="text-xs text-muted-foreground hover:text-foreground bg-muted hover:bg-muted/80 px-2 py-1 rounded-md transition-colors"
            >
              ✕ {t('filter.clear')}
            </button>
          )}
        </div>
        <Select value={selectedCity || ""} onValueChange={(value) => onCityChange(value || null)}>
          <SelectTrigger className="w-full bg-background border-border text-foreground hover:border-primary/50 focus:border-primary">
            <SelectValue placeholder={
              <div className="flex items-center gap-2">
                <span>🌍</span>
                <span>{t('filter.all_cities')}</span>
              </div>
            } />
          </SelectTrigger>
          <SelectContent className="bg-background border-border shadow-lg z-50">
            {cities.map((city) => (
              <SelectItem 
                key={city.id} 
                value={city.id}
                className="text-foreground hover:bg-muted focus:bg-muted"
              >
                <div className="flex items-center gap-2">
                  <span>📍</span>
                  <span>{city.name}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
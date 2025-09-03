import React from 'react';
import { Button } from '@/components/ui/button';
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

      {/* City Filter Section */}
      <div className="px-4 pb-4">
        <h3 className="text-base font-semibold text-foreground mb-2">
          {t('filter.city')}
        </h3>
        <div className="grid grid-cols-3 gap-2">
          {/* All Cities Button */}
          <button
            onClick={() => onCityChange(null)}
            className={`p-2 rounded-lg border transition-all duration-200 flex items-center gap-2 text-sm ${
              !selectedCity
                ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                : 'bg-background text-foreground border-border hover:border-primary/50 hover:bg-muted/50'
            }`}
          >
            <span className="text-base">🌍</span>
            <span className="font-medium text-left flex-1 truncate">
              {t('filter.all_cities')}
            </span>
          </button>
          
          {/* Individual City Buttons */}
          {cities.map((city) => (
            <button
              key={city.id}
              onClick={() => onCityChange(city.id)}
              className={`p-2 rounded-lg border transition-all duration-200 flex items-center gap-2 text-sm ${
                selectedCity === city.id
                  ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                  : 'bg-background text-foreground border-border hover:border-primary/50 hover:bg-muted/50'
              }`}
            >
              <span className="text-base">📍</span>
              <span className="font-medium text-left flex-1 truncate">
                {city.name}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
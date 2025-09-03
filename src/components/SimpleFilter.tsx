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
    <div className={`bg-gradient-to-b from-background to-muted/20 border-b border-border/50 ${className}`}>
      {/* Section Header with modern styling */}
      <div className="px-4 pt-6 pb-4">
        <div className="text-center space-y-2">
          <h2 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
            {t('filter.filter_by_category')}
          </h2>
          <div className="flex items-center justify-center gap-2">
            <div className="w-8 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent"></div>
            <p className="text-sm text-muted-foreground font-medium">
              {offersCount} {offersCount === 1 ? t('simple_filter.offer_available') : t('simple_filter.offers_available')}
            </p>
            <div className="w-8 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent"></div>
          </div>
        </div>
      </div>

      {/* Category Grid - Modern Design */}
      <div className="px-4 pb-4">
        <div className="grid grid-cols-3 gap-3">
          {/* All Categories Button */}
          <button
            onClick={() => onCategoryChange(null)}
            className={`group relative p-3 rounded-2xl border transition-all duration-300 transform hover:scale-105 active:scale-95 ${
              !selectedCategory
                ? 'bg-gradient-to-br from-primary via-primary to-primary/80 text-primary-foreground border-primary/50 shadow-lg shadow-primary/25'
                : 'bg-gradient-to-br from-background to-muted/30 text-foreground border-border/60 hover:border-primary/30 hover:shadow-md hover:bg-gradient-to-br hover:from-muted/50 hover:to-background'
            }`}
          >
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/10 to-transparent opacity-50"></div>
            <div className="relative flex items-center gap-2">
              <span className="text-lg filter drop-shadow-sm">📂</span>
              <span className="font-semibold text-xs leading-tight flex-1 text-left">
                {t('filter.all_categories')}
              </span>
            </div>
            {!selectedCategory && (
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/20 to-transparent pointer-events-none"></div>
            )}
          </button>
          
          {/* Individual Category Buttons */}
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => onCategoryChange(category.id)}
              className={`group relative p-3 rounded-2xl border transition-all duration-300 transform hover:scale-105 active:scale-95 ${
                selectedCategory === category.id
                  ? 'bg-gradient-to-br from-primary via-primary to-primary/80 text-primary-foreground border-primary/50 shadow-lg shadow-primary/25'
                  : 'bg-gradient-to-br from-background to-muted/30 text-foreground border-border/60 hover:border-primary/30 hover:shadow-md hover:bg-gradient-to-br hover:from-muted/50 hover:to-background'
              }`}
            >
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/10 to-transparent opacity-50"></div>
              <div className="relative flex items-center gap-2">
                <span className="text-lg filter drop-shadow-sm">{category.icon}</span>
                <span className="font-semibold text-xs leading-tight flex-1 text-left">
                  {t(`category_names.${category.name}`) || category.name}
                </span>
              </div>
              {selectedCategory === category.id && (
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/20 to-transparent pointer-events-none"></div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* City Filter Section - Modern Dropdown */}
      <div className="px-4 pb-6">
        <div className="bg-gradient-to-br from-background to-muted/30 rounded-2xl p-4 border border-border/60 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <span className="text-lg">🏙️</span>
              {t('filter.city')}
            </h3>
            {selectedCity && (
              <button
                onClick={() => onCityChange(null)}
                className="group flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground bg-muted/60 hover:bg-muted px-3 py-1.5 rounded-full transition-all duration-200 hover:shadow-md"
              >
                <span className="text-xs group-hover:rotate-90 transition-transform duration-200">✕</span>
                <span className="font-medium">{t('filter.clear')}</span>
              </button>
            )}
          </div>
          <Select value={selectedCity || ""} onValueChange={(value) => onCityChange(value || null)}>
            <SelectTrigger className="w-full bg-gradient-to-r from-background to-muted/20 border-border/60 text-foreground hover:border-primary/40 focus:border-primary h-12 rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
              <SelectValue placeholder={
                <div className="flex items-center gap-3">
                  <span className="text-lg">🌍</span>
                  <span className="font-medium">{t('filter.all_cities')}</span>
                </div>
              } />
            </SelectTrigger>
            <SelectContent className="bg-background/95 backdrop-blur-lg border-border/60 shadow-xl rounded-xl z-50 overflow-hidden">
              <div className="bg-gradient-to-b from-muted/20 to-transparent p-1">
                {cities.map((city) => (
                  <SelectItem 
                    key={city.id} 
                    value={city.id}
                    className="text-foreground hover:bg-gradient-to-r hover:from-primary/10 hover:to-primary/5 focus:bg-gradient-to-r focus:from-primary/10 focus:to-primary/5 rounded-lg mx-1 transition-all duration-200"
                  >
                    <div className="flex items-center gap-3 py-1">
                      <span className="text-base filter drop-shadow-sm">📍</span>
                      <span className="font-medium">{city.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </div>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};
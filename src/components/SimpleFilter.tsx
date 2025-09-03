import React from 'react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';

interface Category {
  id: string;
  name: string;
  icon: string;
}

interface SimpleFilterProps {
  categories: Category[];
  selectedCategory: string | null;
  onCategoryChange: (categoryId: string | null) => void;
  offersCount: number;
  className?: string;
}

export const SimpleFilter: React.FC<SimpleFilterProps> = ({
  categories,
  selectedCategory,
  onCategoryChange,
  offersCount,
  className = ''
}) => {
  const { t } = useLanguage();

  return (
    <div className={`bg-background ${className}`}>
      {/* Simple Title */}
      <div className="px-4 py-4 bg-muted/30">
        <h2 className="text-xl font-bold text-center text-foreground mb-2">
          {t('simple_filter.what_are_you_looking_for')}
        </h2>
        <p className="text-center text-muted-foreground text-sm">
          {offersCount} {offersCount <= 1 ? t('simple_filter.offer_available') : t('simple_filter.offers_available')}
        </p>
      </div>

      {/* Big Category Buttons */}
      <div className="p-4 space-y-3">
        {/* All Categories Button */}
        <Button
          onClick={() => onCategoryChange(null)}
          variant={!selectedCategory ? "default" : "outline"}
          className={`w-full h-16 text-left justify-start gap-4 text-lg font-semibold ${
            !selectedCategory 
              ? 'bg-primary text-primary-foreground border-2 border-primary shadow-lg' 
              : 'bg-card hover:bg-muted border-2 border-muted'
          }`}
        >
          <span className="text-2xl">🏷️</span>
          <div className="text-left">
            <div className="font-bold">{t('simple_filter.all_offers')}</div>
            <div className="text-sm opacity-80">{t('simple_filter.see_everything')}</div>
          </div>
        </Button>

        {/* Individual Category Buttons */}
        {categories.map((category) => (
          <Button
            key={category.id}
            onClick={() => onCategoryChange(category.id)}
            variant={selectedCategory === category.id ? "default" : "outline"}
            className={`w-full h-16 text-left justify-start gap-4 text-lg font-semibold ${
              selectedCategory === category.id 
                ? 'bg-primary text-primary-foreground border-2 border-primary shadow-lg' 
                : 'bg-card hover:bg-muted border-2 border-muted'
            }`}
          >
            <span className="text-2xl">{category.icon}</span>
            <div className="text-left">
              <div className="font-bold">{category.name}</div>
              <div className="text-sm opacity-80">{t('simple_filter.discover')} {category.name.toLowerCase()}</div>
            </div>
          </Button>
        ))}
      </div>

      {/* Clear Selection */}
      {selectedCategory && (
        <div className="px-4 pb-4">
          <Button
            onClick={() => onCategoryChange(null)}
            variant="ghost"
            className="w-full h-12 text-muted-foreground hover:text-foreground"
          >
            ✕ {t('simple_filter.clear_selection')}
          </Button>
        </div>
      )}
    </div>
  );
};
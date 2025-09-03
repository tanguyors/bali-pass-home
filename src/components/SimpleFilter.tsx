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
    <div className={`bg-background border-b border-border ${className}`}>
      {/* Section Header */}
      <div className="px-4 pt-6 pb-4">
        <h2 className="text-xl font-bold text-foreground mb-1">
          {t('filter.filter_by_category')}
        </h2>
        <p className="text-sm text-muted-foreground">
          {offersCount} {offersCount === 1 ? t('simple_filter.offer_available') : t('simple_filter.offers_available')}
        </p>
      </div>

      {/* Category Grid */}
      <div className="px-4 pb-6">
        <div className="grid grid-cols-2 gap-3">
          {/* All Categories Button */}
          <button
            onClick={() => onCategoryChange(null)}
            className={`p-4 rounded-xl border-2 transition-all duration-200 flex items-center gap-3 ${
              !selectedCategory
                ? 'bg-primary text-primary-foreground border-primary shadow-md'
                : 'bg-background text-foreground border-border hover:border-primary/50 hover:bg-muted/50'
            }`}
          >
            <span className="text-xl">📂</span>
            <span className="font-medium text-left flex-1">
              {t('filter.all_categories')}
            </span>
          </button>
          
          {/* Individual Category Buttons */}
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => onCategoryChange(category.id)}
              className={`p-4 rounded-xl border-2 transition-all duration-200 flex items-center gap-3 ${
                selectedCategory === category.id
                  ? 'bg-primary text-primary-foreground border-primary shadow-md'
                  : 'bg-background text-foreground border-border hover:border-primary/50 hover:bg-muted/50'
              }`}
            >
              <span className="text-xl">{category.icon}</span>
              <span className="font-medium text-left flex-1">
                {category.name}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
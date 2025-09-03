import React from 'react';
import { FilterChip } from './FilterChip';
import { useLanguage } from '@/contexts/LanguageContext';

interface Category {
  id: string;
  name: string;
  icon: string;
}

interface CategoryFilterProps {
  categories: Category[];
  selectedCategory: string | null;
  onCategoryChange: (categoryId: string | null) => void;
  className?: string;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  selectedCategory,
  onCategoryChange,
  className = ''
}) => {
  const { t } = useLanguage();

  return (
    <div className={`bg-background border-b border-border pb-4 ${className}`}>
      {/* Section Header */}
      <div className="px-4 mb-4">
        <h2 className="text-lg font-semibold text-foreground">
          {t('filter.filter_by_category')}
        </h2>
      </div>

      {/* Category Chips */}
      <div className="px-4">
        <div className="flex flex-wrap gap-2">
          {/* All Categories Chip */}
          <FilterChip
            label={t('filter.all_categories')}
            icon="📂"
            isSelected={!selectedCategory}
            onClick={() => onCategoryChange(null)}
            className="bg-white border border-border shadow-sm"
          />
          
          {/* Individual Category Chips */}
          {categories.map((category) => (
            <FilterChip
              key={category.id}
              label={t(`category_names.${category.name}`) || category.name}
              icon={category.icon}
              isSelected={selectedCategory === category.id}
              onClick={() => onCategoryChange(category.id)}
              className="bg-white border border-border shadow-sm"
            />
          ))}
        </div>
      </div>
    </div>
  );
};
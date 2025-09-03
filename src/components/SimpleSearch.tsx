import React from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';

interface SimpleSearchProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  className?: string;
}

export const SimpleSearch: React.FC<SimpleSearchProps> = ({
  searchQuery,
  onSearchChange,
  className = ''
}) => {
  const { t } = useLanguage();

  const clearSearch = () => {
    onSearchChange('');
  };

  return (
    <div className={`bg-background border-b border-border ${className}`}>
      <div className="p-4">
        <div className="space-y-3">
          {/* Search Title */}
          <h3 className="text-lg font-semibold text-center text-foreground">
            {t('simple_search.search_title')}
          </h3>
          
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input 
              placeholder={t('simple_search.placeholder')}
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-12 pr-12 h-14 text-lg bg-muted/30 border-2 border-muted focus:border-primary rounded-xl"
            />
            {searchQuery && (
              <Button
                onClick={clearSearch}
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-8 p-0 rounded-full hover:bg-muted"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>

          {/* Search Hint */}
          <p className="text-center text-sm text-muted-foreground">
            {t('simple_search.hint')}
          </p>
        </div>
      </div>
    </div>
  );
};
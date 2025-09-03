import { useCallback, useEffect, useRef } from 'react';
import { Loader2 } from 'lucide-react';
import { OfferCard } from './OfferCard';
import { Offer } from '@/hooks/useOffers';
import { useLanguage } from '@/contexts/LanguageContext';

interface OffersListProps {
  offers: Offer[];
  loading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  onToggleFavorite: (offerId: string) => void;
  viewMode: 'grid' | 'list';
  error: string | null;
}

export function OffersList({ 
  offers, 
  loading, 
  hasMore, 
  onLoadMore, 
  onToggleFavorite, 
  viewMode,
  error 
}: OffersListProps) {
  const observer = useRef<IntersectionObserver>();
  const { t } = useLanguage();
  
  const lastOfferElementRef = useCallback((node: HTMLDivElement) => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        onLoadMore();
      }
    });
    
    if (node) observer.current.observe(node);
  }, [loading, hasMore, onLoadMore]);

  if (error) {
    return (
      <div className="px-4 py-8 text-center">
        <p className="text-muted-foreground mb-4">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="text-primary hover:underline"
        >
          {t('explorer.retry')}
        </button>
      </div>
    );
  }

  if (!loading && offers.length === 0) {
    return (
      <div className="px-4 py-12 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
          <span className="text-2xl">🔍</span>
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">
          {t('explorer.no_offers_found')}
        </h3>
        <p className="text-muted-foreground max-w-sm mx-auto">
          {t('explorer.try_different_filters')}
        </p>
      </div>
    );
  }

  return (
    <div className="px-4">
      <div className={`gap-4 ${
        viewMode === 'grid' 
          ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' 
          : 'flex flex-col'
      }`}>
        {offers.map((offer, index) => {
          const isLast = index === offers.length - 1;
          return (
            <div
              key={offer.id}
              ref={isLast ? lastOfferElementRef : null}
            >
              <OfferCard
                offer={offer}
                onToggleFavorite={onToggleFavorite}
                viewMode={viewMode}
              />
            </div>
          );
        })}
      </div>

      {/* Loading indicator */}
      {loading && (
        <div className="flex justify-center py-8">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">{t('explorer.loading_offers_text')}</span>
          </div>
        </div>
      )}

      {/* End of results */}
      {!loading && !hasMore && offers.length > 0 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground text-sm">
            {t('explorer.all_offers_viewed')}
          </p>
        </div>
      )}
    </div>
  );
}
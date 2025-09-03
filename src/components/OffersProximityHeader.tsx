import React from 'react';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';

interface OffersProximityHeaderProps {
  offersCount: number;
  userLocation?: { latitude: number; longitude: number } | null;
  className?: string;
}

export const OffersProximityHeader: React.FC<OffersProximityHeaderProps> = ({
  offersCount,
  userLocation,
  className = ''
}) => {
  const { t } = useLanguage();

  return (
    <div className={`flex items-center justify-between px-4 py-4 ${className}`}>
      <h2 className="text-xl font-bold text-foreground">
        {userLocation ? t('explorer.nearby_offers') : t('explorer.all_offers')}
      </h2>
      
      <Badge 
        variant="secondary" 
        className="bg-primary text-primary-foreground px-3 py-1 rounded-full font-semibold"
      >
        {offersCount} {offersCount <= 1 ? t('explorer.offer_found') : t('explorer.offers_found')}
      </Badge>
    </div>
  );
};
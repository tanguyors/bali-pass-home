import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, MapPin, Navigation, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Offer } from '@/hooks/useOffers';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';

interface OfferCardProps {
  offer: Offer;
  onToggleFavorite: (offerId: string) => void;
  viewMode: 'grid' | 'list';
}

export function OfferCard({ offer, onToggleFavorite, viewMode }: OfferCardProps) {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { user, hasActivePass } = useAuth();
  const [imageError, setImageError] = useState(false);

  // Check if user should see blurred content
  const shouldBlur = !user || !hasActivePass;

  const handleNavigation = () => {
    if (!offer.partner.address) return;
    
    const encodedAddress = encodeURIComponent(offer.partner.address);
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isAndroid = /Android/.test(navigator.userAgent);
    
    if (isIOS) {
      window.location.href = `maps://maps.apple.com/?q=${encodedAddress}`;
    } else if (isAndroid) {
      window.location.href = `geo:0,0?q=${encodedAddress}`;
    } else {
      window.open(`https://www.google.com/maps/search/${encodedAddress}`, '_blank');
    }
  };

  const handleCall = () => {
    if (offer.partner.phone) {
      window.location.href = `tel:${offer.partner.phone}`;
    }
  };

  const getImageUrl = () => {
    return offer.partner.photos && offer.partner.photos.length > 0 
      ? offer.partner.photos[0] 
      : null;
  };

  if (viewMode === 'list') {
    return (
      <div className={`bg-card rounded-xl overflow-hidden shadow-bali hover:shadow-bali-4 transition-all duration-200 relative ${shouldBlur ? 'blur-sm' : ''}`}>
        {shouldBlur && (
          <div className="absolute inset-0 bg-black/20 z-10 flex items-center justify-center">
            <div className="bg-white/95 backdrop-blur-sm rounded-lg p-4 mx-4 text-center">
              <p className="text-sm font-medium text-gray-800 mb-2">
                {t('offer_card.login_and_get_pass')}
              </p>
              <p className="text-xs text-gray-600 mb-3">
                {t('offer_card.access_full_details')}
              </p>
              <Button
                size="sm"
                onClick={() => navigate('/auth')}
                className="text-xs"
              >
                {t('offer_card.login')}
              </Button>
            </div>
          </div>
        )}
        <div className="flex">
          {/* Image */}
          <div className="w-32 h-24 flex-shrink-0 relative">
            {getImageUrl() && !imageError ? (
              <img
                src={getImageUrl()!}
                alt={offer.title}
                className="w-full h-full object-cover"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary/20 to-lagoon/20 flex items-center justify-center">
                <span className="text-xs text-muted-foreground">{t('offer_card.image_coming_soon')}</span>
              </div>
            )}

            {/* Favorite Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(offer.id);
              }}
              disabled={shouldBlur}
              className="absolute top-1 right-1 w-6 h-6 p-0 bg-white/80 hover:bg-white disabled:opacity-50"
            >
              <Heart className={`w-3 h-3 ${offer.isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
            </Button>
          </div>

          {/* Content */}
          <div className="flex-1 p-3">
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm text-foreground line-clamp-1 mb-1">
                  {offer.title}
                </h3>
                <p className="text-xs text-primary font-medium mb-1">
                  {offer.partner.name}
                </p>
              </div>
              
              {offer.category && (
                <Badge variant="secondary" className="text-xs ml-2 flex-shrink-0">
                  {offer.category.icon} {t(`category_names.${offer.category.name}`) || offer.category.name}
                </Badge>
              )}
            </div>

            {/* Location & Distance */}
            <div className="flex items-center gap-2 mb-2">
              {offer.partner.address && (
                <div className="flex items-center gap-1 min-w-0">
                  <MapPin className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                  <span className="text-xs text-muted-foreground truncate">
                    {offer.partner.address}
                  </span>
                </div>
              )}
              
              {offer.distance && (
                <span className="text-xs text-primary font-medium flex-shrink-0">
                  {offer.distance.toFixed(1)} km
                </span>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button 
                variant="default" 
                size="sm" 
                onClick={() => navigate(`/offer/${offer.id}`)}
                disabled={shouldBlur}
                className="text-xs px-3 h-7 flex-1 disabled:opacity-50"
              >
                {t('offer_card.view_offer')}
              </Button>
              
              {offer.partner.phone && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleCall}
                  disabled={shouldBlur}
                  className="w-7 h-7 p-0 disabled:opacity-50"
                  title={t('offer_card.call')}
                >
                  <Phone className="w-3 h-3" />
                </Button>
              )}
              
              {offer.partner.address && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleNavigation}
                  disabled={shouldBlur}
                  className="w-7 h-7 p-0 disabled:opacity-50"
                  title={t('offer_card.navigation')}
                >
                  <Navigation className="w-3 h-3" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Grid view
  return (
    <div className={`bg-card rounded-xl overflow-hidden shadow-bali hover:shadow-bali-4 transition-all duration-200 relative ${shouldBlur ? 'blur-sm' : ''}`}>
      {shouldBlur && (
        <div className="absolute inset-0 bg-black/20 z-10 flex items-center justify-center">
          <div className="bg-white/95 backdrop-blur-sm rounded-lg p-4 mx-4 text-center">
            <p className="text-sm font-medium text-gray-800 mb-2">
              {t('offer_card.login_and_get_pass')}
            </p>
            <p className="text-xs text-gray-600 mb-3">
              {t('offer_card.access_full_details')}
            </p>
            <Button
              size="sm"
              onClick={() => navigate('/auth')}
              className="text-xs"
            >
              {t('offer_card.login')}
            </Button>
          </div>
        </div>
      )}
      {/* Image */}
      <div className="h-40 relative">
        {getImageUrl() && !imageError ? (
          <img
            src={getImageUrl()!}
            alt={offer.title}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-lagoon/20 flex items-center justify-center">
            <span className="text-sm text-muted-foreground">{t('offer_card.image_coming_soon')}</span>
          </div>
        )}

        {/* Favorite Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(offer.id);
          }}
          disabled={shouldBlur}
          className="absolute top-2 right-2 w-8 h-8 p-0 bg-white/80 hover:bg-white disabled:opacity-50"
        >
          <Heart className={`w-4 h-4 ${offer.isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
        </Button>

        {/* Distance */}
        {offer.distance && (
          <div className="absolute bottom-2 right-2 px-2 py-1 rounded-full bg-white/80 text-xs font-medium text-primary">
            {offer.distance.toFixed(1)} km
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm text-foreground line-clamp-2 mb-1">
              {offer.title}
            </h3>
            <p className="text-xs text-primary font-medium">
              {offer.partner.name}
            </p>
          </div>
          
          {offer.category && (
            <Badge variant="secondary" className="text-xs ml-2 flex-shrink-0">
              {offer.category.icon}
            </Badge>
          )}
        </div>

        {/* Location */}
        {offer.partner.address && (
          <div className="flex items-center gap-1 mb-3">
            <MapPin className="w-3 h-3 text-muted-foreground flex-shrink-0" />
            <span className="text-xs text-muted-foreground line-clamp-1">
              {offer.partner.address}
            </span>
          </div>
        )}

        {/* Phone */}
        {offer.partner.phone && (
          <div className="flex items-center gap-1 mb-3">
            <Phone className="w-3 h-3 text-muted-foreground flex-shrink-0" />
            <span className="text-xs text-muted-foreground">
              {offer.partner.phone}
            </span>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <Button 
            variant="default" 
            size="sm" 
            onClick={() => navigate(`/offer/${offer.id}`)}
            disabled={shouldBlur}
            className="text-xs px-3 h-8 flex-1 disabled:opacity-50"
          >
            {t('offer_card.view_offer')}
          </Button>
          
          {offer.partner.address && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleNavigation}
              disabled={shouldBlur}
              className="w-8 h-8 p-0 disabled:opacity-50"
              title={t('offer_card.navigation')}
            >
              <Navigation className="w-3 h-3" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
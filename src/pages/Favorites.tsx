import React from 'react';
import { Heart, MapPin, ArrowLeft, Tag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BottomNavigation } from '@/components/BottomNavigation';
import { FloatingActionButton } from '@/components/FloatingActionButton';
import { useOfferFavorites } from '@/hooks/useOfferFavorites';
import { useLanguage } from '@/contexts/LanguageContext';
import { LanguageSelector } from '@/components/LanguageSelector';

const Favorites: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { favorites, loading, removeFromFavorites } = useOfferFavorites();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Language Selector - Fixed at top right */}
      <div className="fixed top-4 right-4 z-50">
        <LanguageSelector />
      </div>
      {/* Header */}
      <div className="sticky top-0 z-10 bg-gradient-to-r from-background/95 via-background/98 to-primary/5 backdrop-blur-xl border-b border-border/50">
        <div className="p-4">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="hover:bg-card/60 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
                {t('favorites.title')}
              </h1>
              <p className="text-sm text-muted-foreground">
                {favorites.length} {favorites.length === 1 ? t('simple_filter.offer_available') : t('simple_filter.offers_available')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="pb-20 p-4">
        {favorites.length === 0 ? (
          <Card className="shadow-xl border-0 bg-card/60 backdrop-blur-sm">
            <CardContent className="text-center py-16">
              <div className="w-20 h-20 bg-gradient-to-br from-primary/10 to-primary/5 rounded-full flex items-center justify-center mx-auto mb-6">
                <Heart className="w-10 h-10 text-primary" />
              </div>
              <h3 className="font-bold text-xl mb-3">{t('favorites.no_favorites')}</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                {t('favorites.explore_partners')}
              </p>
              <Button 
                onClick={() => navigate('/explorer')}
                className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                {t('explorer.discover_offers')}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {favorites.map((favorite) => (
              <Card 
                key={favorite.id}
                className="shadow-lg border-0 bg-card/80 backdrop-blur-sm hover:shadow-xl hover:bg-card/90 transition-all duration-300 group cursor-pointer"
                onClick={() => navigate(`/offer/${favorite.offer_id}`)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    {/* Image de l'offre ou dégradé */}
                    <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border-2 border-primary/20 group-hover:border-primary/40 transition-colors duration-300">
                      {favorite.offer?.partner?.photos && favorite.offer.partner.photos.length > 0 ? (
                        <img
                          src={favorite.offer.partner.photos[0]}
                          alt={favorite.offer?.title || 'Offre'}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                          <Tag className="w-8 h-8 text-primary" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-lg mb-1 line-clamp-2">{favorite.offer?.title}</h3>
                      <p className="text-sm text-primary font-medium mb-2">{favorite.offer?.partner?.name}</p>
                      
                      {favorite.offer?.value_text && (
                        <Badge variant="secondary" className="text-xs mb-2">
                          {favorite.offer.value_text}
                        </Badge>
                      )}
                      
                      {favorite.offer?.category && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                          <span>{favorite.offer.category.icon}</span>
                          <span>{t(`category_names.${favorite.offer.category.name}`) || favorite.offer.category.name}</span>
                        </div>
                      )}
                      
                      {favorite.offer?.partner?.address && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                          <MapPin className="w-4 h-4 flex-shrink-0" />
                          <span className="truncate">{favorite.offer.partner.address}</span>
                        </div>
                      )}
                      
                      <p className="text-xs text-muted-foreground">
                        {t('favorites.added_on')} {new Date(favorite.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFromFavorites(favorite.offer_id);
                      }}
                      className="text-red-500 hover:text-red-600 hover:bg-red-50 transition-colors flex-shrink-0"
                    >
                      <Heart className="w-5 h-5 fill-current" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <FloatingActionButton />
      <BottomNavigation />
    </div>
  );
};

export default Favorites;
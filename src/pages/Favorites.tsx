import React from 'react';
import { Heart, MapPin, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { BottomNavigation } from '@/components/BottomNavigation';
import { FloatingActionButton } from '@/components/FloatingActionButton';
import { usePartnerFavorites } from '@/hooks/usePartnerFavorites';

const Favorites: React.FC = () => {
  const navigate = useNavigate();
  const { favorites, loading, toggleFavorite } = usePartnerFavorites();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement de vos favoris...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
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
                Mes Favoris
              </h1>
              <p className="text-sm text-muted-foreground">
                {favorites.length} partenaire{favorites.length !== 1 ? 's' : ''} favori{favorites.length !== 1 ? 's' : ''}
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
              <h3 className="font-bold text-xl mb-3">Aucun favori pour le moment</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Découvrez nos partenaires et ajoutez-les à vos favoris pour les retrouver facilement !
              </p>
              <Button 
                onClick={() => navigate('/explorer')}
                className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Explorer les partenaires
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {favorites.map((favorite) => (
              <Card 
                key={favorite.id}
                className="shadow-lg border-0 bg-card/80 backdrop-blur-sm hover:shadow-xl hover:bg-card/90 transition-all duration-300 group cursor-pointer"
                onClick={() => navigate(`/partner/${favorite.partner?.slug}`)}
              >
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <Avatar className="w-16 h-16 border-2 border-primary/20 group-hover:border-primary/40 transition-colors duration-300">
                      <AvatarImage 
                        src={favorite.partner?.logo_url || ''} 
                        alt={favorite.partner?.name || 'Partner'} 
                      />
                      <AvatarFallback className="bg-gradient-to-br from-primary/10 to-primary/5 text-primary font-semibold text-lg">
                        {favorite.partner?.name?.[0]?.toUpperCase() || 'P'}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1">
                      <h3 className="font-bold text-lg mb-1">{favorite.partner?.name}</h3>
                      
                      {favorite.partner?.cities && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                          <MapPin className="w-4 h-4" />
                          <span>{favorite.partner.cities.name}</span>
                        </div>
                      )}
                      
                      <p className="text-xs text-muted-foreground">
                        Ajouté le {new Date(favorite.created_at).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(favorite.partner_id);
                      }}
                      className="text-red-500 hover:text-red-600 hover:bg-red-50 transition-colors"
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
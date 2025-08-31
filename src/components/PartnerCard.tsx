import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, MapPin, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { usePartnerFavorites } from '@/hooks/usePartnerFavorites';

interface Partner {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logo_url?: string;
  cover_url?: string;
  address?: string;
  cities?: {
    name: string;
  };
  offers?: Array<{
    id: string;
    title: string;
    value_text?: string;
    is_active: boolean;
  }>;
}

interface PartnerCardProps {
  partner: Partner;
  viewMode?: 'grid' | 'list';
}

export function PartnerCard({ partner, viewMode = 'grid' }: PartnerCardProps) {
  const navigate = useNavigate();
  const { isFavorite, toggleFavorite } = usePartnerFavorites();

  const activeOffers = partner.offers?.filter(offer => offer.is_active) || [];

  const handleFavoriteToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(partner.id);
  };

  if (viewMode === 'list') {
    return (
      <Card 
        className="shadow-lg border-0 bg-card/80 backdrop-blur-sm hover:shadow-xl hover:bg-card/90 transition-all duration-300 group cursor-pointer"
        onClick={() => navigate(`/partner/${partner.slug}`)}
      >
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <Avatar className="w-16 h-16 border-2 border-primary/20 group-hover:border-primary/40 transition-colors duration-300">
              <AvatarImage src={partner.logo_url || ''} alt={partner.name} />
              <AvatarFallback className="bg-gradient-to-br from-primary/10 to-primary/5 text-primary font-semibold text-lg">
                {partner.name[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-lg mb-1 line-clamp-1">{partner.name}</h3>
              
              {partner.cities && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                  <MapPin className="w-4 h-4" />
                  <span>{partner.cities.name}</span>
                </div>
              )}
              
              {partner.description && (
                <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                  {partner.description}
                </p>
              )}
              
              {activeOffers.length > 0 && (
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-primary" />
                  <span className="text-sm text-primary font-medium">
                    {activeOffers.length} offre{activeOffers.length !== 1 ? 's' : ''} disponible{activeOffers.length !== 1 ? 's' : ''}
                  </span>
                </div>
              )}
            </div>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={handleFavoriteToggle}
              className={`transition-colors ${
                isFavorite(partner.id) 
                  ? 'text-red-500 hover:text-red-600' 
                  : 'text-muted-foreground hover:text-red-500'
              }`}
            >
              <Heart className={`w-5 h-5 ${isFavorite(partner.id) ? 'fill-current' : ''}`} />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Grid view
  return (
    <Card 
      className="shadow-lg border-0 bg-card/80 backdrop-blur-sm hover:shadow-xl hover:bg-card/90 transition-all duration-300 group cursor-pointer overflow-hidden"
      onClick={() => navigate(`/partner/${partner.slug}`)}
    >
      {/* Cover Image */}
      <div className="h-32 relative bg-gradient-to-br from-primary/10 to-primary/5">
        {partner.cover_url && (
          <img
            src={partner.cover_url}
            alt={`Couverture de ${partner.name}`}
            className="w-full h-full object-cover"
          />
        )}
        
        {/* Favorite Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleFavoriteToggle}
          className={`absolute top-2 right-2 w-8 h-8 p-0 bg-white/80 hover:bg-white transition-colors ${
            isFavorite(partner.id) 
              ? 'text-red-500' 
              : 'text-muted-foreground hover:text-red-500'
          }`}
        >
          <Heart className={`w-4 h-4 ${isFavorite(partner.id) ? 'fill-current' : ''}`} />
        </Button>

        {/* Offers Count */}
        {activeOffers.length > 0 && (
          <Badge className="absolute bottom-2 right-2 bg-primary text-primary-foreground">
            {activeOffers.length} offre{activeOffers.length !== 1 ? 's' : ''}
          </Badge>
        )}
      </div>

      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Avatar className="w-12 h-12 border-2 border-primary/20 group-hover:border-primary/40 transition-colors duration-300">
            <AvatarImage src={partner.logo_url || ''} alt={partner.name} />
            <AvatarFallback className="bg-gradient-to-br from-primary/10 to-primary/5 text-primary font-semibold">
              {partner.name[0]?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-base mb-1 line-clamp-1">{partner.name}</h3>
            
            {partner.cities && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                <MapPin className="w-3 h-3" />
                <span className="line-clamp-1">{partner.cities.name}</span>
              </div>
            )}
            
            {partner.description && (
              <p className="text-xs text-muted-foreground line-clamp-2">
                {partner.description}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
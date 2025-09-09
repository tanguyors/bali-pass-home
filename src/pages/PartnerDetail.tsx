import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, MapPin, Phone, Globe, Instagram, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { BottomNavigation } from '@/components/BottomNavigation';
import { FloatingActionButton } from '@/components/FloatingActionButton';
import { supabase } from '@/integrations/supabase/client';
import { usePartnerFavorites } from '@/hooks/usePartnerFavorites';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { LanguageSelector } from '@/components/LanguageSelector';

interface Partner {
  id: string;
  name: string;
  slug: string;
  description?: string;
  address?: string;
  phone?: string;
  website?: string;
  instagram?: string;
  logo_url?: string;
  cover_url?: string;
  photos?: string[];
  status: string;
  cities?: {
    name: string;
  };
  offers?: Array<{
    id: string;
    title: string;
    short_desc?: string;
    value_text?: string;
    is_active: boolean;
  }>;
}

const PartnerDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isFavorite, toggleFavorite } = usePartnerFavorites();
  const { t } = useLanguage();
  
  const [partner, setPartner] = useState<Partner | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    if (slug) {
      fetchPartner();
    }
  }, [slug]);

  const fetchPartner = async () => {
    if (!slug) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('partners')
        .select(`
          *,
          cities (
            name
          ),
          offers (
            id,
            title,
            short_desc,
            value_text,
            is_active
          )
        `)
        .eq('slug', slug)
        .eq('status', 'approved')
        .single();

      if (error) {
        console.error('Error fetching partner:', error);
        toast({
          title: t('common.error'),
          description: t('partner_details.loading_error'),
          variant: "destructive"
        });
        return;
      }

      setPartner(data);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: t('common.error'),
        description: t('partner_details.unexpected_error'),
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCall = () => {
    if (partner?.phone) {
      window.location.href = `tel:${partner.phone}`;
    }
  };

  const handleNavigation = () => {
    if (!partner?.address) return;
    
    const encodedAddress = encodeURIComponent(partner.address);
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

  const handleFavoriteToggle = () => {
    if (partner) {
      toggleFavorite(partner.id);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">{t('partner_details.loading')}</p>
        </div>
      </div>
    );
  }

  if (!partner) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center">
        <Card className="shadow-xl border-0 bg-card/60 backdrop-blur-sm max-w-md">
          <CardContent className="text-center py-16">
            <h3 className="font-bold text-xl mb-3">{t('partner_details.not_found')}</h3>
            <p className="text-muted-foreground mb-6">
              {t('partner_details.not_found_description')}
            </p>
            <Button onClick={() => navigate('/explorer')}>
              {t('partner_details.view_all_partners')}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const activeOffers = partner.offers?.filter(offer => offer.is_active) || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Language Selector - Floating bottom right */}
      <div
        className="fixed right-4 z-50"
        style={{ bottom: "calc(env(safe-area-inset-bottom, 0px) + 88px)" }}
      >
        <LanguageSelector />
      </div>
      {/* Header */}
      <div className="sticky top-0 z-10 bg-gradient-to-r from-background/95 via-background/98 to-primary/5 backdrop-blur-xl border-b border-border/50 safe-top">
        <div className="p-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="hover:bg-card/60 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={handleFavoriteToggle}
              className={`hover:bg-card/60 transition-colors ${
                isFavorite(partner.id) ? 'text-red-500' : 'text-muted-foreground'
              }`}
            >
              <Heart className={`w-5 h-5 ${isFavorite(partner.id) ? 'fill-current' : ''}`} />
            </Button>
          </div>
        </div>
      </div>

      {/* Cover Image */}
      {partner.cover_url && !imageError && (
        <div className="h-48 relative">
          <img
            src={partner.cover_url}
            alt={`${t('partner_details.cover_alt')} ${partner.name}`}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        </div>
      )}

      {/* Content */}
      <div className="pb-20 p-4 -mt-8 relative z-10">
        {/* Partner Info Card */}
        <Card className="shadow-xl border-0 bg-card/90 backdrop-blur-sm mb-6">
          <CardContent className="p-6">
            <div className="flex items-start gap-4 mb-4">
              <Avatar className="w-20 h-20 border-4 border-background shadow-lg">
                <AvatarImage src={partner.logo_url || ''} alt={partner.name} />
                <AvatarFallback className="bg-gradient-to-br from-primary/10 to-primary/5 text-primary font-bold text-2xl">
                  {partner.name[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h1 className="text-2xl font-bold">{partner.name}</h1>
                  <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                    {t('partner_details.verified')}
                  </Badge>
                </div>
                
                {partner.cities && (
                  <div className="flex items-center gap-1 text-muted-foreground mb-2">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm">{partner.cities.name}</span>
                  </div>
                )}
                
                {partner.description && (
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {partner.description}
                  </p>
                )}
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex gap-3">
              {partner.phone && (
                <Button 
                  onClick={handleCall}
                  className="flex-1 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 gap-2"
                >
                  <Phone className="w-4 h-4" />
                  {t('offer_card.call')}
                </Button>
              )}
              
              {partner.address && (
                <Button 
                  variant="outline"
                  onClick={handleNavigation}
                  className="flex-1 gap-2"
                >
                  <MapPin className="w-4 h-4" />
                  {t('offer_card.navigation')}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Contact Info */}
        <Card className="shadow-lg border-0 bg-card/80 backdrop-blur-sm mb-6">
          <CardHeader>
            <CardTitle className="text-lg">{t('partner_details.contact_info')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {partner.address && (
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
                <span className="text-sm">{partner.address}</span>
              </div>
            )}
            
            {partner.phone && (
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-muted-foreground" />
                <span className="text-sm">{partner.phone}</span>
              </div>
            )}
            
            {partner.website && (
              <div className="flex items-center gap-3">
                <Globe className="w-5 h-5 text-muted-foreground" />
                <a 
                  href={partner.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline"
                >
                  {t('partner_details.website')}
                </a>
              </div>
            )}
            
            {partner.instagram && (
              <div className="flex items-center gap-3">
                <Instagram className="w-5 h-5 text-muted-foreground" />
                <a 
                  href={`https://instagram.com/${partner.instagram}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline"
                >
                  @{partner.instagram}
                </a>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Offers */}
        {activeOffers.length > 0 && (
          <Card className="shadow-lg border-0 bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Star className="w-5 h-5 text-primary" />
                {t('partner_details.available_offers')} ({activeOffers.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {activeOffers.map((offer) => (
                <div
                  key={offer.id}
                  className="p-4 bg-gradient-to-r from-card/50 to-primary/5 rounded-lg border border-border/50 cursor-pointer hover:bg-gradient-to-r hover:from-card/70 hover:to-primary/10 transition-all duration-300"
                  onClick={() => navigate(`/offer/${offer.id}`)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold mb-1">{offer.title}</h4>
                      {offer.short_desc && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {offer.short_desc}
                        </p>
                      )}
                    </div>
                    {offer.value_text && (
                      <Badge variant="destructive" className="ml-2 bg-red-500">
                        {offer.value_text}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>

      <FloatingActionButton />
      <BottomNavigation />
    </div>
  );
};

export default PartnerDetail;
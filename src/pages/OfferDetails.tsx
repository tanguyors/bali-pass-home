import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  MapPin, 
  Phone, 
  Heart, 
  HeartOff, 
  Navigation, 
  Share2, 
  Clock, 
  Calendar,
  CheckCircle,
  AlertCircle,
  Crown
} from "lucide-react";
import { BottomNavigation } from "@/components/BottomNavigation";
import { FloatingActionButton } from "@/components/FloatingActionButton";
import { useToast } from "@/hooks/use-toast";
import { logger } from "@/lib/logger";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface UserPass {
  id: string;
  status: string;
  expires_at: string;
}

interface Offer {
  id: string;
  title: string;
  short_desc?: string;
  long_desc?: string;
  value_text?: string;
  promo_type?: string;
  value_number?: number;
  conditions_text?: string;
  terms_url?: string;
  start_date?: string;
  end_date?: string;
  partner: {
    id: string;
    name: string;
    address?: string;
    phone?: string;
    website?: string;
    instagram?: string;
    photos?: string[];
  };
  category: {
    name: string;
    icon?: string;
  };
}

export default function OfferDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();
  const { user, userPass, hasActivePass } = useAuth();
  const [offer, setOffer] = useState<Offer | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);

  useEffect(() => {
    if (id) {
      fetchOffer();
      if (user) {
        checkIfFavorite(id);
      } else {
        setIsFavorite(false);
      }
    }
  }, [id, user]);

  const fetchOffer = async () => {
    if (!id) return;
    
    try {
      const { data, error } = await supabase
        .from('offers')
        .select(`
          id,
          title,
          short_desc,
          long_desc,
          value_text,
          promo_type,
          value_number,
          conditions_text,
          terms_url,
          start_date,
          end_date,
          partner:partners(id, name, address, phone, website, instagram, photos),
          category:categories(name, icon)
        `)
        .eq('id', id)
        .eq('is_active', true)
        .single();

      if (error) {
        logger.error('Error fetching offer', error);
        toast({
          title: t('common.error'),
          description: t('offer_details.error_loading'),
          variant: "destructive",
        });
        navigate('/');
        return;
      }

      setOffer(data);
    } catch (error) {
      logger.error('Error in fetchOffer', error);
      toast({
        title: t('common.error'),
        description: t('offer_details.error_occurred'),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const checkIfFavorite = async (offerId: string) => {
    try {
      if (!user) {
        setIsFavorite(false);
        return;
      }

      const { data } = await supabase
        .from('favorites')
        .select('id')
        .eq('user_id', user.id)
        .eq('offer_id', offerId)
        .single();

      setIsFavorite(!!data);
    } catch (error) {
      // Not a favorite or not authenticated
      setIsFavorite(false);
    }
  };

  const toggleFavorite = async () => {
    try {
      if (!user) {
        toast({
          title: t('offer_details.login_required'),
          description: t('offer_details.login_to_favorite'),
          variant: "destructive"
        });
        return;
      }

      setIsTogglingFavorite(true);

      if (isFavorite) {
        await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('offer_id', id);
        
        setIsFavorite(false);
        toast({
          title: t('offer_details.removed_from_favorites'),
          description: t('offer_details.removed_from_favorites_desc'),
        });
      } else {
        await supabase
          .from('favorites')
          .insert({ user_id: user.id, offer_id: id });
        
        setIsFavorite(true);
        toast({
          title: t('offer_details.added_to_favorites'),
          description: t('offer_details.added_to_favorites_desc'),
        });
      }
    } catch (error) {
      logger.error('Error toggling favorite', error);
      toast({
        title: t('common.error'),
        description: t('offer_details.error_favorites'),
        variant: "destructive"
      });
    } finally {
      setIsTogglingFavorite(false);
    }
  };

  const handleShare = async () => {
    if (!offer) return;

    const shareData = {
      title: `${offer.title} - Pass Bali`,
      text: offer.short_desc || `Découvrez cette offre exclusive : ${offer.title}`,
      url: window.location.href,
    };

    try {
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
        toast({
          title: t('offer_details.shared'),
          description: t('offer_details.shared_successfully'),
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast({
          title: t('offer_details.link_copied'),
          description: t('offer_details.link_copied_desc'),
        });
      }
    } catch (error) {
      try {
        await navigator.clipboard.writeText(window.location.href);
        toast({
          title: t('offer_details.link_copied'),
          description: t('offer_details.link_copied_desc'),
        });
      } catch (clipboardError) {
        toast({
          title: t('offer_details.share_link'),
          description: window.location.href,
          duration: 10000,
        });
      }
    }
  };

  const handleUseOffer = async () => {
    try {
      if (!user) {
        toast({
          title: t('common.error'),
          description: t('offer_details.login_required'),
          variant: "destructive"
        });
        return;
      }

      if (!userPass || !hasActivePass) {
        toast({
          title: t('pass.no_pass'),
          description: t('pass.connect_to_access'),
          variant: "destructive",
        });
        navigate('/mon-pass');
        return;
      }

      // Here you would handle the QR scanning or redemption flow
      toast({
        title: t('offer.use_offer'),
        description: t('offer.qr_scan_required'),
      });

    } catch (error) {
      logger.error('Error using offer', error);
      toast({
        title: t('common.error'),
        description: t('auth.unexpected_error'),
        variant: "destructive"
      });
    }
  };

  const openNavigation = (address: string) => {
    if (!address) return;
    
    logger.debug("GPS Navigation from OfferDetails", { address });
    
    const encodedAddress = encodeURIComponent(address);
    
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isAndroid = /Android/.test(navigator.userAgent);
    
    logger.debug("Platform detected", { isIOS, isAndroid });
    
    if (isIOS) {
      const appleUrl = `maps://maps.apple.com/?q=${encodedAddress}`;
      logger.debug("Opening Apple Maps", { url: appleUrl });
      window.location.href = appleUrl;
    } else if (isAndroid) {
      const androidUrl = `geo:0,0?q=${encodedAddress}`;
      logger.debug("Opening Android Maps", { url: androidUrl });
      window.location.href = androidUrl;
    } else {
      const webUrl = `https://www.google.com/maps/search/${encodedAddress}`;
      logger.debug("Opening Web Google Maps", { url: webUrl });
      window.open(webUrl, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">{t('offer_details.loading')}</div>
      </div>
    );
  }

  if (!offer) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">{t('offer_details.offer_not_found')}</p>
          <Button onClick={() => navigate('/')}>{t('offer_details.back_to_home')}</Button>
        </div>
      </div>
    );
  }

  // Check if user has active pass
  const isActivePass = hasActivePass;
  const canUseOffer = user && userPass && isActivePass;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b">
        <div className="flex items-center justify-between h-16 px-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="w-10 h-10"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Button>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleFavorite}
              disabled={isTogglingFavorite}
              className={`w-10 h-10 ${isFavorite ? 'text-red-500' : ''}`}
            >
              {isFavorite ? (
                <Heart className="w-5 h-5 fill-current" />
              ) : (
                <HeartOff className="w-5 h-5" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleShare}
              className="w-10 h-10"
            >
              <Share2 className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      <div className="pb-20">
        {/* Hero Image */}
        <div className="relative h-64 bg-gradient-to-br from-primary/20 to-secondary/20">
          {offer.partner.photos && offer.partner.photos.length > 0 ? (
            <img
              src={offer.partner.photos[0]}
              alt={offer.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <p className="text-muted-foreground">Image à venir</p>
            </div>
          )}
          
          {/* Discount Badge */}
          {offer.value_text && (
            <div className="absolute top-4 left-4">
              <Badge className="bg-primary text-primary-foreground px-3 py-1">
                {offer.value_text}
              </Badge>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 space-y-6">
          {/* Title */}
          <div>
            <h1 className="text-2xl font-bold mb-2">{offer.title}</h1>
            {offer.short_desc && (
              <p className="text-muted-foreground">{offer.short_desc}</p>
            )}
          </div>

          {/* Partner Info */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">{offer.partner.name}</h3>
            </CardHeader>
            <CardContent className="space-y-3">
              {offer.partner.address && (
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{offer.partner.address}</span>
                </div>
              )}
              
              {offer.partner.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{offer.partner.phone}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Offer Details */}
          {offer.long_desc && (
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">{t('offer_details.details')}</h3>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{offer.long_desc}</p>
              </CardContent>
            </Card>
          )}

          {/* Conditions */}
          {offer.conditions_text && (
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">{t('offer_details.conditions')}</h3>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{offer.conditions_text}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4">
        <div className="flex gap-3">
          <Button 
            className="flex-1" 
            onClick={handleUseOffer}
            disabled={!canUseOffer}
          >
            {canUseOffer ? t('offers.use_offer') : t('offers.pass_required')}
          </Button>
          
          {offer.partner.address && (
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => openNavigation(offer.partner.address!)}
              title="Navigation"
            >
              <Navigation className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      <BottomNavigation />
      <FloatingActionButton />
    </div>
  );
}
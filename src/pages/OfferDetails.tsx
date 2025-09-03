import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MapPin, Star, Heart, Clock, Share2, Percent, Euro, Navigation } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { QRScanner } from "@/components/QRScanner";

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
  const [offer, setOffer] = useState<Offer | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [userPass, setUserPass] = useState<any>(null);
  const [isUsing, setIsUsing] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [isAlreadyUsed, setIsAlreadyUsed] = useState(false);

  useEffect(() => {
    if (id) {
      fetchOffer(id);
      checkIfFavorite(id);
      checkUserPass();
    }
  }, [id]);

  useEffect(() => {
    if (userPass && id) {
      checkIfOfferAlreadyUsed(id);
    }
  }, [userPass, id]);

  const checkUserPass = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('passes')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (data && new Date(data.expires_at) > new Date()) {
        setUserPass(data);
      }
    } catch (error) {
      console.error('Error checking user pass:', error);
    }
  };

  const fetchOffer = async (offerId: string) => {
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
        .eq('id', offerId)
        .eq('is_active', true)
        .single();

      if (error) {
        console.error('Error fetching offer:', error);
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
      console.error('Error:', error);
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
      const { data: { user } } = await supabase.auth.getUser();
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

  const checkIfOfferAlreadyUsed = async (offerId: string) => {
    try {
      if (!userPass) return;

      const { data } = await supabase
        .from('redemptions')
        .select('id')
        .eq('offer_id', offerId)
        .eq('pass_id', userPass.id)
        .single();

      setIsAlreadyUsed(!!data);
    } catch (error) {
      // Not used yet or error
      setIsAlreadyUsed(false);
    }
  };

  const toggleFavorite = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: t('offer_details.login_required'),
          description: t('offer_details.login_to_favorite'),
          variant: "destructive",
        });
        return;
      }

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
      console.error('Error toggling favorite:', error);
      toast({
        title: t('common.error'),
        description: t('offer_details.error_favorites'),
        variant: "destructive",
      });
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: offer?.title,
        text: offer?.short_desc,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: t('offer_details.link_copied'),
        description: t('offer_details.link_copied_desc'),
      });
    }
  };

  const handleUseOffer = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: t('common.error'),
          description: t('toast.must_be_logged_in'),
          variant: "destructive",
        });
        navigate('/auth');
        return;
      }

      if (!userPass) {
        toast({
          title: t('pass.no_pass'),
          description: t('pass.connect_to_access'),
          variant: "destructive",
        });
        navigate('/mon-pass');
        return;
      }

      // Ouvrir le scanner QR au lieu de créer directement la redemption
      setShowScanner(true);
      
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: t('common.error'),
        description: t('auth.unexpected_error'),
        variant: "destructive",
      });
    }
  };

  const handleScanSuccess = async (scannedData: any) => {
    // Fermer le scanner
    setShowScanner(false);
    
    try {
      if (!offer || !userPass) return;

      setIsUsing(true);

      // Créer la redemption après scan réussi
      const { error } = await supabase
        .from('redemptions')
        .insert({
          offer_id: offer.id,
          pass_id: userPass.id,
          partner_id: offer.partner.id,
          status: 'approved'
        });

      if (error) {
        console.error('Error using offer:', error);
        toast({
          title: t('common.error'),
          description: t('offer.use_error'),
          variant: "destructive",
        });
        return;
      }

      toast({
        title: t('offer.used_successfully'),
        description: t('offer.enjoy_discount'),
      });

      // Marquer l'offre comme utilisée
      setIsAlreadyUsed(true);

    } catch (error) {
      console.error('Error:', error);
      toast({
        title: t('common.error'),
        description: t('auth.unexpected_error'),
        variant: "destructive",
      });
    } finally {
      setIsUsing(false);
    }
  };

  const openNavigation = (address: string) => {
    if (!address) return;
    
    console.log("=== GPS Navigation Debug (OfferDetails) ===");
    console.log("Adresse reçue:", address);
    
    const encodedAddress = encodeURIComponent(address);
    
    // Detect platform and open appropriate navigation app
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isAndroid = /Android/.test(navigator.userAgent);
    
    console.log("Plateforme détectée:", { isIOS, isAndroid });
    
    if (isIOS) {
      // Try Apple Maps first
      const appleUrl = `maps://maps.apple.com/?q=${encodedAddress}`;
      console.log("Tentative Apple Maps:", appleUrl);
      window.location.href = appleUrl;
    } else if (isAndroid) {
      // Try Android Maps intent
      const androidUrl = `geo:0,0?q=${encodedAddress}`;
      console.log("URL Android Maps:", androidUrl);
      window.location.href = androidUrl;
    } else {
      // Use Google Maps for web
      const webUrl = `https://www.google.com/maps/search/${encodedAddress}`;
      console.log("URL Web Google Maps:", webUrl);
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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border">
        <div className="flex items-center justify-between h-14 px-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="w-9 h-9"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleFavorite}
              className="w-9 h-9"
            >
              <Heart className={`w-5 h-5 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleShare}
              className="w-9 h-9"
            >
              <Share2 className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="pb-20">
        {/* Image */}
        <div className="h-64 bg-gradient-card relative overflow-hidden">
          {offer.partner.photos && offer.partner.photos.length > 0 ? (
            <img
              src={offer.partner.photos[0]}
              alt={offer.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-lagoon/20 flex items-center justify-center">
              <p className="text-muted-foreground">{t('offer_card.image_coming_soon')}</p>
            </div>
          )}
          
          {/* Discount Badge */}
          {offer.value_text && (
            <div className="absolute top-4 left-4 px-4 py-2 rounded-full text-white text-sm font-bold backdrop-blur-sm border border-white/20 bg-gradient-to-r from-primary via-primary/90 to-primary/80 shadow-lg">
              {offer.value_text}
            </div>
          )}
        </div>

        <div className="p-4 space-y-6">
          {/* Title & Category */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              {offer.category.icon && (
                <span className="text-lg">{offer.category.icon}</span>
              )}
              <span className="text-sm text-primary font-medium">{t(`category_names.${offer.category.name}`) || offer.category.name}</span>
            </div>
            <h1 className="text-2xl font-bold text-foreground leading-tight">
              {offer.title}
            </h1>
          </div>

          {/* Partner Info */}
          <div className="bg-card rounded-lg p-4">
            <h3 className="font-semibold text-lg text-foreground mb-2">
              {offer.partner.name}
            </h3>
            {offer.partner.address && (
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <MapPin className="w-4 h-4" />
                <span className="text-sm">{offer.partner.address}</span>
              </div>
            )}
            {offer.partner.phone && (
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <span className="text-sm">📞 {offer.partner.phone}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-gold fill-current" />
              <span className="text-sm font-semibold">
                {(Math.random() * 1.5 + 3.5).toFixed(1)}
              </span>
              <span className="text-sm text-muted-foreground">
                ({Math.floor(Math.random() * 200) + 50} {t('offer_details.reviews')})
              </span>
            </div>
          </div>

          {/* Description */}
          {offer.short_desc && (
            <div>
              <h3 className="font-semibold text-foreground mb-2">{t('offer_details.description')}</h3>
              <p className="text-muted-foreground leading-relaxed">
                {offer.short_desc}
              </p>
            </div>
          )}

          {/* Long Description */}
          {offer.long_desc && (
            <div>
              <h3 className="font-semibold text-foreground mb-2">{t('offer_details.details')}</h3>
              <p className="text-muted-foreground leading-relaxed">
                {offer.long_desc}
              </p>
            </div>
          )}

          {/* Offer Details */}
          <div className="bg-card rounded-lg p-4">
            <h3 className="font-semibold text-foreground mb-3">{t('offer_details.offer_details')}</h3>
            <div className="space-y-3">
              {offer.promo_type && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    {offer.promo_type === 'percent' ? (
                      <Percent className="w-4 h-4 text-primary" />
                    ) : (
                      <Euro className="w-4 h-4 text-primary" />
                    )}
                  </div>
                  <span className="text-sm">
                    {t('offer_details.type')}: {offer.promo_type === 'percent' ? t('offer_details.percentage') : t('offer_details.fixed_amount')}
                  </span>
                </div>
              )}
              {offer.end_date && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-orange/10 rounded-full flex items-center justify-center">
                    <Clock className="w-4 h-4 text-orange" />
                  </div>
                  <span className="text-sm">
                    {t('offer_details.valid_until')} {new Date(offer.end_date).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Conditions */}
          {offer.conditions_text && (
            <div>
              <h3 className="font-semibold text-foreground mb-2">{t('offer_details.conditions')}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {offer.conditions_text}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Action */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border p-4">
        <div className="flex gap-3">
          <Button 
            className="flex-1" 
            size="lg"
            onClick={handleUseOffer}
            disabled={isUsing || !userPass || isAlreadyUsed}
            variant={isAlreadyUsed ? "secondary" : "default"}
          >
            {isUsing ? t('common.loading') : 
             isAlreadyUsed ? t('offers.already_used') : 
             t('offers.use_offer')}
          </Button>
          {offer.partner.address && (
            <Button 
              variant="outline" 
              size="lg"
              className="px-4 bg-gradient-to-r from-primary/10 to-lagoon/10 border-primary/20 hover:from-primary/20 hover:to-lagoon/20 hover:border-primary/30 hover:scale-105 transition-all duration-200 shadow-sm hover:shadow-md"
              onClick={() => openNavigation(offer.partner.address!)}
              title={t('offer_card.navigation')}
            >
              <Navigation className="w-5 h-5 text-primary" />
            </Button>
          )}
        </div>
      </div>

      {/* QR Scanner */}
      <QRScanner
        isOpen={showScanner}
        onClose={() => setShowScanner(false)}
        onScanSuccess={handleScanSuccess}
      />
    </div>
  );
}
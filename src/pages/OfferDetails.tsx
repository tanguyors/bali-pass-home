import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, MapPin, Star, Heart, Clock, Share2, Percent, Euro, Navigation, Phone, Globe, Instagram, Calendar, CheckCircle, Sparkles, Gift } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { QRScanner } from "@/components/QRScanner";
import { logger } from "@/lib/logger";

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
    
    logger.debug("GPS Navigation from OfferDetails", { address });
    
    const encodedAddress = encodeURIComponent(address);
    
    // Detect platform and open appropriate navigation app
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isAndroid = /Android/.test(navigator.userAgent);
    
    logger.debug("Platform detected", { isIOS, isAndroid });
    
    if (isIOS) {
      // Try Apple Maps first
      const appleUrl = `maps://maps.apple.com/?q=${encodedAddress}`;
      logger.debug("Opening Apple Maps", { url: appleUrl });
      window.location.href = appleUrl;
    } else if (isAndroid) {
      // Try Android Maps intent
      const androidUrl = `geo:0,0?q=${encodedAddress}`;
      logger.debug("Opening Android Maps", { url: androidUrl });
      window.location.href = androidUrl;
    } else {
      // Use Google Maps for web
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      {/* Modern Header */}
      <div className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-700/50">
        <div className="flex items-center justify-between h-16 px-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="w-12 h-12 rounded-full bg-white/50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50 hover:bg-white dark:hover:bg-slate-800 shadow-sm transition-all duration-300"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleFavorite}
              className={`w-12 h-12 rounded-full border transition-all duration-300 ${
                isFavorite 
                  ? 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400' 
                  : 'bg-white/50 dark:bg-slate-800/50 border-slate-200/50 dark:border-slate-700/50 hover:bg-white dark:hover:bg-slate-800'
              }`}
            >
              <Heart className={`w-5 h-5 transition-all duration-300 ${isFavorite ? 'fill-current scale-110' : ''}`} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleShare}
              className="w-12 h-12 rounded-full bg-white/50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50 hover:bg-white dark:hover:bg-slate-800 shadow-sm transition-all duration-300"
            >
              <Share2 className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Content with scroll animations */}
      <div className="pb-24">
        {/* Hero Image Section */}
        <div className="relative h-80 overflow-hidden">
          {offer.partner.photos && offer.partner.photos.length > 0 ? (
            <div className="relative w-full h-full">
              <img
                src={offer.partner.photos[0]}
                alt={offer.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
            </div>
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/30 via-secondary/20 to-lagoon/30 flex items-center justify-center relative">
              <div className="absolute inset-0 bg-grid-white/10"></div>
              <div className="relative z-10 text-center">
                <Sparkles className="w-16 h-16 text-white/80 mx-auto mb-4" />
                <p className="text-white/90 font-medium">{t('offer_card.image_coming_soon')}</p>
              </div>
            </div>
          )}
          
          {/* Floating Discount Badge */}
          {offer.value_text && (
            <div className="absolute top-6 left-6 animate-fade-in">
              <div className="px-6 py-3 rounded-2xl text-white font-bold backdrop-blur-xl bg-gradient-to-r from-primary/90 to-secondary/90 border border-white/20 shadow-2xl">
                <div className="flex items-center gap-2">
                  <Gift className="w-5 h-5" />
                  <span className="text-lg">{offer.value_text}</span>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Main Content */}
        <div className="px-6 -mt-8 relative z-10 space-y-6">
          {/* Title Card */}
          <Card className="border-0 shadow-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl animate-slide-in-right">
            <CardContent className="p-6">
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white leading-tight mb-2">
                {offer.title}
              </h1>
              {offer.short_desc && (
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  {offer.short_desc}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Partner Info Card */}
          <Card className="border-0 shadow-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl animate-fade-in">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                    {offer.partner.name}
                  </h3>
                </div>
              </div>

              <div className="space-y-3">
                {offer.partner.address && (
                  <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-primary" />
                    </div>
                    <span className="text-slate-700 dark:text-slate-300 flex-1">{offer.partner.address}</span>
                  </div>
                )}
                
                {offer.partner.phone && (
                  <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                    <div className="w-10 h-10 bg-green-500/10 rounded-full flex items-center justify-center">
                      <Phone className="w-5 h-5 text-green-600" />
                    </div>
                    <span className="text-slate-700 dark:text-slate-300 flex-1">{offer.partner.phone}</span>
                  </div>
                )}

                {offer.partner.website && (
                  <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                    <div className="w-10 h-10 bg-blue-500/10 rounded-full flex items-center justify-center">
                      <Globe className="w-5 h-5 text-blue-600" />
                    </div>
                    <span className="text-slate-700 dark:text-slate-300 flex-1">{offer.partner.website}</span>
                  </div>
                )}

                {offer.partner.instagram && (
                  <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                    <div className="w-10 h-10 bg-pink-500/10 rounded-full flex items-center justify-center">
                      <Instagram className="w-5 h-5 text-pink-600" />
                    </div>
                    <span className="text-slate-700 dark:text-slate-300 flex-1">@{offer.partner.instagram}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Offer Details Card */}
          <Card className="border-0 shadow-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl animate-scale-in">
            <CardContent className="p-6">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-primary" />
                {t('offer_details.offer_details')}
              </h3>
              
              <div className="grid grid-cols-1 gap-4">
                {offer.promo_type && (
                  <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-xl border border-primary/10">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      {offer.promo_type === 'percent' ? (
                        <Percent className="w-6 h-6 text-primary" />
                      ) : (
                        <Euro className="w-6 h-6 text-primary" />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white">
                        {t('offer_details.type')}
                      </p>
                      <p className="text-slate-600 dark:text-slate-300">
                        {offer.promo_type === 'percent' ? t('offer_details.percentage') : t('offer_details.fixed_amount')}
                      </p>
                    </div>
                  </div>
                )}
                
                {offer.end_date && (
                  <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-orange/5 to-amber-500/5 rounded-xl border border-orange/10">
                    <div className="w-12 h-12 bg-orange/10 rounded-full flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-orange" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white">
                        {t('offer_details.valid_until')}
                      </p>
                      <p className="text-slate-600 dark:text-slate-300">
                        {new Date(offer.end_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Long Description */}
          {offer.long_desc && (
            <Card className="border-0 shadow-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl animate-fade-in">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                  {t('offer_details.details')}
                </h3>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  {offer.long_desc}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Conditions */}
          {offer.conditions_text && (
            <Card className="border-0 shadow-xl bg-amber-50/80 dark:bg-amber-950/20 backdrop-blur-xl border border-amber-200/50 dark:border-amber-800/50 animate-fade-in">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-amber-900 dark:text-amber-100 mb-4 flex items-center gap-2">
                  <CheckCircle className="w-6 h-6" />
                  {t('offer_details.conditions')}
                </h3>
                <p className="text-amber-800 dark:text-amber-200 leading-relaxed">
                  {offer.conditions_text}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Modern Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-t border-slate-200/50 dark:border-slate-700/50 p-6">
        <div className="flex gap-4">
          <Button 
            className="flex-1 h-14 bg-gradient-to-r from-primary via-primary to-secondary hover:from-primary/90 hover:via-primary/90 hover:to-secondary/90 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:transform-none" 
            onClick={handleUseOffer}
            disabled={isUsing || !userPass || isAlreadyUsed}
          >
            <div className="flex items-center gap-3">
              {isUsing ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : isAlreadyUsed ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <Gift className="w-5 h-5" />
              )}
              <span className="text-lg">
                {isUsing ? t('common.loading') : 
                 isAlreadyUsed ? t('offers.already_used') : 
                 t('offers.use_offer')}
              </span>
            </div>
          </Button>
          
          {offer.partner.address && (
            <Button 
              variant="outline" 
              size="lg"
              className="h-14 px-6 bg-white/50 dark:bg-slate-800/50 border-2 border-primary/20 hover:bg-primary/5 hover:border-primary/40 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg"
              onClick={() => openNavigation(offer.partner.address!)}
              title={t('offer_card.navigation')}
            >
              <Navigation className="w-6 h-6 text-primary" />
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
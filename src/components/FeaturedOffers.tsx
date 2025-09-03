import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { MapPin, Navigation } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { logger } from "@/lib/logger";

interface Offer {
  id: string;
  title: string;
  short_desc?: string;
  value_text?: string;
  promo_type?: string;
  value_number?: number;
  partner: {
    name: string;
    address?: string;
    phone?: string;
    photos?: string[];
  };
}

interface EnhancedOffer extends Offer {
  badge_color: 'green' | 'red';
}

interface UserPass {
  id: string;
  status: string;
  expires_at: string;
}

export function FeaturedOffers() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [offers, setOffers] = useState<EnhancedOffer[]>([]);
  const [user, setUser] = useState<any>(null);
  const [userPass, setUserPass] = useState<UserPass | null>(null);

  useEffect(() => {
    fetchFeaturedOffers();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          fetchUserPass(session.user.id);
        } else {
          setUserPass(null);
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserPass(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserPass = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('passes')
        .select('id, status, expires_at')
        .eq('user_id', userId)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        logger.error('Error fetching user pass', error);
        return;
      }

      setUserPass(data);
    } catch (error) {
      logger.error('Error in fetchUserPass', error);
    }
  };

  const openNavigation = (address: string) => {
    if (!address) return;
    
    logger.debug("GPS Navigation", { address });
    
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

  const fetchFeaturedOffers = async () => {
    try {
      // Simplified query - get offers first, then partners separately if needed
      const { data, error } = await supabase
        .from('offers')
        .select(`
          id,
          title,
          short_desc,
          value_text,
          promo_type,
          value_number,
          partner_id
        `)
        .eq('is_featured', true)
        .eq('is_active', true)
        .limit(5);
      
      if (error) {
        logger.error('Error fetching featured offers', error);
        return;
      }
      
      if (data && data.length > 0) {
        // Get partner details separately to avoid complex joins
        const partnerIds = data.map(offer => offer.partner_id);
        const { data: partners } = await supabase
          .from('partners')
          .select('id, name, address, phone, photos')
          .in('id', partnerIds)
          .eq('status', 'approved');

        const partnersMap = partners?.reduce((acc, partner) => {
          acc[partner.id] = partner;
          return acc;
        }, {} as Record<string, any>) || {};

        // Enhance offers with partner data and badge color
        const enhancedOffers: EnhancedOffer[] = data
          .filter(offer => partnersMap[offer.partner_id]) // Only approved partners
          .map(offer => ({
            ...offer,
            partner: partnersMap[offer.partner_id],
            badge_color: offer.promo_type === 'percent' ? 'red' : 'green'
          }));
        
        setOffers(enhancedOffers);
      }
    } catch (error) {
      logger.error('Error in fetchFeaturedOffers', error);
    }
  };

  const hasActivePass = !!userPass && new Date(userPass.expires_at) > new Date();
  const shouldBlur = !user || !hasActivePass;

  if (offers.length === 0) {
    return null;
  }

  return (
    <div className="mt-8">
      {/* Section Header */}
      <div className="px-4 mb-4">
        <h2 className="text-xl font-bold text-foreground">
          {t('featured_offers.title')}
        </h2>
        <p className="text-mobile-body text-muted-foreground">
          {t('featured_offers.subtitle')}
        </p>
      </div>

      {/* Horizontal Swipeable Carousel */}
      <div className="overflow-x-auto">
        <div className="flex gap-4 px-4 pb-4" style={{ scrollSnapType: 'x mandatory' }}>
          {offers.map((offer) => (
            <div
              key={offer.id}
              className={`flex-shrink-0 w-72 bg-card rounded-2xl overflow-hidden shadow-bali hover:shadow-bali-4 transition-shadow duration-200 flex flex-col relative ${shouldBlur ? 'blur-sm' : ''}`}
              style={{ scrollSnapAlign: 'start' }}
            >
              {shouldBlur && (
                <div className="absolute inset-0 bg-black/20 z-10 flex items-center justify-center">
                  <div className="bg-white/95 backdrop-blur-sm rounded-lg p-4 mx-4 text-center">
                    <p className="text-sm font-medium text-gray-800 mb-2">
                      {t('offers.connect_message')}
                    </p>
                    <p className="text-xs text-gray-600 mb-3">
                      {t('offers.access_details')}
                    </p>
                    <Button
                      size="sm"
                      onClick={() => navigate('/auth')}
                      className="text-xs"
                    >
                      {t('offers.connect_button')}
                    </Button>
                  </div>
                </div>
              )}
              {/* Large Image with Discount Badge */}
              <div className="h-48 bg-gradient-card relative overflow-hidden">
                {offer.partner?.photos && offer.partner.photos.length > 0 ? (
                  <img
                    src={offer.partner.photos[0]}
                    alt={offer.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary/20 to-lagoon/20 flex items-center justify-center">
                    <p className="text-muted-foreground text-sm">Image à venir</p>
                  </div>
                )}
                
                {/* Discount Badge - Top Left */}
                {offer.value_text && (
                  <div className={`absolute top-3 left-3 px-3 py-1.5 rounded-full text-white text-xs font-bold shadow-sm ${
                    offer.badge_color === 'red' 
                      ? 'bg-red-500' 
                      : 'bg-green-500'
                  }`}>
                    {offer.value_text}
                  </div>
                )}
              </div>
              
              {/* Content Section */}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div className="flex-1">
                  {/* Title */}
                  <h3 className="font-bold text-lg text-foreground mb-2 line-clamp-2 leading-tight">
                    {offer.title}
                  </h3>
                  
                  {/* Partner info with location */}
                  <div className="mb-3">
                    <p className="font-semibold text-sm text-foreground mb-1">
                      {offer.partner?.name}
                    </p>
                    {offer.partner?.address && (
                      <div className="flex items-center gap-1 mb-1">
                        <MapPin className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {offer.partner.address}
                        </p>
                      </div>
                    )}
                    {offer.partner?.phone && (
                      <p className="text-xs text-muted-foreground">
                        📞 {offer.partner.phone}
                      </p>
                    )}
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex gap-2 justify-center items-center">
                  <Button 
                    variant="pill" 
                    size="sm" 
                    className="px-4 flex-1 h-9 disabled:opacity-50"
                    onClick={() => navigate(`/offer/${offer.id}`)}
                    disabled={shouldBlur}
                  >
                    {t('offers.view_offer')}
                  </Button>
                  {offer.partner?.address && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="px-3 h-9 w-12 flex-shrink-0 bg-gradient-to-r from-primary/10 to-lagoon/10 border-primary/20 hover:from-primary/20 hover:to-lagoon/20 hover:border-primary/30 hover:scale-105 transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50"
                      onClick={() => openNavigation(offer.partner.address!)}
                      disabled={shouldBlur}
                      title="Navigation GPS"
                    >
                      <Navigation className="w-4 h-4 text-primary" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
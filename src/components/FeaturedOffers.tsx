import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { MapPin, Star, Navigation } from "lucide-react";

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
    photos?: string[];
  };
}

interface EnhancedOffer extends Offer {
  rating: number;
  badge_color: 'green' | 'red';
}

export function FeaturedOffers() {
  const navigate = useNavigate();
  const [offers, setOffers] = useState<EnhancedOffer[]>([]);

  useEffect(() => {
    fetchFeaturedOffers();
  }, []);

  const openNavigation = (address: string) => {
    if (!address) return;
    
    console.log("=== GPS Navigation Debug ===");
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
      // Use OpenStreetMap for web (works better in sandbox)
      const osmUrl = `https://www.openstreetmap.org/search?query=${encodedAddress}#map=15`;
      console.log("URL OpenStreetMap:", osmUrl);
      window.open(osmUrl, '_blank');
    }
  };

  const fetchFeaturedOffers = async () => {
    try {
      const { data, error } = await supabase
        .from('offers')
        .select(`
          id,
          title,
          short_desc,
          value_text,
          promo_type,
          value_number,
          partner:partners(name, address, photos)
        `)
        .eq('is_featured', true)
        .eq('is_active', true)
        .limit(5);
      
      if (error) {
        console.error('Error fetching featured offers:', error);
        return;
      }
      
      if (data) {
        // Enhance offers with rating and badge color
        const enhancedOffers: EnhancedOffer[] = data.map(offer => ({
          ...offer,
          rating: Number((Math.random() * 1.5 + 3.5).toFixed(1)), // 3.5-5.0 rating
          badge_color: offer.promo_type === 'percent' ? 'red' : 'green'
        }));
        
        setOffers(enhancedOffers);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  if (offers.length === 0) {
    return null;
  }

  return (
    <div className="mt-8">
      {/* Section Header */}
      <div className="px-4 mb-4">
        <h2 className="text-xl font-bold text-foreground">
          Offres mises en avant
        </h2>
        <p className="text-mobile-body text-muted-foreground">
          Les meilleures opportunités du moment
        </p>
      </div>

      {/* Horizontal Swipeable Carousel */}
      <div className="overflow-x-auto">
        <div className="flex gap-4 px-4 pb-4" style={{ scrollSnapType: 'x mandatory' }}>
          {offers.map((offer) => (
            <div
              key={offer.id}
              className="flex-shrink-0 w-72 bg-card rounded-2xl overflow-hidden shadow-bali hover:shadow-bali-4 transition-shadow duration-200"
              style={{ scrollSnapAlign: 'start' }}
            >
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
              <div className="p-4">
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
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {offer.partner.address}
                      </p>
                    </div>
                  )}
                </div>
                
                {/* Rating */}
                <div className="flex items-center gap-1 mb-4">
                  <Star className="w-4 h-4 text-gold fill-current" />
                  <span className="text-sm font-semibold text-foreground">
                    {offer.rating}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    ({Math.floor(Math.random() * 200) + 50} avis)
                  </span>
                </div>
                
                {/* Action Buttons */}
                <div className="flex gap-2 justify-center">
                  <Button 
                    variant="pill" 
                    size="sm" 
                    className="px-4 flex-1"
                    onClick={() => navigate(`/offer/${offer.id}`)}
                  >
                    Voir l'offre
                  </Button>
                  {offer.partner?.address && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="px-3"
                      onClick={() => openNavigation(offer.partner.address!)}
                      title="Navigation GPS"
                    >
                      <Navigation className="w-4 h-4" />
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
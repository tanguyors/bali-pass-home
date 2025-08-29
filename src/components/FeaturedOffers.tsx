import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { MapPin, Star } from "lucide-react";

interface Offer {
  id: string;
  title: string;
  short_desc?: string;
  value_text?: string;
  partner: {
    name: string;
    address?: string;
  };
  photos?: string[];
}

export function FeaturedOffers() {
  const [offers, setOffers] = useState<Offer[]>([]);

  useEffect(() => {
    fetchFeaturedOffers();
  }, []);

  const fetchFeaturedOffers = async () => {
    try {
      const { data, error } = await supabase
        .from('offers')
        .select(`
          id,
          title,
          short_desc,
          value_text,
          photos,
          partner:partners(name, address)
        `)
        .eq('is_featured', true)
        .eq('is_active', true)
        .limit(3);
      
      if (error) {
        console.error('Error fetching featured offers:', error);
        return;
      }
      
      if (data) {
        setOffers(data);
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
      </div>

      {/* Featured Offers */}
      <div className="space-y-4 px-4">
        {offers.map((offer) => (
          <div
            key={offer.id}
            className="bg-card rounded-2xl overflow-hidden shadow-bali"
          >
            {/* Offer Image */}
            <div className="h-40 bg-gradient-card flex items-center justify-center relative">
              {offer.photos && offer.photos.length > 0 ? (
                <img
                  src={offer.photos[0]}
                  alt={offer.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <p className="text-muted-foreground text-sm">Image à venir</p>
              )}
              
              {/* Discount badge */}
              {offer.value_text && (
                <div className="absolute top-3 left-3 bg-coral text-coral-foreground px-3 py-1 rounded-full text-xs font-bold">
                  {offer.value_text}
                </div>
              )}
            </div>
            
            {/* Offer Content */}
            <div className="p-4">
              <h3 className="font-semibold text-foreground mb-1 line-clamp-2">
                {offer.title}
              </h3>
              
              {offer.short_desc && (
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                  {offer.short_desc}
                </p>
              )}
              
              {/* Partner info */}
              <div className="flex items-center gap-2 mb-3">
                <div className="flex-1">
                  <p className="font-medium text-sm text-foreground">
                    {offer.partner?.name}
                  </p>
                  {offer.partner?.address && (
                    <div className="flex items-center gap-1 mt-1">
                      <MapPin className="w-3 h-3 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {offer.partner.address}
                      </p>
                    </div>
                  )}
                </div>
                
                {/* Rating placeholder */}
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-gold fill-current" />
                  <span className="text-sm font-medium">4.8</span>
                </div>
              </div>
              
              {/* Action button */}
              <Button variant="pillOrange" size="sm" className="w-full">
                Voir
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
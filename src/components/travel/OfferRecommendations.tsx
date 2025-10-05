import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, MapPin } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { useOfferRecommendations } from "@/hooks/useOfferRecommendations";
import { usePlannedOffers } from "@/hooks/usePlannedOffers";

interface OfferRecommendationsProps {
  cityId: string;
  cityName: string;
  cityLat: number;
  cityLng: number;
  dayId: string;
}

export function OfferRecommendations({ cityId, cityName, dayId }: OfferRecommendationsProps) {
  const { t, getTranslatedText } = useTranslation();
  const { offers, isLoading } = useOfferRecommendations(cityId);
  const { addOffer } = usePlannedOffers(dayId);

  const handleAddOffer = (offerId: string) => {
    addOffer.mutate({
      itinerary_day_id: dayId,
      offer_id: offerId,
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-muted/50 rounded-lg w-2/3 animate-pulse"></div>
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-4 animate-pulse">
            <div className="h-32 bg-muted/50 rounded-lg mb-3"></div>
            <div className="h-4 bg-muted/50 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-muted/50 rounded w-1/2"></div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-5 sticky top-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl p-4 border border-primary/20">
        <h3 className="text-lg font-bold text-foreground mb-1">
          {t('travelPlanner.offersIn')} {cityName}
        </h3>
        <p className="text-sm text-muted-foreground">
          {offers.length} {offers.length === 1 ? t('travelPlanner.offer') : t('travelPlanner.offers')}
        </p>
      </div>

      {/* Offers grid */}
      <div className="space-y-4 max-h-[calc(100vh-300px)] overflow-y-auto pr-2 custom-scrollbar">
        {offers.map((offer) => (
          <Card key={offer.id} className="group overflow-hidden hover:shadow-xl transition-all border-border/50 hover:border-primary/30">
            {offer.photos && offer.photos[0] && (
              <div className="relative h-40 overflow-hidden">
                <img
                  src={offer.photos[0]}
                  alt={offer.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                {offer.partners?.name && (
                  <div className="absolute bottom-3 left-3 right-3">
                    <span className="text-xs font-medium text-white bg-black/40 backdrop-blur-sm px-2.5 py-1 rounded-full">
                      {offer.partners.name}
                    </span>
                  </div>
                )}
              </div>
            )}
            <div className="p-4">
              <h4 className="font-semibold text-base mb-2 leading-snug line-clamp-2">
                {getTranslatedText(offer.title, {
                  en: offer.title_en,
                  es: offer.title_es,
                  id: offer.title_id,
                  zh: offer.title_zh,
                })}
              </h4>
              <p className="text-sm text-muted-foreground mb-4 line-clamp-2 leading-relaxed">
                {getTranslatedText(offer.short_desc, {
                  en: offer.short_desc_en,
                  es: offer.short_desc_es,
                  id: offer.short_desc_id,
                  zh: offer.short_desc_zh,
                })}
              </p>
              <Button
                size="sm"
                className="w-full bg-primary/90 hover:bg-primary shadow-md hover:shadow-lg transition-all"
                onClick={() => handleAddOffer(offer.id)}
              >
                <Plus className="mr-2 h-4 w-4" />
                {t('travelPlanner.addToDay')}
              </Button>
            </div>
          </Card>
        ))}

        {offers.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground font-medium">
              {t('travelPlanner.noOffersAvailable')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

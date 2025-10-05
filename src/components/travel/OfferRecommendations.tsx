import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
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
      <Card className="p-6 shadow-elegant">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-muted rounded w-3/4"></div>
          <div className="h-20 bg-muted rounded"></div>
          <div className="h-20 bg-muted rounded"></div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 shadow-elegant">
      <h3 className="text-lg font-semibold mb-4">
        {t('travelPlanner.offersIn')} {cityName}
      </h3>

      <div className="space-y-4 max-h-[600px] overflow-y-auto">
        {offers.map((offer) => (
          <Card key={offer.id} className="p-4">
            {offer.photos && offer.photos[0] && (
              <img
                src={offer.photos[0]}
                alt={offer.title}
                className="w-full h-32 object-cover rounded-md mb-3"
              />
            )}
            <h4 className="font-medium mb-1">
              {getTranslatedText(offer.title, {
                en: offer.title_en,
                es: offer.title_es,
                id: offer.title_id,
                zh: offer.title_zh,
              })}
            </h4>
            <p className="text-sm text-muted-foreground mb-2">
              {offer.partners?.name}
            </p>
            <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
              {getTranslatedText(offer.short_desc, {
                en: offer.short_desc_en,
                es: offer.short_desc_es,
                id: offer.short_desc_id,
                zh: offer.short_desc_zh,
              })}
            </p>
            <Button
              size="sm"
              className="w-full"
              onClick={() => handleAddOffer(offer.id)}
            >
              <Plus className="mr-2 h-4 w-4" />
              {t('travelPlanner.addToDay')}
            </Button>
          </Card>
        ))}

        {offers.length === 0 && (
          <p className="text-center text-muted-foreground py-8">
            {t('travelPlanner.noOffersAvailable')}
          </p>
        )}
      </div>
    </Card>
  );
}

import { Card } from "@/components/ui/card";
import { format } from "date-fns";
import { fr, enUS, es, id as idLocale, zhCN } from "date-fns/locale";
import { MapPin, Calendar, Map as MapIcon } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { type Itinerary } from "@/hooks/useItineraries";
import { type ItineraryDay } from "@/hooks/useItineraryDays";
import { usePlannedOffers } from "@/hooks/usePlannedOffers";
import { ItineraryMap } from "./ItineraryMap";
import { useState } from "react";
import { Button } from "../ui/button";
import { useNavigate } from "react-router-dom";

interface ItinerarySummaryProps {
  itinerary: Itinerary;
  days: ItineraryDay[];
}

const localeMap = {
  fr: fr,
  en: enUS,
  es: es,
  id: idLocale,
  zh: zhCN,
};

export function ItinerarySummary({ itinerary, days }: ItinerarySummaryProps) {
  const { t, language } = useTranslation();
  const currentLocale = localeMap[language] || fr;
  const navigate = useNavigate();
  const [showMap, setShowMap] = useState(true);

  // Prepare days with offers for the map
  const daysWithOffers = days.map(day => ({
    ...day,
    itinerary_planned_offers: day.itinerary_planned_offers || []
  }));

  return (
    <div className="space-y-6">
      {/* Map view toggle */}
      <div className="flex justify-end">
        <Button
          variant={showMap ? "default" : "outline"}
          size="sm"
          onClick={() => setShowMap(!showMap)}
          className="gap-2"
        >
          <MapIcon className="w-4 h-4" />
          {showMap ? t('travelPlanner.hideMap') || 'Masquer la carte' : t('travelPlanner.showMap') || 'Voir sur la carte'}
        </Button>
      </div>

      {/* Map */}
      {showMap && (
        <ItineraryMap
          days={daysWithOffers}
          onOfferClick={(offerId) => navigate(`/offer/${offerId}`)}
        />
      )}

      {/* Summary Card */}
      <Card className="p-6 shadow-elegant">
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2">{itinerary.title}</h2>
          {itinerary.description && (
            <p className="text-muted-foreground mb-4">{itinerary.description}</p>
          )}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span>
              {format(new Date(itinerary.start_date), "PP", { locale: currentLocale })} -{" "}
              {format(new Date(itinerary.end_date), "PP", { locale: currentLocale })}
            </span>
          </div>
        </div>

        <div className="space-y-6">
          {days.map((day, index) => (
            <DaySummary
              key={day.id}
              day={day}
              dayNumber={index + 1}
              currentLocale={currentLocale}
              t={t}
            />
          ))}
        </div>
      </Card>
    </div>
  );
}

function DaySummary({ day, dayNumber, currentLocale, t }: any) {
  const { plannedOffers } = usePlannedOffers(day.id);
  const { getTranslatedText } = useTranslation();

  return (
    <div className="border-l-4 border-primary pl-4">
      <div className="mb-2">
        <h3 className="font-semibold text-lg">
          {t('travelPlanner.day')} {dayNumber} - {format(new Date(day.day_date), "EEEE, PP", { locale: currentLocale })}
        </h3>
        {day.cities && (
          <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
            <MapPin className="w-3 h-3" />
            <span>{day.cities.name}</span>
          </div>
        )}
        {day.notes && (
          <p className="text-sm text-muted-foreground mt-2">{day.notes}</p>
        )}
      </div>

      {plannedOffers.length > 0 && (
        <div className="mt-3 space-y-2">
          <p className="text-sm font-medium">{t('travelPlanner.plannedActivities')}:</p>
          {plannedOffers.map((po) => (
            <Card key={po.id} className="p-3">
              <div className="flex items-start gap-3">
                {po.offers?.photos?.[0] && (
                  <img
                    src={po.offers.photos[0]}
                    alt={po.offers.title}
                    className="w-16 h-16 object-cover rounded"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">
                    {po.offers ? getTranslatedText(po.offers.title, {
                      en: po.offers.title_en,
                      es: po.offers.title_es,
                      id: po.offers.title_id,
                      zh: po.offers.title_zh,
                    }) : "Offre"}
                  </p>
                  {po.offers?.partners?.name && (
                    <p className="text-xs text-muted-foreground">{po.offers.partners.name}</p>
                  )}
                  {po.planned_time && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {t('travelPlanner.time')}: {po.planned_time}
                    </p>
                  )}
                  {po.notes && (
                    <p className="text-xs text-muted-foreground mt-1">{po.notes}</p>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

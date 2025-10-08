import { useParams, useNavigate } from "react-router-dom";
import { useSharedItinerary, useDuplicateItinerary } from "@/hooks/useSharedItinerary";
import { useTranslation } from "@/hooks/useTranslation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Calendar, MapPin, Copy, Star, Map as MapIcon, Clock } from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { fr, enUS, es, id as idLocale, zhCN } from "date-fns/locale";
import { ItineraryMap } from "@/components/travel/ItineraryMap";
import { useState } from "react";
import baliHeroImage from "@/assets/bali-hero.jpg";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";

const localeMap = {
  fr: fr,
  en: enUS,
  es: es,
  id: idLocale,
  zh: zhCN,
};

export default function SharedItinerary() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { t, language } = useTranslation();
  const { user } = useAuth();
  const currentLocale = localeMap[language] || fr;
  const [showMap, setShowMap] = useState(true);

  const { data: itinerary, isLoading } = useSharedItinerary(token);
  const duplicateItinerary = useDuplicateItinerary();

  const handleDuplicate = () => {
    if (!user) {
      navigate("/auth");
      return;
    }
    if (token) {
      duplicateItinerary.mutate(token);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-lg">Chargement...</div>
      </div>
    );
  }

  if (!itinerary) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Itinéraire non trouvé</h1>
          <Button onClick={() => navigate("/")}>Retour à l'accueil</Button>
        </div>
      </div>
    );
  }

  const days = (itinerary as any).itinerary_days || [];
  const daysDiff = differenceInDays(new Date(itinerary.end_date), new Date(itinerary.start_date)) + 1;
  const uniqueCities = [...new Set(days.map((d: any) => d.cities?.name).filter(Boolean))];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div 
        className="relative h-[60vh] bg-cover bg-center"
        style={{ backgroundImage: `url(${baliHeroImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />
        
        <div className="relative h-full flex flex-col items-center justify-center text-white px-4">
          <Badge variant="secondary" className="mb-4 bg-white/20 text-white border-white/30">
            <MapIcon className="w-3 h-3 mr-1" />
            {t('travelPlanner.sharedBy') || 'Shared by'} PassBali
          </Badge>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-4 text-center">
            {itinerary.title}
          </h1>
          
          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 text-sm md:text-base mb-8">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 md:w-5 md:h-5" />
              <span>
                {format(new Date(itinerary.start_date), "dd/MM/yyyy")} - {format(new Date(itinerary.end_date), "dd/MM/yyyy")}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 md:w-5 md:h-5" />
              <span>{daysDiff} {t('travelPlanner.days') || 'days'}</span>
            </div>
          </div>

          <Button 
            size="lg" 
            onClick={handleDuplicate}
            disabled={duplicateItinerary.isPending}
            className="bg-white text-primary hover:bg-white/90 shadow-lg"
          >
            <Copy className="w-4 h-4 mr-2" />
            {user 
              ? (duplicateItinerary.isPending ? t('travelPlanner.duplicating') || 'Duplication...' : t('travelPlanner.useItinerary') || 'Dupliquer cet itinéraire')
              : (t('travelPlanner.signInToDuplicate') || 'Se connecter pour dupliquer')
            }
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 py-8 md:py-12">
        {/* Why PassBali Card */}
        <Card className="p-6 md:p-8 mb-8 shadow-lg">
          <div className="flex items-center gap-2 mb-6 text-primary">
            <Star className="w-5 h-5" />
            <h2 className="text-2xl font-bold">
              {t('travelPlanner.whyPassBali') || 'Why PassBali?'}
            </h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Star className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <p className="text-muted-foreground">
                {t('travelPlanner.benefit1') || '200+ exclusive offers throughout Bali'}
              </p>
            </div>
            <div className="flex items-start gap-3">
              <Star className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <p className="text-muted-foreground">
                {t('travelPlanner.benefit2') || 'Save up to 50% on your activities'}
              </p>
            </div>
            <div className="flex items-start gap-3">
              <Star className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <p className="text-muted-foreground">
                {t('travelPlanner.benefit3') || 'Plan your trip with our interactive tool'}
              </p>
            </div>
            <div className="flex items-start gap-3">
              <Star className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <p className="text-muted-foreground">
                {t('travelPlanner.benefit4') || 'Unique pass valid for 1 year from activation'}
              </p>
            </div>
          </div>

          <Button 
            className="w-full mt-6" 
            variant="outline"
            onClick={() => navigate("/")}
          >
            {t('travelPlanner.discoverPassBali') || 'Discover PassBali'}
          </Button>
        </Card>

        {/* Itinerary Summary Card */}
        <Card className="p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-2xl font-semibold">{itinerary.title}</h3>
            {(itinerary as any).is_active && (
              <Badge className="bg-primary text-primary-foreground">
                {t('travelPlanner.active') || 'Active'}
              </Badge>
            )}
          </div>

          {itinerary.description && (
            <p className="text-muted-foreground mb-4">{itinerary.description}</p>
          )}

          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>
                {format(new Date(itinerary.start_date), "d MMM", { locale: currentLocale })} -{" "}
                {format(new Date(itinerary.end_date), "d MMM yyyy", { locale: currentLocale })}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>{daysDiff} {t('travelPlanner.days') || 'days'}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              <span>{uniqueCities.length} {t('travelPlanner.cities') || 'cities'}</span>
            </div>
          </div>
        </Card>

        {/* Itinerary Overview with Map */}
        {days.some(d => d.itinerary_planned_offers?.length > 0) && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <MapIcon className="w-5 h-5 text-primary" />
              <h2 className="text-2xl font-bold">
                {t('travelPlanner.itineraryOverview') || 'Itinerary Overview'}
              </h2>
            </div>

            {showMap && (
              <div className="mb-6 rounded-xl overflow-hidden shadow-lg">
                <ItineraryMap
                  days={days}
                  onOfferClick={(offerId) => navigate(`/offer/${offerId}`)}
                />
              </div>
            )}
          </div>
        )}

        {/* Daily Details */}
        {days.length > 0 && (
          <Card className="p-6 mb-8">
            <h2 className="text-2xl font-bold mb-6">
              {t('travelPlanner.dailyPlan') || 'Daily Plan'}
            </h2>
            <div className="space-y-6">
              {days.map((day, index) => (
                <DaySection 
                  key={day.id} 
                  day={day} 
                  dayNumber={index + 1}
                  currentLocale={currentLocale}
                  t={t}
                  navigate={navigate}
                />
              ))}
            </div>
          </Card>
        )}

        {/* CTA Section */}
        <Card className="p-8 text-center bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            {t('travelPlanner.readyForAdventure') || 'Ready to live this adventure?'}
          </h2>
          <p className="text-muted-foreground mb-6">
            {t('travelPlanner.duplicateItinerary') || 'Duplicate this itinerary and customize it to your liking with PassBali'}
          </p>
          <Button size="lg" onClick={handleDuplicate} disabled={duplicateItinerary.isPending}>
            <Copy className="w-4 h-4 mr-2" />
            {user 
              ? (duplicateItinerary.isPending ? t('travelPlanner.duplicating') || 'Duplication...' : t('travelPlanner.useItinerary') || 'Dupliquer cet itinéraire')
              : (t('travelPlanner.signInToDuplicate') || 'Se connecter pour dupliquer')
            }
          </Button>
        </Card>
      </div>
    </div>
  );
}

function DaySection({ day, dayNumber, currentLocale, t, navigate }: any) {
  const { getTranslatedText } = useTranslation();
  const plannedOffers = day.itinerary_planned_offers || [];

  return (
    <div className="border-l-2 border-primary/30 pl-4 py-2">
      <div className="mb-3">
        <div className="flex items-center gap-2 mb-1">
          <Badge variant="outline" className="font-semibold">
            {t('travelPlanner.day')} {dayNumber}
          </Badge>
          <h4 className="font-semibold">
            {format(new Date(day.day_date), "EEEE d MMMM yyyy", { locale: currentLocale })}
          </h4>
        </div>
        
        {day.cities && (
          <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
            <MapPin className="w-3 h-3" />
            <span>{day.cities.name}</span>
          </div>
        )}
      </div>

      {plannedOffers.length === 0 ? (
        <p className="text-sm italic text-muted-foreground">
          {t('travelPlanner.noOffersPlanned') || 'No offers planned'}
        </p>
      ) : (
        <div className="space-y-3">
          {plannedOffers.map((po: any) => {
            if (!po.offers) return null;
            
            const offer = po.offers;
            const title = getTranslatedText(offer.title, {
              en: offer.title_en,
              es: offer.title_es,
              id: offer.title_id,
              zh: offer.title_zh,
            });
            
            const description = getTranslatedText(offer.description, {
              en: offer.description_en,
              es: offer.description_es,
              id: offer.description_id,
              zh: offer.description_zh,
            });

            return (
              <Card 
                key={po.id} 
                className="p-4 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => navigate(`/offer/${offer.id}`)}
              >
                {offer.discount_amount && (
                  <Badge className="mb-2 bg-primary/10 text-primary border-primary/20">
                    {offer.discount_type === 'percentage' 
                      ? `${offer.discount_amount}% OFF`
                      : `${offer.discount_amount} OFF`
                    }
                  </Badge>
                )}
                
                <div className="flex gap-4">
                  {offer.photos?.[0] && (
                    <img
                      src={offer.photos[0]}
                      alt={title}
                      className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
                    />
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <h5 className="font-semibold mb-1">{title}</h5>
                    
                    {offer.partners?.name && (
                      <p className="text-sm text-muted-foreground mb-2">
                        {offer.partners.name}
                      </p>
                    )}
                    
                    {description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {description}
                      </p>
                    )}
                    
                    {po.planned_time && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
                        <Clock className="w-3 h-3" />
                        <span>{po.planned_time}</span>
                      </div>
                    )}
                    
                    {po.notes && (
                      <p className="text-xs text-muted-foreground mt-1 italic">
                        {po.notes}
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

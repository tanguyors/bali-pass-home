import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useUserPass } from "@/hooks/useUserPass";
import { Navigate, useNavigate } from "react-router-dom";
import { MapPin, Plus, ListChecks, CalendarDays, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useItineraries } from "@/hooks/useItineraries";
import { useItineraryDays } from "@/hooks/useItineraryDays";
import { ItineraryList } from "@/components/travel/ItineraryList";
import { DayTimeline } from "@/components/travel/DayTimeline";
import { OfferRecommendations } from "@/components/travel/OfferRecommendations";
import { CreateItineraryModal } from "@/components/travel/CreateItineraryModal";
import { ItinerarySummary } from "@/components/travel/ItinerarySummary";
import { ItineraryTemplates } from "@/components/travel/ItineraryTemplates";
import { useTranslation } from "@/hooks/useTranslation";
import { LanguageSelector } from "@/components/LanguageSelector";
import { BottomNavigation } from "@/components/BottomNavigation";
import { FloatingActionButton } from "@/components/FloatingActionButton";

const TravelPlanner = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { hasPass, loading: passLoading } = useUserPass();
  const { itineraries, isLoading: itinerariesLoading } = useItineraries();
  const [selectedItineraryId, setSelectedItineraryId] = useState<string | null>(null);
  const [selectedDayId, setSelectedDayId] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  const { days } = useItineraryDays(selectedItineraryId);
  const selectedDay = days.find(d => d.id === selectedDayId);
  const { createItinerary } = useItineraries();

  const handleSelectTemplate = async (template: any) => {
    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + template.duration - 1);

    await createItinerary.mutateAsync({
      title: template.title,
      description: template.description,
      start_date: startDate.toISOString().split('T')[0],
      end_date: endDate.toISOString().split('T')[0],
      is_active: true
    });
  };

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (passLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!hasPass) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="p-8 max-w-md text-center">
          <MapPin className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-bold mb-2">{t('travelPlanner.messages.passRequired')}</h2>
          <p className="text-muted-foreground mb-4">
            {t('travelPlanner.messages.passRequiredDescription')}
          </p>
          <Button onClick={() => navigate("/mon-pass")}>
            {t('travelPlanner.messages.getPass')}
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-tropical-sand to-tropical-sand/50">
      {/* Language Selector - Floating bottom right */}
      <div
        className="fixed right-4 z-50"
        style={{ bottom: "calc(env(safe-area-inset-bottom, 0px) + 88px)" }}
      >
        <LanguageSelector />
      </div>

      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-xl border-b border-border/50 safe-top">
        <div className="container mx-auto px-4 max-w-7xl py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="hover:bg-card/60 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-foreground">{t('travelPlanner.header.title')}</h1>
              <p className="text-sm text-muted-foreground">{t('travelPlanner.header.subtitle')}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-7xl pb-24 pt-6">
            {/* Mobile-native header */}
            <div className="bg-background rounded-2xl p-6 mb-6 border border-border/50">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-foreground mb-1">{t('travelPlanner.title')}</h2>
                  <p className="text-sm text-muted-foreground">
                    {t('travelPlanner.subtitle')}
                  </p>
                </div>
              </div>
              <Button 
                onClick={() => setShowCreateModal(true)} 
                className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all"
              >
                <Plus className="mr-2 h-5 w-5" />
                {t('travelPlanner.newItinerary')}
              </Button>
            </div>

            {itinerariesLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : itineraries.length === 0 ? (
              <ItineraryTemplates onSelectTemplate={handleSelectTemplate} />
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-3">
                  <ItineraryList
                    itineraries={itineraries}
                    selectedId={selectedItineraryId}
                    onSelect={setSelectedItineraryId}
                  />
                </div>

                <div className="lg:col-span-9">
                  {selectedItineraryId ? (
                    <Tabs defaultValue="plan" className="w-full">
                      <TabsList className="grid w-full max-w-md grid-cols-2 mb-4">
                        <TabsTrigger value="plan" className="flex items-center gap-2">
                          <CalendarDays className="w-4 h-4" />
                          {t('travelPlanner.tabs.plan')}
                        </TabsTrigger>
                        <TabsTrigger value="summary" className="flex items-center gap-2">
                          <ListChecks className="w-4 h-4" />
                          {t('travelPlanner.tabs.summary')}
                        </TabsTrigger>
                      </TabsList>

                      <TabsContent value="plan" className="mt-0">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                          <div className="lg:col-span-7">
                            <DayTimeline
                              itineraryId={selectedItineraryId}
                              days={days}
                              selectedDayId={selectedDayId}
                              onSelectDay={setSelectedDayId}
                            />
                          </div>

                          <div className="lg:col-span-5">
                            {selectedDay?.cities ? (
                              <OfferRecommendations
                                cityLat={selectedDay.cities.geo_center_lat}
                                cityLng={selectedDay.cities.geo_center_lng}
                                cityName={selectedDay.cities.name}
                                cityId={selectedDay.cities.id}
                                dayId={selectedDay.id}
                              />
                            ) : (
                              <Card className="p-8 text-center shadow-elegant">
                                <p className="text-muted-foreground">
                                  {t('travelPlanner.selectDay')}
                                </p>
                              </Card>
                            )}
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="summary" className="mt-0">
                        <ItinerarySummary
                          itinerary={itineraries.find(i => i.id === selectedItineraryId)!}
                          days={days}
                        />
                      </TabsContent>
                    </Tabs>
                  ) : (
                    <Card className="p-8 text-center shadow-elegant">
                      <p className="text-muted-foreground">
                        {t('travelPlanner.selectItinerary')}
                      </p>
                    </Card>
                  )}
                </div>
              </div>
            )}
      </div>

      <CreateItineraryModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
      />

      <FloatingActionButton />
      <BottomNavigation />
    </div>
  );
};

export default TravelPlanner;

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useUserPass } from "@/hooks/useUserPass";
import { Navigate, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { MapPin, Plus, ListChecks, CalendarDays, LogOut, User, Heart, Settings, ShoppingBag, QrCode, ArrowLeft } from "lucide-react";
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
import { useTranslation } from "@/hooks/useTranslation";
import { LanguageSelector } from "@/components/LanguageSelector";
import BaliPassLogo from "@/components/BaliPassLogo";
import { BottomNavigation } from "@/components/BottomNavigation";
import { FloatingActionButton } from "@/components/FloatingActionButton";

const TravelPlanner = () => {
  const { user } = useAuth();
  
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { hasPass, loading: passLoading } = useUserPass();
  const { itineraries, isLoading: itinerariesLoading } = useItineraries();
  const [selectedItineraryId, setSelectedItineraryId] = useState<string | null>(null);
  const [selectedDayId, setSelectedDayId] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeTab, setActiveTab] = useState("planner");
  
  const { days } = useItineraryDays(selectedItineraryId);
  const selectedDay = days.find(d => d.id === selectedDayId);

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
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              {t('nav.signOut')}
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-7xl pb-24 pt-6">

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="planner" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              {t('travelPlanner.title')}
            </TabsTrigger>
            <TabsTrigger value="pass" className="flex items-center gap-2" onClick={() => navigate("/mon-pass")}>
              <QrCode className="h-4 w-4" />
              {t('travelPlanner.tabs.myPass')}
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center gap-2" onClick={() => navigate("/profil")}>
              <User className="h-4 w-4" />
              {t('travelPlanner.tabs.profile')}
            </TabsTrigger>
            <TabsTrigger value="favorites" className="flex items-center gap-2" onClick={() => navigate("/favorites")}>
              <Heart className="h-4 w-4" />
              {t('travelPlanner.tabs.favorites')}
            </TabsTrigger>
            <TabsTrigger value="used-offers" className="flex items-center gap-2" onClick={() => navigate("/pass-history")}>
              <ShoppingBag className="h-4 w-4" />
              {t('travelPlanner.tabs.usedOffers')}
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2" onClick={() => navigate("/profil")}>
              <Settings className="h-4 w-4" />
              {t('travelPlanner.tabs.settings')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="planner">
            <Card className="p-6 mb-6 shadow-elegant">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <MapPin className="w-8 h-8 text-primary" />
                  <div>
                    <h2 className="text-2xl font-bold">{t('travelPlanner.title')}</h2>
                    <p className="text-muted-foreground">
                      {t('travelPlanner.subtitle')}
                    </p>
                  </div>
                </div>
                <Button onClick={() => setShowCreateModal(true)} size="lg">
                  <Plus className="mr-2 h-5 w-5" />
                  {t('travelPlanner.newItinerary')}
                </Button>
              </div>
            </Card>

            {itinerariesLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : itineraries.length === 0 ? (
              <Card className="p-12 text-center shadow-elegant">
                <MapPin className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">{t('travelPlanner.noItineraries')}</h3>
                <p className="text-muted-foreground mb-6">
                  {t('travelPlanner.noItinerariesDesc')}
                </p>
                <Button onClick={() => setShowCreateModal(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  {t('travelPlanner.createFirst')}
                </Button>
              </Card>
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
          </TabsContent>
        </Tabs>
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

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "./contexts/LanguageContext";
import Index from "./pages/Index";
import Explorer from "./pages/Explorer";
import MonPass from "./pages/MonPass";
import PassHistory from "./pages/PassHistory";
import Auth from "./pages/Auth";
import Profil from "./pages/Profil";
import OfferDetails from "./pages/OfferDetails";
import Favorites from "./pages/Favorites";
import PartnerDetail from "./pages/PartnerDetail";
import TravelPlanner from "./pages/TravelPlanner";
import SharedItinerary from "./pages/SharedItinerary";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <LanguageProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/explorer" element={<Explorer />} />
            <Route path="/mon-pass" element={<MonPass />} />
            <Route path="/pass-history" element={<PassHistory />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/profil" element={<Profil />} />
            <Route path="/offer/:id" element={<OfferDetails />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/partner/:slug" element={<PartnerDetail />} />
            <Route path="/travel-planner" element={<TravelPlanner />} />
            <Route path="/shared-itinerary/:token" element={<SharedItinerary />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </LanguageProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
import { HeroUnauthenticated } from "@/components/HeroUnauthenticated";
import { HeroNoPass } from "@/components/HeroNoPass";
import { HeroWithPass } from "@/components/HeroWithPass";
import { PricingHighlight } from "@/components/PricingHighlight";
import { QuickActions } from "@/components/QuickActions";
import { CategoriesSlider } from "@/components/CategoriesSlider";
import { FeaturedOffers } from "@/components/FeaturedOffers";
import { ReassuranceSection } from "@/components/ReassuranceSection";
import { FinalCTABanner } from "@/components/FinalCTABanner";
import { BottomNavigation } from "@/components/BottomNavigation";
import { FloatingActionButton } from "@/components/FloatingActionButton";
import { PassSummarySection } from "@/components/PassSummarySection";
import { LanguageSelector } from "@/components/LanguageSelector";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";

const Index = () => {
  const { t } = useLanguage();
  const { user, userPass, loading, isAuthenticated, hasActivePass } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">{t('common.loading')}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Language Selector - Fixed at top right with safe-area handling */}
      <div
        className="fixed right-4 z-50"
        style={{ top: "calc(env(safe-area-inset-top, 0px) + 8px)" }}
      >
        <LanguageSelector />
      </div>
      
      {/* Main Content */}
      <main className="pb-20">
        {/* Conditional Hero Section */}
        {!isAuthenticated && <HeroUnauthenticated />}
        {isAuthenticated && !hasActivePass && <HeroNoPass />}
        {isAuthenticated && hasActivePass && <HeroWithPass user={user} />}
        
        {/* Pricing Highlight - only show for unauthenticated or users without pass */}
        {(!isAuthenticated || !hasActivePass) && <PricingHighlight />}
        
        {/* Quick Actions - only for authenticated users */}
        {isAuthenticated && <QuickActions hasActivePass={hasActivePass} />}
        
        {/* Pass Summary - only for users with active pass */}
        {isAuthenticated && hasActivePass && userPass && <PassSummarySection pass={userPass} />}
        
        {/* Categories Slider */}
        <CategoriesSlider />
        
        {/* Featured Offers */}
        <FeaturedOffers />
        
        {/* Reassurance Section - only for non-authenticated */}
        {!isAuthenticated && <ReassuranceSection />}
        
        {/* Final CTA Banner - only for users without pass */}
        {(!isAuthenticated || !hasActivePass) && <FinalCTABanner />}
      </main>
      
      {/* Floating Action Button - only for users with pass */}
      {hasActivePass && <FloatingActionButton />}
      
      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
};

export default Index;

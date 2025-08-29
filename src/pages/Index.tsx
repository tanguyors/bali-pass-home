import { BaliPassHeader } from "@/components/BaliPassHeader";
import { BaliPassHero } from "@/components/BaliPassHero";
import { PricingHighlight } from "@/components/PricingHighlight";
import { QuickActions } from "@/components/QuickActions";
import { DestinationsSection } from "@/components/DestinationsSection";
import { CategoriesSlider } from "@/components/CategoriesSlider";
import { FeaturedOffers } from "@/components/FeaturedOffers";
import { ReassuranceSection } from "@/components/ReassuranceSection";
import { FinalCTABanner } from "@/components/FinalCTABanner";
import { BottomNavigation } from "@/components/BottomNavigation";
import { FloatingActionButton } from "@/components/FloatingActionButton";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header - Sticky */}
      <BaliPassHeader />
      
      {/* Main Content */}
      <main className="pb-20">
        {/* Hero Section */}
        <BaliPassHero />
        
        {/* Pricing Highlight Card */}
        <PricingHighlight />
        
        {/* Quick Actions */}
        <QuickActions />
        
        {/* Destinations */}
        <DestinationsSection />
        
        {/* Categories Slider */}
        <CategoriesSlider />
        
        {/* Featured Offers */}
        <FeaturedOffers />
        
        {/* Reassurance Section */}
        <ReassuranceSection />
        
        {/* Final CTA Banner */}
        <FinalCTABanner />
      </main>
      
      {/* Floating Action Button */}
      <FloatingActionButton />
      
      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
};

export default Index;

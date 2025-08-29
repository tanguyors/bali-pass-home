import { BaliPassHeader } from "@/components/BaliPassHeader";
import { HeroUnauthenticated } from "@/components/HeroUnauthenticated";
import { HeroNoPass } from "@/components/HeroNoPass";
import { HeroWithPass } from "@/components/HeroWithPass";
import { PricingHighlight } from "@/components/PricingHighlight";
import { QuickActions } from "@/components/QuickActions";
import { DestinationsSection } from "@/components/DestinationsSection";
import { CategoriesSlider } from "@/components/CategoriesSlider";
import { FeaturedOffers } from "@/components/FeaturedOffers";
import { ReassuranceSection } from "@/components/ReassuranceSection";
import { FinalCTABanner } from "@/components/FinalCTABanner";
import { BottomNavigation } from "@/components/BottomNavigation";
import { FloatingActionButton } from "@/components/FloatingActionButton";
import { PassSummarySection } from "@/components/PassSummarySection";
import { AuthButtons } from "@/components/AuthButtons";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";

interface UserPass {
  id: string;
  status: string;
  expires_at: string;
  purchased_at: string;
}

const Index = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userPass, setUserPass] = useState<UserPass | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          fetchUserPass(session.user.id);
        } else {
          setUserPass(null);
        }
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserPass(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserPass = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('passes')
        .select('id, status, expires_at, purchased_at')
        .eq('user_id', userId)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user pass:', error);
        return;
      }

      setUserPass(data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">Chargement...</div>
      </div>
    );
  }

  // Determine user state
  const isAuthenticated = !!user;
  const hasActivePass = !!userPass && new Date(userPass.expires_at) > new Date();

  return (
    <div className="min-h-screen bg-background">
      {/* Header - Sticky */}
      <BaliPassHeader />
      
      {/* Main Content */}
      <main className="pb-20">
        {/* Conditional Hero Section */}
        {!isAuthenticated && <HeroUnauthenticated />}
        {isAuthenticated && !hasActivePass && <HeroNoPass />}
        {isAuthenticated && hasActivePass && <HeroWithPass user={user} />}
        
        {/* Auth Buttons for unauthenticated users */}
        {!isAuthenticated && <AuthButtons />}
        
        {/* Pricing Highlight - only show for unauthenticated or users without pass */}
        {(!isAuthenticated || !hasActivePass) && <PricingHighlight />}
        
        {/* Quick Actions - different for users with pass */}
        <QuickActions hasActivePass={hasActivePass} />
        
        {/* Pass Summary - only for users with active pass */}
        {isAuthenticated && hasActivePass && userPass && <PassSummarySection pass={userPass} />}
        
        {/* Destinations */}
        <DestinationsSection />
        
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

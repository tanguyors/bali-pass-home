import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';
import { logger } from '@/lib/logger';

interface UserPass {
  id: string;
  status: string;
  expires_at: string;
  purchased_at: string;
}

interface PassSettings {
  setting_key: string;
  setting_value: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  offers_count: number;
  gradient: string;
}

interface FeaturedOffer {
  id: string;
  title: string;
  short_desc?: string;
  value_text?: string;
  promo_type?: string;
  value_number?: number;
  partner_id: string;
  partner?: {
    id: string;
    name: string;
    address?: string;
    phone?: string;
    photos?: string[];
  };
  badge_color: 'green' | 'red';
}

interface AppData {
  user: User | null;
  session: Session | null;
  userPass: UserPass | null;
  passSettings: PassSettings[];
  categories: Category[];
  featuredOffers: FeaturedOffer[];
  loading: boolean;
  hasActivePass: boolean;
  isAuthenticated: boolean;
}

export function useAppData(): AppData {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userPass, setUserPass] = useState<UserPass | null>(null);
  const [passSettings, setPassSettings] = useState<PassSettings[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredOffers, setFeaturedOffers] = useState<FeaturedOffer[]>([]);
  const [loading, setLoading] = useState(true);

  // Gradient palette for categories
  const gradientPalette = [
    "bg-gradient-to-br from-primary/80 to-lagoon/60",
    "bg-gradient-to-br from-coral/80 to-orange/60", 
    "bg-gradient-to-br from-gold/80 to-orange/60",
    "bg-gradient-to-br from-lagoon/80 to-primary/60",
    "bg-gradient-to-br from-orange/80 to-coral/60",
    "bg-gradient-to-br from-primary/80 to-gold/60",
  ];

  // Fetch all app data in parallel
  const fetchAppData = useCallback(async (userId?: string) => {
    try {
      // Execute all queries in parallel
      const [passSettingsResult, categoriesResult, offersResult, userPassResult] = await Promise.all([
        supabase.from('pass_settings').select('setting_key, setting_value'),
        supabase.from('categories').select('id, name, slug, icon').order('name', { ascending: true }),
        supabase.from('offers').select(`
          id, title, short_desc, value_text, promo_type, value_number, partner_id
        `).eq('is_featured', true).eq('is_active', true).limit(5),
        userId ? supabase
          .from('passes')
          .select('id, status, expires_at, purchased_at')
          .eq('user_id', userId)
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle() : Promise.resolve({ data: null, error: null })
      ]);
      
      // Process pass settings
      if (passSettingsResult.data) {
        setPassSettings(passSettingsResult.data);
      }

      // Process categories with offer counts
      if (categoriesResult.data && categoriesResult.data.length > 0) {
        // Get offers count for each category
        const { data: offerCounts } = await supabase
          .from('offers')
          .select('category_id, partners!inner(status)')
          .eq('is_active', true);

        const countsByCategory = (offerCounts || []).reduce((acc, offer) => {
          if (offer.partners?.status === 'approved') {
            acc[offer.category_id] = (acc[offer.category_id] || 0) + 1;
          }
          return acc;
        }, {} as Record<string, number>);

        const categoriesWithExtras: Category[] = categoriesResult.data
          .map((category: any, index: number) => ({
            id: category.id,
            name: category.name,
            slug: category.slug,
            icon: category.icon,
            offers_count: countsByCategory[category.id] || 0,
            gradient: gradientPalette[index % gradientPalette.length]
          }))
          .filter((category: Category) => category.offers_count > 0);
        
        setCategories(categoriesWithExtras);
      }

      // Process featured offers
      if (offersResult.data && offersResult.data.length > 0) {
        const partnerIds = offersResult.data.map((offer: any) => offer.partner_id);
        const { data: partners } = await supabase
          .from('partners')
          .select('id, name, address, phone, photos')
          .in('id', partnerIds)
          .eq('status', 'approved');

        const partnersMap = partners?.reduce((acc, partner) => {
          acc[partner.id] = partner;
          return acc;
        }, {} as Record<string, any>) || {};

        const enhancedOffers: FeaturedOffer[] = offersResult.data
          .filter((offer: any) => partnersMap[offer.partner_id])
          .map((offer: any) => ({
            ...offer,
            partner: partnersMap[offer.partner_id],
            badge_color: offer.promo_type === 'percent' ? 'red' : 'green'
          }));
        
        setFeaturedOffers(enhancedOffers);
      }

      // Process user pass if authenticated
      if (userId && userPassResult.data) {
        setUserPass(userPassResult.data);
      }

    } catch (error) {
      logger.error('Error fetching app data', error);
    }
  }, [gradientPalette]);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await fetchAppData(session.user.id);
        } else {
          setUserPass(null);
          await fetchAppData(); // Fetch public data only
        }
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        await fetchAppData(session.user.id);
      } else {
        await fetchAppData(); // Fetch public data only
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [fetchAppData]);

  const hasActivePass = !!userPass && new Date(userPass.expires_at) > new Date();
  const isAuthenticated = !!user;

  return {
    user,
    session,
    userPass,
    passSettings,
    categories,
    featuredOffers,
    loading,
    hasActivePass,
    isAuthenticated,
  };
}
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';

interface Profile {
  id: string;
  user_id: string;
  name: string | null;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  locale: string | null;
  user_type: string | null;
}

interface UserPass {
  id: string;
  status: 'active' | 'expired' | 'pending' | 'refunded';
  expires_at: string;
  purchased_at: string;
  qr_token: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  userPass: UserPass | null;
  loading: boolean;
  isAuthenticated: boolean;
  hasActivePass: boolean;
  refreshUserData: () => Promise<void>;
  setProfile: (profile: Profile | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userPass, setUserPass] = useState<UserPass | null>(null);
  const [loading, setLoading] = useState(true);

  const isAuthenticated = !!user;
  const hasActivePass = !!userPass && new Date(userPass.expires_at) > new Date();

  let fetchingData = false;

  const fetchUserData = async (userId: string) => {
    if (fetchingData) return; // Éviter les appels simultanés
    fetchingData = true;

    try {
      // Fetch profile et pass en parallèle sans timeouts
      const [profileResult, passResult] = await Promise.allSettled([
        supabase
          .from('profiles')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle(),
        supabase
          .from('passes')
          .select('*')
          .eq('user_id', userId)
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle()
      ]);

      // Traiter les résultats du profil
      if (profileResult.status === 'fulfilled') {
        const { data: profileData, error: profileError } = profileResult.value;
        if (profileError) {
          logger.error('Error fetching profile', profileError);
          setProfile(null);
        } else {
          setProfile(profileData);
        }
      } else {
        logger.error('Profile fetch failed', profileResult.reason);
        setProfile(null);
      }

      // Traiter les résultats du pass
      if (passResult.status === 'fulfilled') {
        const { data: passData, error: passError } = passResult.value;
        if (passError) {
          logger.error('Error fetching pass', passError);
          setUserPass(null);
        } else {
          setUserPass(passData);
        }
      } else {
        logger.error('Pass fetch failed', passResult.reason);
        setUserPass(null);
      }
    } catch (error) {
      logger.error('Error in fetchUserData', error);
      setProfile(null);
      setUserPass(null);
    } finally {
      fetchingData = false;
    }
  };

  const refreshUserData = async () => {
    if (user) {
      await fetchUserData(user.id);
    }
  };

  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        
        if (!mounted) return;
        
        setSession(initialSession);
        setUser(initialSession?.user ?? null);
        
        if (initialSession?.user) {
          // Utiliser setTimeout pour éviter de bloquer le loading
          setTimeout(() => {
            if (mounted) {
              fetchUserData(initialSession.user.id);
            }
          }, 0);
        }
        
        // Toujours définir loading à false après l'authentification
        setLoading(false);
      } catch (error) {
        logger.error('Error initializing auth', error);
        setLoading(false);
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!mounted) return;

        logger.debug('Auth state changed', { event });
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Utiliser setTimeout pour éviter de bloquer
          setTimeout(() => {
            if (mounted) {
              fetchUserData(session.user.id);
            }
          }, 0);
        } else {
          setProfile(null);
          setUserPass(null);
        }
        
        setLoading(false);
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        session, 
        profile, 
        userPass, 
        loading, 
        isAuthenticated, 
        hasActivePass, 
        refreshUserData,
        setProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
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

  const fetchUserData = async (userId: string) => {
    try {
      // Set a timeout for database queries
      const fetchWithTimeout = async (query: any, label: string) => {
        return Promise.race([
          query,
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error(`${label} timeout`)), 10000)
          )
        ]);
      };
      
      // Fetch profile with timeout
      try {
        const { data: profileData, error: profileError } = await fetchWithTimeout(
          supabase
            .from('profiles')
            .select('*')
            .eq('user_id', userId)
            .maybeSingle(),
          'Profile fetch'
        );

        if (profileError) {
          logger.error('Error fetching profile', profileError);
        } else {
          setProfile(profileData);
        }
      } catch (profileTimeout) {
        console.error('AuthContext: Profile fetch timeout');
        setProfile(null);
      }

      // Fetch active pass with timeout
      try {
        const { data: passData, error: passError } = await fetchWithTimeout(
          supabase
            .from('passes')
            .select('*')
            .eq('user_id', userId)
            .eq('status', 'active')
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle(),
          'Pass fetch'
        );

        if (passError) {
          logger.error('Error fetching pass', passError);
        } else {
          setUserPass(passData);
        }
      } catch (passTimeout) {
        console.error('AuthContext: Pass fetch timeout');
        setUserPass(null);
      }
    } catch (error) {
      logger.error('Error in fetchUserData', error);
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
          await fetchUserData(initialSession.user.id);
        }
      } catch (error) {
        logger.error('Error initializing auth', error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        logger.debug('Auth state changed', { event });
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await fetchUserData(session.user.id);
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
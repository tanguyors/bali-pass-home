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
      console.log('AuthContext: Starting fetchUserData for:', userId);
      
      // Fetch profile
      console.log('AuthContext: Fetching profile...');
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      console.log('AuthContext: Profile result:', { profileData, profileError });

      if (profileError && profileError.code !== 'PGRST116') {
        logger.error('Error fetching profile', profileError);
      } else {
        setProfile(profileData);
      }

      // Fetch active pass
      console.log('AuthContext: Fetching pass...');
      const { data: passData, error: passError } = await supabase
        .from('passes')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      console.log('AuthContext: Pass result:', { passData, passError });

      if (passError && passError.code !== 'PGRST116') {
        logger.error('Error fetching pass', passError);
      } else {
        setUserPass(passData);
      }
      
      console.log('AuthContext: fetchUserData completed successfully');
    } catch (error) {
      console.error('AuthContext: Error in fetchUserData', error);
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
        console.log('AuthContext: Starting auth initialization');
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        console.log('AuthContext: Got session', !!initialSession);
        
        if (!mounted) return;
        
        setSession(initialSession);
        setUser(initialSession?.user ?? null);
        
        if (initialSession?.user) {
          console.log('AuthContext: Fetching user data for:', initialSession.user.id);
          await fetchUserData(initialSession.user.id);
          console.log('AuthContext: User data fetched');
        }
      } catch (error) {
        console.error('AuthContext: Error initializing auth', error);
        logger.error('Error initializing auth', error);
      } finally {
        if (mounted) {
          console.log('AuthContext: Setting loading to false');
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
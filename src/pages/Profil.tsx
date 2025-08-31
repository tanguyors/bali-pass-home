import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  User as UserIcon, 
  CreditCard,
  Search,
  QrCode,
  Bell,
  Mail,
  Globe,
  HelpCircle,
  MessageCircle,
  FileText,
  LogOut,
  Edit,
  Shield,
  Star,
  Award,
  Calendar,
  MapPin,
  Settings,
  ChevronRight
} from 'lucide-react';
import { BottomNavigation } from '@/components/BottomNavigation';
import { FloatingActionButton } from '@/components/FloatingActionButton';
import { EditProfileDialog } from '@/components/EditProfileDialog';
import { ChangePasswordDialog } from '@/components/ChangePasswordDialog';
import { SupportLink } from '@/components/SupportLink';
import { useToast } from '@/hooks/use-toast';

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

interface Pass {
  id: string;
  status: 'active' | 'expired' | 'pending' | 'refunded';
  expires_at: string;
  purchased_at: string;
}

interface UserPreferences {
  push_notifications: boolean;
  email_notifications: boolean;
  language: string;
}

const Profil: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [pass, setPass] = useState<Pass | null>(null);
  const [preferences, setPreferences] = useState<UserPreferences>({
    push_notifications: false,
    email_notifications: false,
    language: 'fr'
  });
  const [updating, setUpdating] = useState(false);
  
  const navigate = useNavigate();
  const { toast } = useToast();

  // Auth state management
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch user data when authenticated
  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = async () => {
    if (!user) return;

    try {
      // Fetch user profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (profileData) {
        setProfile(profileData);
      }

      // Fetch active pass
      const { data: passData } = await supabase
        .from('passes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (passData) {
        setPass(passData);
      }

      // Set preferences from profile data
      if (profileData) {
        setPreferences({
          push_notifications: true,
          email_notifications: true,
          language: profileData.locale || 'fr'
        });
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Erreur",
        description: "Impossible de se déconnecter",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Déconnexion réussie",
        description: "À bientôt sur Bali'Pass !",
      });
      navigate('/');
    }
  };

  const updatePreference = async (key: keyof UserPreferences, value: boolean | string) => {
    setUpdating(true);
    
    try {
      setPreferences(prev => ({ ...prev, [key]: value }));
      
      if (key === 'language' && user) {
        await supabase
          .from('profiles')
          .update({ locale: value as string })
          .eq('user_id', user.id);
      }
      
      toast({
        title: "Préférences mises à jour",
        description: "Vos préférences ont été sauvegardées",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder les préférences",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  const getInitials = (name: string | null, firstName: string | null, lastName: string | null): string => {
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
    }
    if (name) {
      const parts = name.split(' ');
      return parts.length > 1 
        ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
        : name.slice(0, 2).toUpperCase();
    }
    return 'U';
  };

  const getDisplayName = (): string => {
    if (profile?.first_name && profile?.last_name) {
      return `${profile.first_name} ${profile.last_name}`;
    }
    if (profile?.name) {
      return profile.name;
    }
    return user?.email?.split('@')[0] || 'Utilisateur';
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const getPassStatusLabel = (): string => {
    if (!pass) return 'Aucun pass';
    
    switch (pass.status) {
      case 'active':
        return 'Pass actif';
      case 'expired':
        return 'Pass expiré';
      case 'pending':
        return 'Pass en attente';
      default:
        return 'Pass inactif';
    }
  };

  const getPassStatusVariant = (): "default" | "secondary" | "destructive" => {
    if (!pass) return 'secondary';
    return pass.status === 'active' ? 'default' : 'destructive';
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Not authenticated state
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <div className="flex-1 p-4">
          <div className="flex items-center justify-center min-h-[80vh]">
            <Card className="w-full max-w-sm shadow-xl border-0 bg-card/60 backdrop-blur-sm">
              <CardContent className="p-8 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-primary to-primary/60 rounded-full flex items-center justify-center mx-auto mb-6">
                  <UserIcon className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-2xl font-bold mb-3 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  Connecte-toi
                </h2>
                <p className="text-muted-foreground mb-8 leading-relaxed">
                  Accède à ton profil et manage tes préférences Bali'Pass
                </p>
                
                <div className="space-y-3">
                  <Button 
                    className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg transition-all duration-300" 
                    onClick={() => navigate('/auth')}
                  >
                    Se connecter
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full border-primary/20 hover:bg-primary/5 transition-all duration-300" 
                    onClick={() => navigate('/auth')}
                  >
                    Créer un compte
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="w-full text-muted-foreground hover:text-foreground transition-all duration-300" 
                    onClick={() => navigate('/')}
                  >
                    Découvrir Bali'Pass
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        <BottomNavigation />
      </div>
    );
  }

  // Authenticated profile content
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="p-4 pb-24 space-y-6">
        {/* Profile Header with Gradient */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary/90 to-primary/70 text-white shadow-2xl">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative p-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Avatar className="w-16 h-16 ring-4 ring-white/20 shadow-xl">
                  <AvatarImage src="" />
                  <AvatarFallback className="bg-white/20 text-white font-bold text-lg backdrop-blur-sm">
                    {getInitials(profile?.name, profile?.first_name, profile?.last_name)}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-400 border-2 border-white rounded-full"></div>
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold mb-1">{getDisplayName()}</h1>
                <p className="text-white/80 text-sm mb-2">{user.email}</p>
                <Badge 
                  variant={pass?.status === 'active' ? 'secondary' : 'outline'} 
                  className={`${pass?.status === 'active' ? 'bg-green-100 text-green-800 border-green-200' : 'bg-white/20 text-white border-white/30'}`}
                >
                  {getPassStatusLabel()}
                </Badge>
              </div>
              <EditProfileDialog 
                profile={profile} 
                onProfileUpdate={(updatedProfile) => setProfile(updatedProfile)}
              />
            </div>
          </div>
        </div>


        {/* Quick Actions */}
        <Card className="shadow-lg border-0 bg-card/60 backdrop-blur-sm">
          <CardContent className="p-6">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <div className="w-2 h-6 bg-gradient-to-b from-primary to-primary/60 rounded-full"></div>
              Actions rapides
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <Button 
                variant="ghost" 
                className="flex flex-col items-center gap-3 h-auto py-4 hover:bg-primary/5 transition-all duration-300 group"
                onClick={() => navigate('/mon-pass')}
              >
                <div className="w-12 h-12 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <CreditCard className="w-6 h-6 text-primary" />
                </div>
                <span className="text-sm font-medium">Mon Pass</span>
              </Button>
              
              <Button 
                variant="ghost" 
                className="flex flex-col items-center gap-3 h-auto py-4 hover:bg-primary/5 transition-all duration-300 group"
                onClick={() => navigate('/explorer')}
              >
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500/10 to-blue-500/5 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Search className="w-6 h-6 text-blue-600" />
                </div>
                <span className="text-sm font-medium">Explorer</span>
              </Button>
              
              <Button 
                variant="ghost" 
                className="flex flex-col items-center gap-3 h-auto py-4 hover:bg-primary/5 transition-all duration-300 group"
                onClick={() => {
                  toast({
                    title: "Scanner QR",
                    description: "Fonctionnalité de scan QR à venir",
                  });
                }}
              >
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <QrCode className="w-6 h-6 text-emerald-600" />
                </div>
                <span className="text-sm font-medium">Scanner</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Account Info */}
        <Card className="shadow-lg border-0 bg-card/60 backdrop-blur-sm">
          <CardContent className="p-6">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <div className="w-2 h-6 bg-gradient-to-b from-blue-500 to-blue-400 rounded-full"></div>
              Informations personnelles
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                <div className="flex items-center gap-3">
                  <UserIcon className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Nom complet</span>
                </div>
                <span className="font-medium">{getDisplayName()}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Email</span>
                </div>
                <span className="font-medium">{user.email}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                <div className="flex items-center gap-3">
                  <Globe className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Langue</span>
                </div>
                <Badge variant="outline">
                  {preferences.language === 'fr' ? 'Français' : 'English'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pass Information */}
        {pass && (
          <Card className="shadow-lg border-0 bg-gradient-to-br from-emerald-50/50 to-emerald-100/30 border-emerald-200/50">
            <CardContent className="p-6">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-emerald-800">
                <div className="w-2 h-6 bg-gradient-to-b from-emerald-500 to-emerald-400 rounded-full"></div>
                Mon Bali'Pass
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-emerald-700">Statut</span>
                  <Badge variant={getPassStatusVariant()}>
                    {getPassStatusLabel()}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-emerald-700">Expire le</span>
                  <span className="font-medium text-emerald-800">{formatDate(pass.expires_at)}</span>
                </div>
                <Button 
                  className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 shadow-lg"
                  onClick={() => navigate('/mon-pass')}
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  Voir mon pass
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Settings */}
        <Card className="shadow-lg border-0 bg-card/60 backdrop-blur-sm">
          <CardContent className="p-6">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <div className="w-2 h-6 bg-gradient-to-b from-purple-500 to-purple-400 rounded-full"></div>
              Préférences
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                <div className="flex items-center gap-3">
                  <Bell className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">Notifications push</span>
                </div>
                <Switch
                  checked={preferences.push_notifications}
                  onCheckedChange={(checked) => updatePreference('push_notifications', checked)}
                  disabled={updating}
                />
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">Alertes email</span>
                </div>
                <Switch
                  checked={preferences.email_notifications}
                  onCheckedChange={(checked) => updatePreference('email_notifications', checked)}
                  disabled={updating}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Support */}
        <Card className="shadow-lg border-0 bg-card/60 backdrop-blur-sm">
          <CardContent className="p-6">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <div className="w-2 h-6 bg-gradient-to-b from-orange-500 to-orange-400 rounded-full"></div>
              Support & Aide
            </h3>
            <div className="space-y-2">
              <SupportLink href="https://help.balipass.com" external>
                <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/30 transition-colors duration-200">
                  <div className="flex items-center gap-3">
                    <HelpCircle className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">Centre d'aide</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </div>
              </SupportLink>
              <SupportLink href="mailto:support@balipass.com" external>
                <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/30 transition-colors duration-200">
                  <div className="flex items-center gap-3">
                    <MessageCircle className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">Contact support</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </div>
              </SupportLink>
            </div>
          </CardContent>
        </Card>

        {/* Sign Out */}
        <Card className="shadow-lg border-0 bg-card/60 backdrop-blur-sm">
          <CardContent className="p-6">
            <Button 
              variant="outline" 
              className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 transition-all duration-300"
              onClick={handleSignOut}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Se déconnecter
            </Button>
          </CardContent>
        </Card>
      </div>

      <FloatingActionButton />
      <BottomNavigation />
    </div>
  );
};

export default Profil;
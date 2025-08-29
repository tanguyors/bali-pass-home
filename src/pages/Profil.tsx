import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
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
  Phone,
  MapPin
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
          push_notifications: true, // Default as we don't have this field yet
          email_notifications: true, // Default as we don't have this field yet
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
      
      // For language, update the profile locale
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
        <p className="text-muted-foreground">Chargement...</p>
      </div>
    );
  }

  // Not authenticated state
  if (!user) {
    return (
      <div className="flex-1 bg-background min-h-screen">
        <div className="flex-1 p-4">
          <div className="flex items-center justify-center min-h-[400px]">
            <Card className="w-full max-w-sm">
              <CardContent className="p-6 text-center">
                <UserIcon className="w-16 h-16 mx-auto mb-4 text-primary" />
                <h2 className="text-xl font-semibold mb-2">
                  Connecte-toi pour accéder à ton profil
                </h2>
                <p className="text-muted-foreground mb-6">
                  Gérer tes informations et tes préférences
                </p>
                
                <div className="space-y-3">
                  <Button className="w-full" onClick={() => navigate('/auth')}>
                    Se connecter
                  </Button>
                  <Button variant="outline" className="w-full" onClick={() => navigate('/auth')}>
                    Créer un compte
                  </Button>
                  <Button variant="ghost" className="w-full" onClick={() => navigate('/')}>
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
    <div className="flex-1 bg-background min-h-screen">
      <div className="flex-1 p-4 pb-20">
        <div className="space-y-6">
          {/* Header */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <Avatar className="w-16 h-16">
                  <AvatarImage src="" />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {getInitials(profile?.name, profile?.first_name, profile?.last_name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h2 className="text-xl font-bold">{getDisplayName()}</h2>
                  <p className="text-muted-foreground">{user.email}</p>
                  <Badge variant={getPassStatusVariant()} className="mt-2">
                    {getPassStatusLabel()}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-4">Actions rapides</h3>
              <div className="flex justify-around">
                <Button 
                  variant="ghost" 
                  className="flex flex-col items-center gap-2 h-auto py-4"
                  onClick={() => navigate('/mon-pass')}
                >
                  <CreditCard className="w-6 h-6" />
                  <span className="text-sm">Mon Pass</span>
                </Button>
                <Button 
                  variant="ghost" 
                  className="flex flex-col items-center gap-2 h-auto py-4"
                  onClick={() => navigate('/explorer')}
                >
                  <Search className="w-6 h-6" />
                  <span className="text-sm">Explorer</span>
                </Button>
                <Button 
                  variant="ghost" 
                  className="flex flex-col items-center gap-2 h-auto py-4"
                  onClick={() => {
                    // Open QR scanner - you could implement camera access here
                    toast({
                      title: "Scanner QR",
                      description: "Fonctionnalité de scan QR à venir",
                    });
                  }}
                >
                  <QrCode className="w-6 h-6" />
                  <span className="text-sm">Scanner QR</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Account Info */}
          <Card>
            <CardContent className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold">Mes informations personnelles</h3>
                <EditProfileDialog 
                  profile={profile} 
                  onProfileUpdate={(updatedProfile) => setProfile(updatedProfile)}
                />
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Nom complet</span>
                  <span>{getDisplayName()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Email</span>
                  <span>{user.email}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Téléphone</span>
                  <span>{profile?.phone || 'Non renseigné'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Langue</span>
                  <span>{preferences.language === 'fr' ? 'Français' : 'English'}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pass Info */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-4">Mon Pass</h3>
              {pass ? (
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Statut</span>
                    <Badge variant={getPassStatusVariant()}>
                      {getPassStatusLabel()}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Date d'achat</span>
                    <span>{formatDate(pass.purchased_at)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Expire le</span>
                    <span>{formatDate(pass.expires_at)}</span>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button 
                      className="flex-1"
                      onClick={() => navigate('/mon-pass')}
                    >
                      Voir mon pass
                    </Button>
                    {pass.status === 'expired' && (
                      <Button 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => {
                          toast({
                            title: "Renouvellement",
                            description: "Redirection vers l'achat du pass...",
                          });
                          // Navigate to payment flow
                        }}
                      >
                        Renouveler
                      </Button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-muted-foreground mb-4">Aucun pass actif</p>
                  <Button onClick={() => navigate('/mon-pass')}>
                    Obtenir le Bali'Pass
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Preferences */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-4">Préférences & Notifications</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-muted-foreground" />
                    <span>Notifications push</span>
                  </div>
                  <Switch
                    checked={preferences.push_notifications}
                    onCheckedChange={(checked) => updatePreference('push_notifications', checked)}
                    disabled={updating}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span>Alertes email</span>
                  </div>
                  <Switch
                    checked={preferences.email_notifications}
                    onCheckedChange={(checked) => updatePreference('email_notifications', checked)}
                    disabled={updating}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-muted-foreground" />
                    <span>Langue</span>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => updatePreference('language', preferences.language === 'fr' ? 'en' : 'fr')}
                    disabled={updating}
                  >
                    {preferences.language === 'fr' ? 'FR' : 'EN'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Support & Legal */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-4">Support & Légal</h3>
              <div className="space-y-2">
                <SupportLink href="https://help.balipass.com" external>
                  <HelpCircle className="w-4 h-4 mr-3" />
                  Centre d'aide
                </SupportLink>
                <SupportLink href="https://faq.balipass.com" external>
                  <MessageCircle className="w-4 h-4 mr-3" />
                  FAQ
                </SupportLink>
                <SupportLink href="https://balipass.com/legal" external>
                  <FileText className="w-4 h-4 mr-3" />
                  CGV & Confidentialité
                </SupportLink>
                <SupportLink href="mailto:support@balipass.com" external>
                  <Mail className="w-4 h-4 mr-3" />
                  Contact support
                </SupportLink>
                <SupportLink href="https://wa.me/33123456789" external>
                  <MessageCircle className="w-4 h-4 mr-3" />
                  WhatsApp Support
                </SupportLink>
              </div>
            </CardContent>
          </Card>

          {/* Account Management */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-4">Gestion du compte</h3>
              <div className="space-y-2">
                <ChangePasswordDialog />
                <Separator className="my-2" />
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-destructive hover:text-destructive"
                  onClick={handleSignOut}
                >
                  <LogOut className="w-4 h-4 mr-3" />
                  Se déconnecter
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <FloatingActionButton />
      <BottomNavigation />
    </div>
  );
};

export default Profil;
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
import { useLanguage } from '@/contexts/LanguageContext';
import { LanguageSelector } from '@/components/LanguageSelector';

interface UserPreferences {
  push_notifications: boolean;
  email_notifications: boolean;
  language: string;
}

const Profil: React.FC = () => {
  const { user, profile, userPass: pass, loading, setProfile } = useAuth();
  const [preferences, setPreferences] = useState<UserPreferences>({
    push_notifications: false,
    email_notifications: false,
    language: 'en'
  });
  const [updating, setUpdating] = useState(false);
  
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t, language, setLanguage } = useLanguage();

  const handleSignOut = async () => {
    try {
      // Attempt server logout
      const { error } = await supabase.auth.signOut();
      
      // Handle specific error types that aren't critical
      if (error) {
        const isNonCriticalError = 
          error.message?.includes('session_not_found') ||
          error.message?.includes('Auth session missing') ||
          error.message?.includes('AuthSessionMissingError') ||
          error.code === 'session_not_found';
          
        if (isNonCriticalError) {
          console.info('Session already cleared on server side');
        } else {
          console.warn('Logout error (attempting to continue):', error);
          // Don't show error to user unless it's a real blocking error
        }
      }
      
      // Always show success message and navigate
      toast({
        title: t('profile.logout_success'),
        description: t('profile.see_you_soon'),
      });
      
      // Small delay to ensure state is updated before navigation
      setTimeout(() => {
        navigate('/');
      }, 100);
      
    } catch (error) {
      console.error('Unexpected logout error:', error);
      
      toast({
        title: t('profile.logout_success'),
        description: t('profile.see_you_soon'),
      });
      
      setTimeout(() => {
        navigate('/');
      }, 100);
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
        
        // Update the app language immediately
        setLanguage(value as 'en' | 'fr' | 'es' | 'id' | 'zh');
      }
      
      toast({
        title: t('profile.preferences_updated'),
        description: t('profile.preferences_saved'),
      });
    } catch (error) {
      toast({
        title: t('common.error'),
        description: t('profile.preferences_error'),
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
    return user?.email?.split('@')[0] || t('common.name');
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const getPassStatusLabel = (): string => {
    if (!pass) return t('pass.no_pass');
    
    switch (pass.status) {
      case 'active':
        return t('pass.active');
      case 'expired':
        return t('pass.expired');
      case 'pending':
        return t('pass.pending');
      default:
        return t('pass.inactive');
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
        {/* Language Selector - Fixed at top right */}
        <div className="fixed top-4 right-4 z-50">
          <LanguageSelector />
        </div>
        <div className="flex-1 p-4">
          <div className="flex items-center justify-center min-h-[80vh]">
            <Card className="w-full max-w-sm shadow-xl border-0 bg-card/60 backdrop-blur-sm">
              <CardContent className="p-8 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-primary to-primary/60 rounded-full flex items-center justify-center mx-auto mb-6">
                  <UserIcon className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-2xl font-bold mb-3 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  {t('profile.connect')}
                </h2>
                <p className="text-muted-foreground mb-8 leading-relaxed">
                  {t('profile.access_profile')}
                </p>
                
                <div className="space-y-3">
                  <Button 
                    className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg transition-all duration-300" 
                    onClick={() => navigate('/auth')}
                  >
                    {t('auth.sign_in')}
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full border-primary/20 hover:bg-primary/5 transition-all duration-300" 
                    onClick={() => navigate('/auth')}
                  >
                    {t('auth.create_account')}
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="w-full text-muted-foreground hover:text-foreground transition-all duration-300" 
                    onClick={() => navigate('/')}
                  >
                    {t('profile.discover_bali_pass')}
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
      {/* Language Selector - Fixed at top right */}
      <div className="fixed top-4 right-4 z-50">
        <LanguageSelector />
      </div>
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
              {t('profile.quick_actions')}
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
                <span className="text-sm font-medium">{t('nav.my_pass')}</span>
              </Button>
              
              <Button 
                variant="ghost" 
                className="flex flex-col items-center gap-3 h-auto py-4 hover:bg-primary/5 transition-all duration-300 group"
                onClick={() => navigate('/explorer')}
              >
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500/10 to-blue-500/5 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Search className="w-6 h-6 text-blue-600" />
                </div>
                <span className="text-sm font-medium">{t('nav.explorer')}</span>
              </Button>
              
              <Button 
                variant="ghost" 
                className="flex flex-col items-center gap-3 h-auto py-4 hover:bg-primary/5 transition-all duration-300 group"
                onClick={() => {
                  toast({
                    title: t('toast.scan_qr'),
                    description: t('toast.qr_feature_coming'),
                  });
                }}
              >
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <QrCode className="w-6 h-6 text-emerald-600" />
                </div>
                <span className="text-sm font-medium">{t('profile.scan_partner')}</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Account Info */}
        <Card className="shadow-lg border-0 bg-card/60 backdrop-blur-sm">
          <CardContent className="p-6">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <div className="w-2 h-6 bg-gradient-to-b from-blue-500 to-blue-400 rounded-full"></div>
              {t('profile.personal_info')}
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                <div className="flex items-center gap-3">
                  <UserIcon className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{t('profile.full_name')}</span>
                </div>
                <span className="font-medium">{getDisplayName()}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{t('common.email')}</span>
                </div>
                <span className="font-medium">{user.email}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                <div className="flex items-center gap-3">
                  <Globe className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{t('profile.language')}</span>
                </div>
                <Select 
                  value={language} 
                  onValueChange={(value) => updatePreference('language', value)}
                  disabled={updating}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">🇺🇸 English</SelectItem>
                    <SelectItem value="fr">🇫🇷 Français</SelectItem>
                    <SelectItem value="es">🇪🇸 Español</SelectItem>
                    <SelectItem value="id">🇮🇩 Bahasa Indonesia</SelectItem>
                    <SelectItem value="zh">🇨🇳 中文</SelectItem>
                  </SelectContent>
                </Select>
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
                {t('pass.my_pass')}
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-emerald-700">{t('pass.active')}</span>
                  <Badge variant={getPassStatusVariant()}>
                    {getPassStatusLabel()}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-emerald-700">{t('pass.expires_on')}</span>
                  <span className="font-medium text-emerald-800">{formatDate(pass.expires_at)}</span>
                </div>
                <Button 
                  className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 shadow-lg"
                  onClick={() => navigate('/mon-pass')}
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  {t('nav.my_pass')}
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
              {t('profile.preferences')}
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                <div className="flex items-center gap-3">
                  <Bell className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{t('profile.push_notifications')}</span>
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
                  <span className="text-sm">{t('profile.email_notifications')}</span>
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
              {t('profile.support')}
            </h3>
            <div className="space-y-2">
              <SupportLink href="https://help.balipass.com" external>
                <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/30 transition-colors duration-200">
                  <div className="flex items-center gap-3">
                    <HelpCircle className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{t('profile.help_center')}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </div>
              </SupportLink>
              <SupportLink href="mailto:support@balipass.com" external>
                <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/30 transition-colors duration-200">
                  <div className="flex items-center gap-3">
                    <MessageCircle className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{t('profile.contact_support')}</span>
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
              {t('profile.sign_out')}
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
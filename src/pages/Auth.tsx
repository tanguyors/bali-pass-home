import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarIcon, EyeIcon, EyeOffIcon, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useLanguage } from '@/contexts/LanguageContext';

const Auth: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [countryCode, setCountryCode] = useState('+33');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [activeTab, setActiveTab] = useState('signin');
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();

  // Redirect if already authenticated
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate('/');
      }
    };
    checkUser();
  }, [navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          toast({
            title: t('auth.login_error'),
            description: t('auth.invalid_credentials'),
            variant: "destructive",
          });
        } else {
          toast({
            title: t('auth.login_error'),
            description: error.message,
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: t('auth.login_success'),
          description: t('auth.welcome'),
        });
        navigate('/');
      }
    } catch (error) {
      toast({
        title: t('common.error'),
        description: t('auth.unexpected_error'),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!acceptTerms) {
      toast({
        title: t('common.error'),
        description: t('auth.must_accept_terms'),
        variant: "destructive",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: t('common.error'),
        description: t('auth.password_min'),
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            first_name: firstName,
            last_name: lastName,
            name: `${firstName} ${lastName}`.trim(),
            phone: phone ? `${countryCode}${phone}` : undefined,
            birth_date: birthDate || undefined,
          }
        }
      });

      if (error) {
        if (error.message.includes('User already registered')) {
          toast({
            title: "Account exists",
            description: t('auth.user_exists'),
            variant: "destructive",
          });
        } else {
          toast({
            title: t('auth.signup_error'),
            description: error.message,
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: t('auth.signup_success'),
          description: t('auth.verify_email'),
        });
        setActiveTab('signin');
      }
    } catch (error) {
      toast({
        title: t('common.error'),
        description: t('auth.unexpected_error'),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background blobs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-secondary/20 to-primary/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Back Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => navigate('/')}
        className="absolute top-6 left-6 z-20 w-12 h-12 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-white/20 dark:border-slate-700/20 shadow-lg hover:bg-white/90 dark:hover:bg-slate-800/90 rounded-xl transition-all duration-300"
      >
        <ArrowLeft className="w-5 h-5" />
      </Button>

      {/* Main Auth Card */}
      <div className="relative z-10 w-full max-w-md">
        <Card className="border-0 shadow-2xl bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-3xl overflow-hidden">
          <CardContent className="p-0">
            {/* Header Section */}
            <div className="bg-gradient-to-br from-primary via-primary/90 to-secondary p-8 text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,transparent,black)]"></div>
              <div className="relative z-10">
                <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
                  <span className="text-4xl">🌴</span>
                </div>
                <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Pass Bali</h1>
                <p className="text-white/90 text-sm font-medium">{t('pass.your_privilege_pass')}</p>
              </div>
            </div>

            {/* Form Section */}
            <div className="p-8">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                {/* Modern Tab Selector */}
                <TabsList className="grid w-full grid-cols-1 mb-8 bg-slate-100 dark:bg-slate-800 rounded-2xl p-1 h-14">
                  <TabsTrigger 
                    value="signin" 
                    className="rounded-xl text-sm font-semibold h-12 data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-primary dark:data-[state=active]:bg-slate-700 transition-all duration-300"
                  >
                    {t('auth.sign_in')}
                  </TabsTrigger>
                </TabsList>
                
                {/* Sign In Form */}
                <TabsContent value="signin" className="space-y-6 animate-fade-in">
                  <form onSubmit={handleSignIn} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="signin-email" className="text-sm font-semibold text-slate-700 dark:text-slate-300">{t('common.email')}</Label>
                      <Input
                        id="signin-email"
                        type="email"
                        placeholder="votre@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="h-14 rounded-xl border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-primary/20 focus:border-primary transition-all duration-300"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signin-password" className="text-sm font-semibold text-slate-700 dark:text-slate-300">{t('common.password')}</Label>
                      <div className="relative">
                        <Input
                          id="signin-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="h-14 rounded-xl border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-primary/20 focus:border-primary pr-12 transition-all duration-300"
                          required
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-1 top-1 h-12 w-12 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOffIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                        </Button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <Button 
                        type="submit" 
                        className="h-14 bg-gradient-to-r from-primary via-primary to-secondary hover:from-primary/90 hover:via-primary/90 hover:to-secondary/90 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <div className="flex items-center gap-2">
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            {t('auth.signing_in')}
                          </div>
                        ) : (
                          t('auth.sign_in')
                        )}
                      </Button>
                      
                      <Button 
                        type="button"
                        variant="outline"
                        className="h-14 rounded-xl border-primary/20 hover:bg-primary/5 text-primary font-semibold"
                        onClick={() => window.open('https://passbali.com/auth', '_blank')}
                      >
                        {t('auth.create_account')}
                      </Button>
                    </div>
                  </form>
                </TabsContent>
              </Tabs>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
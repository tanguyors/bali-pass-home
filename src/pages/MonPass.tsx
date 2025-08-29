import React, { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  User as UserIcon, 
  QrCode, 
  Search, 
  Calendar, 
  MapPin, 
  CheckCircle, 
  ChevronDown,
  Bell,
  Globe,
  LogOut,
  Mail,
  HelpCircle,
  TrendingUp
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { BottomNavigation } from '@/components/BottomNavigation';
import { FloatingActionButton } from '@/components/FloatingActionButton';

interface Pass {
  id: string;
  status: 'active' | 'expired' | 'pending' | 'refunded';
  expires_at: string;
  purchased_at: string;
  user_id: string;
}

interface Redemption {
  id: string;
  redeemed_at: string;
  status: string;
  partner: {
    name: string;
    city: {
      name: string;
    };
  };
  offer: {
    title: string;
    value_number: number | null;
    promo_type: string;
  };
}

interface Profile {
  name: string | null;
  first_name: string | null;
  last_name: string | null;
}

const MonPass: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [pass, setPass] = useState<Pass | null>(null);
  const [redemptions, setRedemptions] = useState<Redemption[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [totalSavings, setTotalSavings] = useState<number>(0);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isConditionsOpen, setIsConditionsOpen] = useState(false);
  const [isSupportOpen, setIsSupportOpen] = useState(false);

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
        .select('name, first_name, last_name')
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
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (passData) {
        setPass(passData);
      }

      // Fetch redemptions with partner and offer details
      const { data: redemptionsData } = await supabase
        .from('redemptions')
        .select(`
          id,
          redeemed_at,
          status,
          partners (
            name,
            cities (name)
          ),
          offers (
            title,
            value_number,
            promo_type
          ),
          passes!inner (user_id)
        `)
        .eq('passes.user_id', user.id)
        .order('redeemed_at', { ascending: false });

      if (redemptionsData) {
        const formattedRedemptions = redemptionsData.map(item => ({
          id: item.id,
          redeemed_at: item.redeemed_at,
          status: item.status,
          partner: {
            name: item.partners?.name || 'Partenaire inconnu',
            city: {
              name: item.partners?.cities?.name || 'Bali'
            }
          },
          offer: {
            title: item.offers?.title || 'Offre',
            value_number: item.offers?.value_number,
            promo_type: item.offers?.promo_type || 'discount'
          }
        }));
        setRedemptions(formattedRedemptions);

        // Calculate total savings
        const savings = formattedRedemptions.reduce((total, redemption) => {
          return total + (redemption.offer.value_number || 0);
        }, 0);
        setTotalSavings(savings);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const getPassProgress = (): number => {
    if (!pass) return 0;
    
    const startDate = new Date(pass.purchased_at);
    const endDate = new Date(pass.expires_at);
    const now = new Date();
    
    const totalDuration = endDate.getTime() - startDate.getTime();
    const elapsed = now.getTime() - startDate.getTime();
    
    return Math.min(Math.max((elapsed / totalDuration) * 100, 0), 100);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  const handleScanPartner = () => {
    // TODO: Implement QR scanner with Expo Camera
    console.log('Scanner QR - Fonctionnalité bientôt disponible');
  };

  const handleContactSupport = () => {
    window.open('mailto:support@balipass.com', '_blank');
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
                  Connecte-toi pour accéder à ton pass
                </h2>
                <p className="text-muted-foreground mb-6">
                  Découvre tes économies et ton historique d'utilisations
                </p>
                
                <div className="space-y-3">
                  <Button className="w-full" onClick={() => navigate('/auth')}>
                    Se connecter
                  </Button>
                  <Button variant="outline" className="w-full" onClick={() => navigate('/auth')}>
                    Créer un compte
                  </Button>
                  <Button variant="ghost" className="w-full">
                    En savoir plus sur Bali'Pass
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

  // Authenticated but no active pass
  if (!pass) {
    return (
      <div className="flex-1 bg-background min-h-screen">
        <div className="flex-1 p-4">
          <div className="space-y-6">
            <h1 className="text-2xl font-bold text-center">
              Obtiens ton Bali'Pass
            </h1>
            
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Avantages inclus :</h3>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-primary mr-3" />
                    <span>Réductions exclusives chez des partenaires vérifiés</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-primary mr-3" />
                    <span>Utilisation simple : scanne le QR du partenaire</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-primary mr-3" />
                    <span>Pass valable 12 mois</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-3">
              <Button className="w-full">
                Obtenir le Bali'Pass
              </Button>
              <Button variant="outline" className="w-full">
                Voir les offres
              </Button>
            </div>
          </div>
        </div>
        <BottomNavigation />
      </div>
    );
  }

  // Authenticated with active pass - full content
  return (
    <div className="flex-1 bg-background min-h-screen">
      <div className="flex-1 p-4 pb-20">
        <div className="space-y-6">
          {/* Pass Status Card */}
          <Card>
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground mb-1">Statut</p>
                  <Badge variant={pass.status === 'active' ? 'default' : 'destructive'}>
                    {pass.status === 'active' ? 'Actif' : pass.status === 'expired' ? 'Expiré' : 'En attente'}
                  </Badge>
                </div>
                <div className="flex-1 text-right">
                  <p className="text-sm text-muted-foreground mb-1">Valide jusqu'au</p>
                  <p className="font-medium">{formatDate(pass.expires_at)}</p>
                  <div className="w-24 mt-2 ml-auto">
                    <Progress value={getPassProgress()} className="h-2" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions Row */}
          <div className="flex gap-3">
            <Button 
              onClick={handleScanPartner}
              className="flex-1 flex items-center justify-center gap-2"
            >
              <QrCode className="w-4 h-4" />
              Scanner un partenaire
            </Button>
            <Button 
              variant="outline"
              className="flex-1 flex items-center justify-center gap-2"
            >
              <Search className="w-4 h-4" />
              Voir les offres
            </Button>
          </div>

          {/* Savings Summary */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Mes économies</h3>
                  <p className="text-2xl font-bold text-primary">
                    {totalSavings > 0 ? `${totalSavings}%` : 'Aucune économie enregistrée'}
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          {/* Redemption History */}
          <Card>
            <CardContent className="p-4">
              <h3 className="text-lg font-semibold mb-4">Historique d'utilisations</h3>
              
              {redemptions.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  Aucune utilisation enregistrée
                </p>
              ) : (
                <div className="space-y-3">
                  {redemptions.slice(0, 5).map((redemption) => (
                    <div key={redemption.id} className="border-b border-border pb-3 last:border-b-0">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="font-medium truncate">
                            {redemption.partner.name}
                          </p>
                          <p className="text-sm text-muted-foreground truncate">
                            {redemption.offer.title}
                          </p>
                          <div className="flex items-center mt-1">
                            <MapPin className="w-3 h-3 text-muted-foreground mr-1" />
                            <span className="text-xs text-muted-foreground mr-3">
                              {redemption.partner.city.name}
                            </span>
                            <Calendar className="w-3 h-3 text-muted-foreground mr-1" />
                            <span className="text-xs text-muted-foreground">
                              {formatDate(redemption.redeemed_at)}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end">
                          {redemption.offer.value_number && (
                            <Badge variant="secondary">
                              -{redemption.offer.value_number}%
                            </Badge>
                          )}
                          <CheckCircle className="w-4 h-4 text-green-500 mt-1" />
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {redemptions.length > 5 && (
                    <Button variant="ghost" className="w-full">
                      Voir plus
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pass Details Accordion */}
          <Card>
            <CardContent className="p-4">
              <Collapsible open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
                <CollapsibleTrigger className="flex justify-between items-center w-full">
                  <span className="font-medium">Détails du pass</span>
                  <ChevronDown className="w-4 h-4" />
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <Separator className="my-3" />
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Date d'achat</span>
                      <span>{formatDate(pass.purchased_at)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Validité</span>
                      <span>12 mois</span>
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>

              <Separator className="my-4" />

              <Collapsible open={isConditionsOpen} onOpenChange={setIsConditionsOpen}>
                <CollapsibleTrigger className="flex justify-between items-center w-full">
                  <span className="font-medium">Conditions d'utilisation</span>
                  <ChevronDown className="w-4 h-4" />
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <Separator className="my-3" />
                  <p className="text-sm text-muted-foreground">
                    Pass personnel et non transférable. Valable dans tous les établissements partenaires.
                  </p>
                </CollapsibleContent>
              </Collapsible>

              <Separator className="my-4" />

              <Collapsible open={isSupportOpen} onOpenChange={setIsSupportOpen}>
                <CollapsibleTrigger className="flex justify-between items-center w-full">
                  <span className="font-medium">Assistance</span>
                  <ChevronDown className="w-4 h-4" />
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <Separator className="my-3" />
                  <div className="space-y-2">
                    <Button variant="ghost" onClick={handleContactSupport} className="w-full justify-start">
                      <Mail className="w-4 h-4 mr-2" />
                      Contacter le support
                    </Button>
                    <Button variant="ghost" className="w-full justify-start">
                      <HelpCircle className="w-4 h-4 mr-2" />
                      FAQ
                    </Button>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </CardContent>
          </Card>

          {/* Account Shortcuts */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-medium mb-3">Mon compte</h3>
              <div className="space-y-2">
                <Button variant="ghost" className="w-full justify-start">
                  <UserIcon className="w-4 h-4 mr-3" />
                  Mes informations
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  <Bell className="w-4 h-4 mr-3" />
                  Notifications
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  <Globe className="w-4 h-4 mr-3" />
                  Langue
                </Button>
                <Button variant="ghost" onClick={handleSignOut} className="w-full justify-start">
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

export default MonPass;
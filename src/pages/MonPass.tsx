import React, { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  User as UserIcon, 
  QrCode, 
  Search, 
  Calendar, 
  MapPin, 
  CheckCircle, 
  TrendingUp,
  CreditCard,
  Wallet,
  Gift,
  Clock,
  Star,
  Award,
  ChevronRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { BottomNavigation } from '@/components/BottomNavigation';
import { FloatingActionButton } from '@/components/FloatingActionButton';
import { useToast } from '@/hooks/use-toast';

interface Pass {
  id: string;
  status: 'active' | 'expired' | 'pending' | 'refunded';
  expires_at: string;
  purchased_at: string;
  user_id: string;
  qr_token: string;
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
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [pass, setPass] = useState<Pass | null>(null);
  const [redemptions, setRedemptions] = useState<Redemption[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [totalSavings, setTotalSavings] = useState<number>(0);

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

  const getDisplayName = (): string => {
    if (profile?.first_name && profile?.last_name) {
      return `${profile.first_name} ${profile.last_name}`;
    }
    if (profile?.name) {
      return profile.name;
    }
    return user?.email?.split('@')[0] || 'Utilisateur';
  };

  const getDaysRemaining = (): number => {
    if (!pass) return 0;
    const now = new Date();
    const expiryDate = new Date(pass.expires_at);
    const diffTime = expiryDate.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const handleScanPartner = () => {
    toast({
      title: "Scanner QR",
      description: "Fonctionnalité de scan QR à venir",
    });
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
                  <CreditCard className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-2xl font-bold mb-3 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  Ton Bali'Pass
                </h2>
                <p className="text-muted-foreground mb-8 leading-relaxed">
                  Connecte-toi pour accéder à ton pass et découvrir tes économies
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
                    En savoir plus
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
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <div className="p-4 space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Obtiens ton Bali'Pass
            </h1>
            <p className="text-muted-foreground">Accède à des réductions exclusives partout à Bali</p>
          </div>
          
          <Card className="shadow-2xl border-0 bg-gradient-to-br from-primary via-primary/90 to-primary/70 text-white">
            <CardContent className="p-8">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Gift className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2">Avantages inclus</h3>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-300 flex-shrink-0" />
                  <span>Réductions exclusives chez +50 partenaires</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-300 flex-shrink-0" />
                  <span>Scan simple avec QR code</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-300 flex-shrink-0" />
                  <span>Valable 12 mois</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-300 flex-shrink-0" />
                  <span>Support client 24/7</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-3">
            <Button className="w-full h-12 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg text-lg font-semibold">
              <CreditCard className="w-5 h-5 mr-2" />
              Obtenir le Bali'Pass
            </Button>
            <Button 
              variant="outline" 
              className="w-full h-12 border-primary/20 hover:bg-primary/5 transition-all duration-300"
              onClick={() => navigate('/explorer')}
            >
              <Search className="w-5 h-5 mr-2" />
              Découvrir les offres
            </Button>
          </div>
        </div>
        <BottomNavigation />
      </div>
    );
  }

  // Authenticated with active pass - full content
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="p-4 pb-24 space-y-6">
        {/* Pass Header with Gradient */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary/90 to-primary/70 text-white shadow-2xl">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold">Mon Bali'Pass</h1>
                <p className="text-white/80">{getDisplayName()}</p>
              </div>
              <Badge 
                variant="secondary" 
                className="bg-green-100 text-green-800 border-green-200"
              >
                {pass.status === 'active' ? 'Actif' : 'Inactif'}
              </Badge>
            </div>
            
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-white/80 text-sm">Expire le</span>
                <span className="font-semibold">{formatDate(pass.expires_at)}</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-white/80">Validité</span>
                  <span>{getDaysRemaining()} jours restants</span>
                </div>
                <Progress 
                  value={100 - getPassProgress()} 
                  className="h-2 bg-white/20" 
                />
              </div>
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
            <div className="grid grid-cols-2 gap-4">
              <Button 
                variant="ghost" 
                className="flex flex-col items-center gap-3 h-auto py-6 hover:bg-primary/5 transition-all duration-300 group"
                onClick={handleScanPartner}
              >
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <QrCode className="w-6 h-6 text-emerald-600" />
                </div>
                <span className="text-sm font-medium">Scanner partenaire</span>
              </Button>
              
              <Button 
                variant="ghost" 
                className="flex flex-col items-center gap-3 h-auto py-6 hover:bg-primary/5 transition-all duration-300 group"
                onClick={() => navigate('/explorer')}
              >
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500/10 to-blue-500/5 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Search className="w-6 h-6 text-blue-600" />
                </div>
                <span className="text-sm font-medium">Voir les offres</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Savings Summary */}
        <Card className="shadow-lg border-0 bg-gradient-to-br from-emerald-50/50 to-emerald-100/30 border-emerald-200/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg text-emerald-800 mb-1">Mes économies</h3>
                <p className="text-3xl font-bold text-emerald-700">
                  {totalSavings > 0 ? `${totalSavings}%` : '0%'}
                </p>
                <p className="text-sm text-emerald-600">
                  {redemptions.length} utilisation{redemptions.length > 1 ? 's' : ''}
                </p>
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-400 rounded-full flex items-center justify-center">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="shadow-lg border-0 bg-card/60 backdrop-blur-sm">
          <CardContent className="p-6">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <div className="w-2 h-6 bg-gradient-to-b from-orange-500 to-orange-400 rounded-full"></div>
              Dernières utilisations
            </h3>
            
            {redemptions.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-muted/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground mb-2">Aucune utilisation</p>
                <p className="text-sm text-muted-foreground">
                  Commence à utiliser ton pass pour voir tes économies ici
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {redemptions.slice(0, 3).map((redemption) => (
                  <div key={redemption.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-primary/10 to-primary/5 rounded-full flex items-center justify-center">
                        <Award className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{redemption.partner.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {redemption.partner.city.name} • {formatDate(redemption.redeemed_at)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {redemption.offer.value_number && (
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          -{redemption.offer.value_number}%
                        </Badge>
                      )}
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </div>
                ))}
                
                {redemptions.length > 3 && (
                  <Button variant="ghost" className="w-full mt-4">
                    Voir tout l'historique
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <FloatingActionButton />
      <BottomNavigation />
    </div>
  );
};

export default MonPass;
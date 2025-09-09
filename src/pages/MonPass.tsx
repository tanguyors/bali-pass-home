import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  ArrowLeft, 
  Calendar, 
  Users, 
  QrCode, 
  History, 
  BarChart3, 
  CreditCard,
  Search,
  Gift,
  CheckCircle,
  TrendingUp,
  Clock,
  Award,
  ChevronRight,
  Heart,
  MapPin,
  Tag
} from 'lucide-react';
import { QRScanner } from '@/components/QRScanner';
import { PassSummarySection } from '@/components/PassSummarySection';
import { PartnerOffersModal } from '@/components/PartnerOffersModal';
import { BottomNavigation } from '@/components/BottomNavigation';
import { FloatingActionButton } from '@/components/FloatingActionButton';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { LanguageSelector } from '@/components/LanguageSelector';
import { useToast } from '@/components/ui/use-toast';
import { useOfferFavorites } from '@/hooks/useOfferFavorites';
import { supabase } from '@/integrations/supabase/client';

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
  const { t } = useLanguage();
  const { user, profile, userPass, loading, hasActivePass } = useAuth();
  const { favorites, loading: favoritesLoading, removeFromFavorites } = useOfferFavorites();
  const [showScanner, setShowScanner] = useState(false);
  const [scannedPartner, setScannedPartner] = useState<any>(null);
  const [redemptions, setRedemptions] = useState<Redemption[]>([]);
  const [totalSavings, setTotalSavings] = useState<number>(0);

  // Fetch user data when authenticated
  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = async () => {
    if (!user) return;

    try {
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
            name: item.partners?.name || t('mon_pass.unknown_partner'),
            city: {
              name: item.partners?.cities?.name || 'Bali'
            }
          },
          offer: {
            title: item.offers?.title || t('mon_pass.offer'),
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
    if (!userPass) return 0;
    
    const startDate = new Date(userPass.purchased_at);
    const endDate = new Date(userPass.expires_at);
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
    return user?.email?.split('@')[0] || t('common.name');
  };

  const getDaysRemaining = (): number => {
    if (!userPass) return 0;
    const now = new Date();
    const expiryDate = new Date(userPass.expires_at);
    const diffTime = expiryDate.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const handleScanPartner = () => {
    toast({
      title: t('toast.scan_qr'),
      description: t('toast.qr_feature_coming'),
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
        {/* Language Selector - Fixed at top right */}
        <div className="fixed top-4 right-4 z-50">
          <LanguageSelector />
        </div>
        <div className="flex-1 p-4">
          <div className="flex items-center justify-center min-h-[80vh]">
            <Card className="w-full max-w-sm shadow-xl border-0 bg-card/60 backdrop-blur-sm">
              <CardContent className="p-8 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-primary to-primary/60 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CreditCard className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-2xl font-bold mb-3 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  {t('pass.my_pass')}
                </h2>
                <p className="text-muted-foreground mb-8 leading-relaxed">
                  {t('pass.connect_to_access')}
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
                    {t('common.learn_more')}
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
  if (!userPass) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        {/* Language Selector - Fixed at top right */}
        <div className="fixed top-4 right-4 z-50">
          <LanguageSelector />
        </div>
        <div className="p-4 space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              {t('pass.get_pass')}
            </h1>
            <p className="text-muted-foreground">{t('mon_pass.access_exclusive_discounts')}</p>
          </div>
          
          <Card className="shadow-2xl border-0 bg-gradient-to-br from-primary via-primary/90 to-primary/70 text-white">
            <CardContent className="p-8">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Gift className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2">{t('pass.benefits_included')}</h3>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-300 flex-shrink-0" />
                  <span>{t('pass.exclusive_discounts')}</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-300 flex-shrink-0" />
                  <span>{t('pass.simple_qr_scan')}</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-300 flex-shrink-0" />
                  <span>{t('pass.valid_12_months')}</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-300 flex-shrink-0" />
                  <span>{t('pass.support_24_7')}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-3">
            <Button 
              className="w-full h-12 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg text-lg font-semibold"
              onClick={() => window.open('https://passbali.com/', '_blank')}
            >
              <CreditCard className="w-5 h-5 mr-2" />
              {t('pass.get_pass')}
            </Button>
            <Button 
              variant="outline" 
              className="w-full h-12 border-primary/20 hover:bg-primary/5 transition-all duration-300"
              onClick={() => navigate('/explorer')}
            >
              <Search className="w-5 h-5 mr-2" />
              {t('pass.discover_offers')}
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
      {/* Language Selector - Floating bottom right */}
      <div
        className="fixed right-4 z-50"
        style={{ bottom: "calc(env(safe-area-inset-bottom, 0px) + 88px)" }}
      >
        <LanguageSelector />
      </div>
      <div className="p-4 pb-24 space-y-6">
        {/* Pass Header with Gradient */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary/90 to-primary/70 text-white shadow-2xl">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold">{t('pass.my_pass')}</h1>
                <p className="text-white/80">{getDisplayName()}</p>
              </div>
              <Badge 
                variant="secondary" 
                className="bg-green-100 text-green-800 border-green-200"
              >
                {userPass.status === 'active' ? t('pass.active') : t('pass.inactive')}
              </Badge>
            </div>
            
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-white/80 text-sm">{t('pass.expires_on')}</span>
                <span className="font-semibold">{formatDate(userPass.expires_at)}</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-white/80">{t('pass.validity')}</span>
                  <span>{getDaysRemaining()} {t('pass.days_remaining')}</span>
                </div>
                <Progress 
                  value={100 - getPassProgress()} 
                  className="h-2 bg-white/20" 
                />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions removed as requested */}

        {/* Favorites Section */}
        <Card className="shadow-lg border-0 bg-card/60 backdrop-blur-sm">
          <CardContent className="p-6">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <div className="w-2 h-6 bg-gradient-to-b from-red-500 to-red-400 rounded-full"></div>
              {t('favorites.title')}
            </h3>
            
            {favoritesLoading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              </div>
            ) : favorites.length === 0 ? (
              <div className="text-center py-6">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Heart className="w-6 h-6 text-red-500" />
                </div>
                <p className="text-muted-foreground mb-3 text-sm">{t('favorites.no_favorites')}</p>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigate('/explorer')}
                  className="text-xs"
                >
                  {t('explorer.discover_offers')}
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {favorites.slice(0, 2).map((favorite) => (
                  <div 
                    key={favorite.id} 
                    className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => navigate(`/offer/${favorite.offer_id}`)}
                  >
                    <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                      {favorite.offer?.partner?.photos && favorite.offer.partner.photos.length > 0 ? (
                        <img
                          src={favorite.offer.partner.photos[0]}
                          alt={favorite.offer?.title || t('mon_pass.offer')}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                          <Tag className="w-6 h-6 text-primary" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <p className="font-medium text-sm line-clamp-1">{favorite.offer?.title}</p>
                      <p className="text-xs text-primary mb-1">{favorite.offer?.partner?.name}</p>
                      {favorite.offer?.partner?.address && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-muted-foreground" />
                          <p className="text-xs text-muted-foreground truncate">{favorite.offer.partner.address}</p>
                        </div>
                      )}
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFromFavorites(favorite.offer_id);
                      }}
                      className="text-red-500 hover:text-red-600 hover:bg-red-50 w-8 h-8"
                    >
                      <Heart className="w-4 h-4 fill-current" />
                    </Button>
                  </div>
                ))}
                
                {favorites.length > 2 && (
                  <Button 
                    variant="ghost" 
                    className="w-full mt-3 text-sm"
                    onClick={() => navigate('/favorites')}
                  >
                    {t('mon_pass.see_all_favorites')} ({favorites.length})
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Used Offers Section */}
        <Card className="shadow-lg border-0 bg-card/60 backdrop-blur-sm">
          <CardContent className="p-6">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <div className="w-2 h-6 bg-gradient-to-b from-green-500 to-green-400 rounded-full"></div>
              {t('mon_pass.used_offers')}
            </h3>
            
            {redemptions.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-muted/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground mb-2">{t('mon_pass.no_used_offers')}</p>
                <p className="text-sm text-muted-foreground">
                  {t('mon_pass.scan_qr_to_start')}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {redemptions.slice(0, 4).map((redemption) => (
                  <div key={redemption.id} className="border border-green-200 bg-green-50/50 rounded-xl p-4 relative">
                    {/* Badge UTILISÉE */}
                    <div className="absolute top-3 right-3">
                      <Badge className="bg-green-600 text-white text-xs font-semibold px-2 py-1">
                        {t('mon_pass.used_badge')}
                      </Badge>
                    </div>
                    
                    <div className="flex items-start gap-3 pr-20">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-500/20 to-green-400/10 rounded-xl flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="w-6 h-6 text-green-600" />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-sm text-green-800">{redemption.offer.title}</h4>
                          {redemption.offer.value_number && (
                            <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs">
                              -{redemption.offer.value_number}%
                            </Badge>
                          )}
                        </div>
                        
                        <p className="font-medium text-sm text-gray-700 mb-1">{redemption.partner.name}</p>
                        
                        <div className="flex items-center gap-4 text-xs text-gray-600">
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            <span>{redemption.partner.city.name}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{formatDate(redemption.redeemed_at)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {redemptions.length > 4 && (
                  <Button 
                    variant="outline" 
                    className="w-full mt-4 border-green-200 text-green-700 hover:bg-green-50"
                    onClick={() => navigate('/pass-history')}
                  >
                    {t('mon_pass.see_all_used_offers')} ({redemptions.length})
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
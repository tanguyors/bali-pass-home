import React, { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft,
  Award,
  Calendar,
  MapPin,
  Clock,
  TrendingUp
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';

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

const PassHistory: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [redemptions, setRedemptions] = useState<Redemption[]>([]);
  const [totalSavings, setTotalSavings] = useState<number>(0);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      fetchRedemptions();
    }
  }, [user]);

  const fetchRedemptions = async () => {
    if (!user) return;

    try {
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
      console.error('Error fetching redemptions:', error);
    }
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatTime = (dateString: string): string => {
    return new Date(dateString).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    navigate('/auth');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="p-4 pb-24 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate('/mon-pass')}
            className="shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{t('profile.pass_history')}</h1>
            <p className="text-muted-foreground">{t('profile.all_redemptions')}</p>
          </div>
        </div>

        {/* Savings Summary */}
        <Card className="shadow-lg border-0 bg-gradient-to-br from-emerald-50/50 to-emerald-100/30 border-emerald-200/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg text-emerald-800 mb-1">{t('profile.total_savings')}</h3>
                <p className="text-3xl font-bold text-emerald-700">
                  {totalSavings > 0 ? `${totalSavings}%` : '0%'}
                </p>
                <p className="text-sm text-emerald-600">
                  {redemptions.length} {t('profile.total_uses')}
                </p>
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-400 rounded-full flex items-center justify-center">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Redemptions List */}
        <Card className="shadow-lg border-0 bg-card/60 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="w-2 h-6 bg-gradient-to-b from-primary to-primary/60 rounded-full"></div>
              {t('profile.redemption_history')}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            {redemptions.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-muted/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground mb-2">{t('profile.no_redemptions')}</p>
                <p className="text-sm text-muted-foreground">
                  {t('profile.start_using_pass')}
                </p>
                <Button 
                  className="mt-4"
                  onClick={() => navigate('/explorer')}
                >
                  {t('profile.explore_offers')}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {redemptions.map((redemption) => (
                  <div key={redemption.id} className="p-4 rounded-lg bg-muted/30 hover:bg-muted/40 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-primary/10 to-primary/5 rounded-full flex items-center justify-center shrink-0">
                          <Award className="w-6 h-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-foreground mb-1">
                            {redemption.partner.name}
                          </h4>
                          <p className="text-sm text-muted-foreground mb-2">
                            {redemption.offer.title}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {redemption.partner.city.name}
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {formatDate(redemption.redeemed_at)}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatTime(redemption.redeemed_at)}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        {redemption.offer.value_number && (
                          <Badge variant="secondary" className="bg-green-100 text-green-800 text-sm">
                            -{redemption.offer.value_number}%
                          </Badge>
                        )}
                        <Badge 
                          variant={redemption.status === 'approved' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {redemption.status === 'approved' ? t('common.approved') : redemption.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PassHistory;
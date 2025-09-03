import { useState } from "react";
import { MapPin, Phone, Instagram, Star, CheckCircle, Calendar, Clock } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";

interface PartnerOffersModalProps {
  isOpen: boolean;
  onClose: () => void;
  partner: any;
}

interface RedemptionSuccess {
  offerTitle: string;
  userEmail: string;
  partnerName: string;
  partnerAddress: string;
  redeemedAt: string;
}

export function PartnerOffersModal({ isOpen, onClose, partner }: PartnerOffersModalProps) {
  const [isRedeeming, setIsRedeeming] = useState<string | null>(null);
  const [redemptionSuccess, setRedemptionSuccess] = useState<RedemptionSuccess | null>(null);
  const { toast } = useToast();
  const { t } = useLanguage();

  const handleRedeemOffer = async (offerId: string, offerTitle: string) => {
    setIsRedeeming(offerId);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: t('offer_details.login_required'),
          description: t('offer_details.login_to_favorite'),
          variant: "destructive",
        });
        return;
      }

      // Vérifier si l'utilisateur a un pass actif
      const { data: userPass } = await supabase
        .from('passes')
        .select('id, expires_at')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single();

      if (!userPass || new Date(userPass.expires_at) < new Date()) {
        toast({
          title: t('pass.no_pass'),
          description: t('pass.connect_to_access'),
          variant: "destructive",
        });
        return;
      }

      // Créer la rédemption
      const { error } = await supabase
        .from('redemptions')
        .insert([
          {
            pass_id: userPass.id,
            partner_id: partner.id,
            offer_id: offerId,
            redeemed_at: new Date().toISOString(),
            status: 'approved'
          }
        ]);

      if (error) {
        console.error('Erreur lors de la rédemption:', error);
        toast({
          title: t('common.error'),
          description: t('auth.unexpected_error'),
          variant: "destructive",
        });
        return;
      }

      // Afficher l'écran de confirmation
      setRedemptionSuccess({
        offerTitle,
        userEmail: user.email || '',
        partnerName: partner.name,
        partnerAddress: partner.address || '',
        redeemedAt: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('Erreur lors de la rédemption:', error);
      toast({
        title: t('common.error'),
        description: t('auth.unexpected_error'),
        variant: "destructive",
      });
    } finally {
      setIsRedeeming(null);
    }
  };

  if (!partner) return null;

  // Écran de confirmation après rédemption réussie
  if (redemptionSuccess) {
    const redemptionDate = new Date(redemptionSuccess.redeemedAt);
    const formatDate = redemptionDate.toLocaleDateString('fr-FR');
    const formatTime = redemptionDate.toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });

    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md mx-auto">
          <div className="text-center space-y-6 py-6">
            {/* Icône de succès */}
            <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>

            {/* Titre de confirmation */}
            <h2 className="text-xl font-bold text-green-600">
              {t('offers.offer_used_success')}
            </h2>

            <p className="text-muted-foreground">
              {t('offers.show_merchant')}
            </p>

            {/* Détails de la rédemption */}
            <div className="bg-green-50 rounded-lg p-4 space-y-3 text-left">
              {/* Email utilisateur */}
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-green-200 rounded-full flex items-center justify-center">
                  <span className="text-green-700 text-sm font-medium">@</span>
                </div>
                <span className="font-medium">{redemptionSuccess.userEmail}</span>
              </div>

              {/* Titre de l'offre */}
              <div className="text-center bg-white rounded-lg p-3">
                <p className="font-medium text-lg">{redemptionSuccess.offerTitle}</p>
                <p className="text-sm text-muted-foreground font-medium">{redemptionSuccess.partnerName}</p>
                {redemptionSuccess.partnerAddress && (
                  <p className="text-xs text-muted-foreground">{redemptionSuccess.partnerAddress}</p>
                )}
              </div>

              {/* Date et heure */}
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-green-600" />
                  <span className="text-sm">{formatDate}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-green-600" />
                  <span className="text-sm">{formatTime}</span>
                </div>
              </div>

              {/* Badge de validation */}
              <div className="text-center pt-2">
                <Badge className="bg-green-600 hover:bg-green-700 text-white px-6 py-2">
                  ✓ {t('offers.offer_validated')}
                </Badge>
              </div>
            </div>

            {/* Bouton fermer */}
            <Button 
              onClick={onClose} 
              className="w-full bg-green-600 hover:bg-green-700"
              size="lg"
            >
              {t('common.close')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-left">
            {partner.name}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Logo du partenaire */}
          {partner.logo_url && (
            <div className="flex justify-center">
              <img
                src={partner.logo_url}
                alt={`Logo ${partner.name}`}
                className="w-20 h-20 object-contain rounded-lg"
              />
            </div>
          )}

          {/* Informations du partenaire */}
          <div className="space-y-2">
            {partner.address && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4" />
                <span>{partner.address}</span>
              </div>
            )}
            
            {partner.phone && (
              <p className="text-muted-foreground text-sm">
                📞 {partner.phone}
              </p>
            )}
          </div>

          {/* Description */}
          {partner.description && (
            <p className="text-sm text-muted-foreground">
              {partner.description}
            </p>
          )}

          {/* Offres disponibles */}
          <div className="space-y-3">
            <h3 className="font-semibold flex items-center gap-2">
              <Star className="w-5 h-5 text-primary" />
              {t('pass.available_offers')}
            </h3>
            
            {partner.activeOffers?.map((offer: any) => (
              <Card key={offer.id} className="border-primary/20">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium">{offer.title}</h4>
                        {offer.short_desc && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {offer.short_desc}
                          </p>
                        )}
                      </div>
                      {offer.value_number && (
                        <Badge variant="secondary" className="ml-2">
                          -{offer.value_number}%
                        </Badge>
                      )}
                    </div>
                    
                    <Button
                      onClick={() => handleRedeemOffer(offer.id, offer.title)}
                      disabled={isRedeeming === offer.id}
                      className="w-full"
                      size="sm"
                    >
                      {isRedeeming === offer.id ? t('common.loading') : t('offers.view_offer')}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Photos du partenaire */}
          {partner.photos && partner.photos.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium">{t('common.photos')}</h4>
              <div className="grid grid-cols-2 gap-2">
                {partner.photos.slice(0, 4).map((photo: string, index: number) => (
                  <img
                    key={index}
                    src={photo}
                    alt={`Photo ${index + 1} de ${partner.name}`}
                    className="w-full h-24 object-cover rounded-lg"
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
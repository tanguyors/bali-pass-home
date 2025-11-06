import { useState } from "react";
import { MapPin, Phone, Instagram, Star, CheckCircle, User, Calendar, Clock } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { TrialExpiredModal } from "./TrialExpiredModal";

interface PartnerOffersModalProps {
  isOpen: boolean;
  onClose: () => void;
  partner: any;
}

export function PartnerOffersModal({ isOpen, onClose, partner }: PartnerOffersModalProps) {
  const [isRedeeming, setIsRedeeming] = useState<string | null>(null);
  const [showRedemptionConfirmation, setShowRedemptionConfirmation] = useState(false);
  const [redemptionData, setRedemptionData] = useState<any>(null);
  const [showTrialExpired, setShowTrialExpired] = useState(false);
  const [failedImages, setFailedImages] = useState<Set<number>>(new Set());
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
        .select('id, expires_at, qr_token')
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

      // Vérifier si l'offre a déjà été utilisée
      const { data: existingRedemption, error: redemptionError } = await supabase
        .from('redemptions')
        .select('id')
        .eq('pass_id', userPass.id)
        .eq('offer_id', offerId)
        .limit(1);

      console.log('Checking existing redemption:', { pass_id: userPass.id, offer_id: offerId, existingRedemption, redemptionError });

      if (existingRedemption && existingRedemption.length > 0) {
        toast({
          title: t('offer.already_used'),
          description: t('offer.already_used_desc'),
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

      // Trouver les détails de l'offre utilisée
      const usedOffer = partner.activeOffers?.find((offer: any) => offer.id === offerId);

      // Préparer les données de confirmation
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      const confirmationData = {
        offer: usedOffer || { title: offerTitle },
        partner: partner,
        userEmail: currentUser?.email || 'utilisateur@exemple.com',
        redemptionTime: new Date().toLocaleString('en-US', {
          day: '2-digit',
          month: '2-digit', 
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        })
      };

      // Afficher la confirmation
      setRedemptionData(confirmationData);
      setShowRedemptionConfirmation(true);

      // Vérifier si c'est un pass d'essai
      const isTrialPass = userPass.qr_token?.startsWith('TRIAL_');
      if (isTrialPass) {
        // Attendre un peu avant d'afficher le modal trial (laisser voir la confirmation)
        setTimeout(() => {
          setShowRedemptionConfirmation(false);
          setShowTrialExpired(true);
        }, 3000);
      }
      
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

  return (
    <>
      <Dialog open={isOpen && !showRedemptionConfirmation} onOpenChange={onClose}>
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
                  {partner.photos.slice(0, 4).map((photo: string, index: number) => {
                    if (failedImages.has(index)) return null;
                    return (
                      <img
                        key={index}
                        src={photo}
                        alt={`Photo ${index + 1} de ${partner.name}`}
                        className="w-full h-24 object-cover rounded-lg"
                        onError={() => {
                          setFailedImages(prev => new Set(prev).add(index));
                        }}
                      />
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirmation de rédemption */}
      <Dialog open={showRedemptionConfirmation} onOpenChange={setShowRedemptionConfirmation}>
        <DialogContent className="max-w-md mx-auto bg-white rounded-3xl p-6">
          <div className="text-center space-y-6">
            {/* Icône de succès */}
            <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>

            {/* Titre */}
            <div>
              <h2 className="text-xl font-bold text-green-600 mb-2">
                Offer used successfully!
              </h2>
              <p className="text-gray-600">
                Show this screen to the merchant
              </p>
            </div>

            {/* Détails de la rédemption */}
            {redemptionData && (
              <div className="bg-green-50 rounded-2xl p-4 space-y-3">
                {/* Email utilisateur */}
                <div className="flex items-center gap-2 text-sm">
                  <User className="w-4 h-4 text-green-600" />
                  <span className="font-medium">{redemptionData.userEmail}</span>
                </div>

                {/* Titre de l'offre */}
                <h3 className="font-semibold text-center">
                  {redemptionData.offer.title}
                </h3>

                {/* Nom du partenaire */}
                <p className="text-center text-gray-700 font-medium">
                  {redemptionData.partner.name}
                </p>

                {/* Adresse */}
                {redemptionData.partner.address && (
                  <p className="text-center text-sm text-gray-600">
                    {redemptionData.partner.address}
                  </p>
                )}

                {/* Date et heure */}
                <div className="flex justify-between items-center text-sm text-green-600">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{redemptionData.redemptionTime.split(' ')[0]}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{redemptionData.redemptionTime.split(' ')[1]}</span>
                  </div>
                </div>

                {/* Badge de validation */}
                <div className="bg-green-600 text-white text-center py-3 rounded-xl font-semibold">
                  ✓ OFFER VALIDATED
                </div>
              </div>
            )}

            {/* Bouton de fermeture */}
            <Button 
              onClick={() => {
                setShowRedemptionConfirmation(false);
                onClose();
              }}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-semibold"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <TrialExpiredModal
        isOpen={showTrialExpired}
        onClose={() => {
          setShowTrialExpired(false);
          onClose();
        }}
      />
    </>
  );
}
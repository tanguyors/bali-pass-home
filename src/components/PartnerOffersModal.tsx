import { useState } from "react";
import { MapPin, Phone, Instagram, Star } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface PartnerOffersModalProps {
  isOpen: boolean;
  onClose: () => void;
  partner: any;
}

export function PartnerOffersModal({ isOpen, onClose, partner }: PartnerOffersModalProps) {
  const [isRedeeming, setIsRedeeming] = useState<string | null>(null);
  const { toast } = useToast();

  const handleRedeemOffer = async (offerId: string, offerTitle: string) => {
    setIsRedeeming(offerId);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Connexion requise",
          description: "Vous devez être connecté pour utiliser une offre.",
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
          title: "Pass requis",
          description: "Vous devez avoir un Bali'Pass actif pour utiliser cette offre.",
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
          title: "Erreur",
          description: "Une erreur s'est produite lors de l'utilisation de l'offre.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Offre utilisée !",
        description: `Vous avez utilisé l'offre "${offerTitle}" chez ${partner.name}.`,
      });

      onClose();
      
    } catch (error) {
      console.error('Erreur lors de la rédemption:', error);
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de l'utilisation de l'offre.",
        variant: "destructive",
      });
    } finally {
      setIsRedeeming(null);
    }
  };

  if (!partner) return null;

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
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="w-4 h-4" />
                <span>{partner.phone}</span>
              </div>
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
              Offres disponibles
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
                      {isRedeeming === offer.id ? "Utilisation..." : "Utiliser cette offre"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Photos du partenaire */}
          {partner.photos && partner.photos.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium">Photos</h4>
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
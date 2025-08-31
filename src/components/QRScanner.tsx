import { useState, useEffect, useRef } from "react";
import { X, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface QRScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (partnerData: any) => void;
}

export function QRScanner({ isOpen, onClose, onScanSuccess }: QRScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [manualInput, setManualInput] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      setScanned(false);
      setManualInput("");
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isOpen]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // Caméra arrière
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setHasPermission(true);
      }
    } catch (error) {
      console.error("Erreur lors de l'accès à la caméra:", error);
      
      let errorMessage = "Impossible d'accéder à la caméra.";
      if (error.name === 'NotAllowedError') {
        errorMessage = "Veuillez autoriser l'accès à la caméra.";
      } else if (error.name === 'NotFoundError') {
        errorMessage = "Aucune caméra détectée.";
      }
      
      toast({
        title: "Erreur caméra",
        description: errorMessage,
        variant: "destructive",
      });
      
      setHasPermission(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const handleManualSubmit = () => {
    if (manualInput.trim()) {
      handleScanResult(manualInput.trim());
    }
  };

  const handleScanResult = async (data: string) => {
    if (scanned) return;
    
    setScanned(true);
    
    try {
      // Vérifier si c'est un QR code partenaire
      if (!data.startsWith('PARTNER_')) {
        toast({
          title: "Code invalide",
          description: "Ce n'est pas un code partenaire Bali'Pass valide.",
          variant: "destructive",
        });
        setTimeout(() => setScanned(false), 2000);
        return;
      }

      // Chercher le partenaire dans la base de données
      const { data: partner, error } = await supabase
        .from('partners')
        .select(`
          id,
          name,
          address,
          phone,
          description,
          logo_url,
          photos,
          offers!inner (
            id,
            title,
            short_desc,
            value_number,
            is_active
          )
        `)
        .eq('qr_code', data)
        .eq('status', 'approved')
        .single();

      if (error || !partner) {
        toast({
          title: "Partenaire introuvable",
          description: "Ce code ne correspond à aucun partenaire actif.",
          variant: "destructive",
        });
        setTimeout(() => setScanned(false), 2000);
        return;
      }

      // Vérifier les offres actives
      const activeOffers = partner.offers?.filter((offer: any) => offer.is_active) || [];
      
      if (activeOffers.length === 0) {
        toast({
          title: "Aucune offre disponible",
          description: "Ce partenaire n'a actuellement aucune offre active.",
          variant: "destructive",
        });
        setTimeout(() => setScanned(false), 2000);
        return;
      }

      toast({
        title: "Partenaire trouvé !",
        description: `${partner.name} - ${activeOffers.length} offre(s) disponible(s)`,
      });

      onScanSuccess({
        ...partner,
        activeOffers
      });
      onClose();
      
    } catch (error) {
      console.error('Erreur lors de la validation du code:', error);
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de la validation.",
        variant: "destructive",
      });
      setTimeout(() => setScanned(false), 2000);
    }
  };

  if (hasPermission === null) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-sm mx-auto">
          <div className="text-center p-6">
            <Camera className="w-12 h-12 mx-auto mb-4 text-muted-foreground animate-pulse" />
            <h3 className="text-lg font-semibold mb-2">Initialisation de la caméra...</h3>
            <p className="text-muted-foreground">
              Veuillez patienter pendant que nous accédons à votre caméra.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (hasPermission === false) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-sm mx-auto">
          <div className="text-center p-6">
            <Camera className="w-12 h-12 mx-auto mb-4 text-destructive" />
            <h3 className="text-lg font-semibold mb-2">Scanner temporairement indisponible</h3>
            <p className="text-muted-foreground mb-4">
              Vous pouvez saisir manuellement le code partenaire en attendant.
            </p>
            
            <div className="space-y-4">
              <div>
                <input
                  type="text"
                  value={manualInput}
                  onChange={(e) => setManualInput(e.target.value)}
                  placeholder="PARTNER_XXXXX"
                  className="w-full p-3 border rounded-lg text-center"
                />
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={handleManualSubmit}
                  disabled={!manualInput.trim()}
                  className="flex-1"
                >
                  Valider
                </Button>
                <Button variant="outline" onClick={onClose}>
                  Fermer
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-full max-h-full w-full h-full p-0 border-0">
        <div className="relative w-full h-full bg-black">
          {/* Video element for camera feed */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
          
          {/* Overlay avec instructions */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="relative mb-8">
              {/* Zone de scan */}
              <div className="w-64 h-64 border-4 border-white border-opacity-50 rounded-lg">
                {/* Coins du cadre */}
                <div className="absolute -top-1 -left-1 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-lg"></div>
                <div className="absolute -top-1 -right-1 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-lg"></div>
                <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-lg"></div>
                <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-lg"></div>
                
                {/* Ligne de scan animée */}
                <div className="absolute inset-0 overflow-hidden rounded-lg">
                  <div className="w-full h-1 bg-primary animate-scan-line"></div>
                </div>
              </div>
            </div>

            {/* Instructions et saisie manuelle */}
            <div className="text-center space-y-4 px-4">
              <p className="text-white text-sm bg-black bg-opacity-50 px-4 py-2 rounded-lg">
                Pointez la caméra vers le QR code du partenaire
              </p>
              
              <div className="bg-black bg-opacity-70 p-4 rounded-lg">
                <p className="text-white text-xs mb-2">Ou saisissez le code manuellement :</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={manualInput}
                    onChange={(e) => setManualInput(e.target.value)}
                    placeholder="PARTNER_XXXXX"
                    className="px-3 py-2 rounded text-sm flex-1"
                  />
                  <Button 
                    size="sm"
                    onClick={handleManualSubmit}
                    disabled={!manualInput.trim()}
                  >
                    OK
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Contrôle de fermeture */}
          <div className="absolute top-4 right-4 z-10">
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="bg-black bg-opacity-50 text-white hover:bg-black hover:bg-opacity-70"
            >
              <X className="w-6 h-6" />
            </Button>
          </div>

          {scanned && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="bg-card p-6 rounded-lg">
                <p className="text-center">Validation du code...</p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
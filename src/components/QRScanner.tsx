import { useState, useEffect, useRef } from "react";
import QrScanner from "qr-scanner";
import { X, Flashlight, FlashlightOff, Camera } from "lucide-react";
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
  const qrScannerRef = useRef<QrScanner | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [flashOn, setFlashOn] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      setScanned(false);
      startScanner();
    } else {
      stopScanner();
    }

    return () => {
      stopScanner();
    };
  }, [isOpen]);

  const startScanner = async () => {
    if (!videoRef.current) return;

    try {
      // Check if camera is available
      const hasCamera = await QrScanner.hasCamera();
      if (!hasCamera) {
        setHasPermission(false);
        return;
      }

      // Create QR scanner instance
      qrScannerRef.current = new QrScanner(
        videoRef.current,
        (result) => handleScanResult(result.data),
        {
          highlightScanRegion: true,
          highlightCodeOutline: true,
        }
      );

      await qrScannerRef.current.start();
      setHasPermission(true);
    } catch (error) {
      console.error("Erreur lors du démarrage du scanner:", error);
      setHasPermission(false);
    }
  };

  const stopScanner = () => {
    if (qrScannerRef.current) {
      qrScannerRef.current.stop();
      qrScannerRef.current.destroy();
      qrScannerRef.current = null;
    }
  };

  const handleScanResult = async (data: string) => {
    if (scanned) return;
    
    setScanned(true);
    
    try {
      // Vérifier si c'est un QR code partenaire
      if (!data.startsWith('PARTNER_')) {
        toast({
          title: "QR Code invalide",
          description: "Ce n'est pas un QR code partenaire Bali'Pass valide.",
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
          description: "Ce QR code ne correspond à aucun partenaire actif.",
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
      console.error('Erreur lors de la validation du QR code:', error);
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de la validation du QR code.",
        variant: "destructive",
      });
      setTimeout(() => setScanned(false), 2000);
    }
  };

  const toggleFlash = async () => {
    if (qrScannerRef.current) {
      try {
        if (flashOn) {
          await qrScannerRef.current.turnFlashOff();
        } else {
          await qrScannerRef.current.turnFlashOn();
        }
        setFlashOn(!flashOn);
      } catch (error) {
        console.error("Erreur lors du contrôle du flash:", error);
      }
    }
  };

  if (hasPermission === null) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-sm mx-auto">
          <div className="text-center p-6">
            <Camera className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
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
            <h3 className="text-lg font-semibold mb-2">Accès à la caméra requis</h3>
            <p className="text-muted-foreground mb-4">
              L'application a besoin d'accéder à votre caméra pour scanner les QR codes des partenaires.
            </p>
            <Button onClick={onClose}>Fermer</Button>
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
            className="w-full h-full object-cover"
            style={{ transform: 'scaleX(-1)' }} // Mirror effect
          />
          
          {/* Overlay avec cadre de scan */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative">
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
              
              {/* Instructions */}
              <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2">
                <p className="text-white text-center text-sm bg-black bg-opacity-50 px-4 py-2 rounded-lg">
                  Pointez la caméra vers le QR code du partenaire
                </p>
              </div>
            </div>
          </div>

          {/* Contrôles */}
          <div className="absolute top-4 left-0 right-0 flex justify-between items-center p-4 z-10">
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="bg-black bg-opacity-50 text-white hover:bg-black hover:bg-opacity-70"
            >
              <X className="w-6 h-6" />
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleFlash}
              className="bg-black bg-opacity-50 text-white hover:bg-black hover:bg-opacity-70"
            >
              {flashOn ? <FlashlightOff className="w-6 h-6" /> : <Flashlight className="w-6 h-6" />}
            </Button>
          </div>

          {scanned && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="bg-card p-6 rounded-lg">
                <p className="text-center">Validation du QR code...</p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
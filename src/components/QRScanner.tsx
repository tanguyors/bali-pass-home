import { useState, useEffect, useRef } from "react";
import { X, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Capacitor } from "@capacitor/core";
import { Camera as CapCamera, CameraResultType, CameraSource } from "@capacitor/camera";
import QrScanner from "qr-scanner";

interface QRScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (partnerData: any) => void;
}

export function QRScanner({ isOpen, onClose, onScanSuccess }: QRScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const qrScannerRef = useRef<QrScanner | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [manualInput, setManualInput] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    console.log("QRScanner useEffect triggered. isOpen:", isOpen);
    
    if (isOpen) {
      console.log("QRScanner is opening...");
      setScanned(false);
      setManualInput("");
      startCamera();
    } else {
      console.log("QRScanner is closing...");
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isOpen]);

  const startCamera = async () => {
    console.log("startCamera called");
    
    // Vérifier si on est dans un environnement natif
    if (Capacitor.isNativePlatform()) {
      console.log("Native platform detected");
      setHasPermission(true);
      return;
    }

    // Utiliser l'API web pour le navigateur
    try {
      console.log("Requesting camera access...");
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });

      console.log("Camera stream obtained");
      
      if (videoRef.current) {
        console.log("Setting video source");
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        
        // Propriétés nécessaires pour Safari mobile
        videoRef.current.playsInline = true;
        videoRef.current.muted = true;
        videoRef.current.autoplay = true;
        
        console.log("Video element properties set");
        
        // Essayer de jouer immédiatement
        try {
          await videoRef.current.play();
          console.log("Video started playing successfully");
          setHasPermission(true);
        } catch (playError) {
          console.error("Error playing video:", playError);
          
          // Fallback: essayer avec un event listener
          videoRef.current.oncanplay = () => {
            console.log("Video can play - attempting to start");
            if (videoRef.current) {
              videoRef.current.play().then(() => {
                console.log("Video playing after canplay event");
                setHasPermission(true);
              }).catch(e => {
                console.error("Still can't play:", e);
                setHasPermission(true); // Continue anyway
              });
            }
          };
          
          // Dernier fallback
          setTimeout(() => {
            console.log("Final fallback: setting permission");
            setHasPermission(true);
          }, 2000);
        }
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

  const takeNativePhoto = async () => {
    try {
      if (!Capacitor.isNativePlatform()) return;

      const image = await CapCamera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera,
        saveToGallery: false
      });

      // Simuler un scan réussi - dans une vraie app, il faudrait analyser l'image
      // Pour le moment, on demande la saisie manuelle
      toast({
        title: "Photo prise",
        description: "Veuillez saisir le code manuellement pour le moment.",
      });
      
    } catch (error) {
      console.error("Erreur lors de la prise de photo:", error);
      toast({
        title: "Erreur",
        description: "Impossible de prendre la photo.",
        variant: "destructive",
      });
    }
  };

  const stopCamera = () => {
    // Arrêter le scanner QR
    if (qrScannerRef.current) {
      console.log("Stopping QR Scanner");
      qrScannerRef.current.stop();
      qrScannerRef.current.destroy();
      qrScannerRef.current = null;
    }
    
    // Arrêter le stream de caméra
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
          {/* Video element for camera feed (web uniquement) */}
          {!Capacitor.isNativePlatform() && (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="absolute inset-0 w-full h-full object-cover z-0"
            />
          )}
          
          {/* Interface native - pas de vidéo en temps réel */}
          {Capacitor.isNativePlatform() && (
            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
              <div className="text-center space-y-6">
                <Camera className="w-24 h-24 mx-auto text-primary" />
                <div>
                  <h3 className="text-white text-xl font-semibold mb-2">Scanner QR Code</h3>
                  <p className="text-white/80 mb-6">Appuyez sur le bouton pour prendre une photo du QR code</p>
                  <Button 
                    onClick={takeNativePhoto}
                    size="lg"
                    className="mb-4"
                  >
                    <Camera className="w-5 h-5 mr-2" />
                    Prendre une photo
                  </Button>
                </div>
              </div>
            </div>
          )}
          
          {/* Overlay avec instructions (web uniquement) - semi-transparent pour voir la vidéo */}
          {!Capacitor.isNativePlatform() && (
            <div className="absolute inset-0 flex flex-col items-center justify-center z-10 pointer-events-none">
              <div className="relative mb-8 pointer-events-auto">
                {/* Zone de scan */}
                <div className="w-64 h-64 border-4 border-white border-opacity-50 rounded-lg bg-transparent">
                  {/* Coins du cadre */}
                  <div className="absolute -top-1 -left-1 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-lg"></div>
                  <div className="absolute -top-1 -right-1 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-lg"></div>
                  <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-lg"></div>
                  <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-lg"></div>
                  
                  {/* Ligne de scan animée */}
                  <div className="absolute inset-0 overflow-hidden rounded-lg">
                    <div className="w-full h-1 bg-primary animate-scan-line opacity-80"></div>
                  </div>
                </div>
              </div>

              {/* Instructions - plus bas pour ne pas couvrir la zone de scan */}
              <div className="absolute bottom-32 left-4 right-4 pointer-events-auto">
                <div className="text-center space-y-4">
                  <p className="text-white text-sm bg-black bg-opacity-70 px-4 py-2 rounded-lg">
                    Pointez la caméra vers le QR code du partenaire
                  </p>
                  
                  <div className="bg-black bg-opacity-80 p-4 rounded-lg">
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
            </div>
          )}

          {/* Saisie manuelle pour l'app native */}
          {Capacitor.isNativePlatform() && (
            <div className="absolute bottom-20 left-4 right-4">
              <div className="bg-black bg-opacity-70 p-4 rounded-lg">
                <p className="text-white text-sm mb-2 text-center">Ou saisissez le code manuellement :</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={manualInput}
                    onChange={(e) => setManualInput(e.target.value)}
                    placeholder="PARTNER_XXXXX"
                    className="px-3 py-2 rounded flex-1"
                  />
                  <Button 
                    onClick={handleManualSubmit}
                    disabled={!manualInput.trim()}
                  >
                    Valider
                  </Button>
                </div>
              </div>
            </div>
          )}

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
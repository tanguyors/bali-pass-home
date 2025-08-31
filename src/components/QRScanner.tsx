import { useState, useEffect, useRef } from "react";
import { X, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Capacitor } from "@capacitor/core";
import { Camera as CapCamera, CameraResultType, CameraSource } from "@capacitor/camera";
import jsQR from "jsqr";

interface QRScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (partnerData: any) => void;
}

export function QRScanner({ isOpen, onClose, onScanSuccess }: QRScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const intervalRef = useRef<NodeJS.Timeout>();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [manualInput, setManualInput] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    console.log("QRScanner useEffect triggered. isOpen:", isOpen);
    
    if (isOpen) {
      console.log("QRScanner is opening...");
      setScanned(false);
      setManualInput("");
      setHasPermission(null);
      // Délai pour s'assurer que le DOM est prêt
      setTimeout(() => {
        startCamera();
      }, 100);
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
        
        // Propriétés nécessaires pour Safari mobile
        videoRef.current.playsInline = true;
        videoRef.current.muted = true;
        videoRef.current.autoplay = true;
        
        console.log("Video element properties set");
        
        // Attendre que la vidéo soit prête
        videoRef.current.onloadedmetadata = () => {
          console.log("Video metadata loaded");
          setHasPermission(true);
          setIsScanning(true);
          startScanning();
        };
        
        // Fallback
        setTimeout(() => {
          console.log("Fallback: setting permission to true");
          setHasPermission(true);
          setIsScanning(true);
          startScanning();
        }, 2000);
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

  const startScanning = () => {
    console.log("Starting QR code scanning...");
    intervalRef.current = setInterval(() => {
      scanQRCode();
    }, 100); // Scan toutes les 100ms
  };

  const scanQRCode = () => {
    if (!videoRef.current || !canvasRef.current || scanned) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context || video.videoWidth === 0) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0);

    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    
    // Utilisation de jsQR avec plusieurs tentatives d'inversion
    const code = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: "attemptBoth",
    });

    if (code) {
      console.log("=== QR CODE DETECTÉ ===");
      console.log("Données brutes:", JSON.stringify(code.data));
      
      // Nettoyer les données scannées
      const cleanedData = code.data.trim().replace(/[\r\n\t\s]/g, '');
      console.log("Données nettoyées:", JSON.stringify(cleanedData));
      
      stopCamera();
      handleScanResult(cleanedData);
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
    console.log("Stopping camera and scanning");
    
    // Arrêter le scanning
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = undefined;
    }
    
    // Arrêter le stream de caméra
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    
    setIsScanning(false);
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-full max-h-full w-full h-full p-0 border-0">
        <VisuallyHidden>
          <DialogTitle>Scanner QR des partenaires</DialogTitle>
        </VisuallyHidden>
        
        {/* Loading state overlay */}
        {hasPermission === null && (
          <div className="absolute inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
            <div className="text-center p-6 bg-card rounded-lg">
              <Camera className="w-12 h-12 mx-auto mb-4 text-muted-foreground animate-pulse" />
              <h3 className="text-lg font-semibold mb-2">Initialisation de la caméra...</h3>
              <p className="text-muted-foreground">
                Veuillez patienter pendant que nous accédons à votre caméra.
              </p>
            </div>
          </div>
        )}

        {/* Error state overlay */}
        {hasPermission === false && (
          <div className="absolute inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
            <div className="text-center p-6 bg-card rounded-lg max-w-sm mx-4">
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
          </div>
        )}

        <div className="relative w-full h-full bg-black">
          {/* Video element - toujours présent pour que videoRef.current existe */}
          {!Capacitor.isNativePlatform() && (
            <div className="relative w-full h-full">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
                style={{ visibility: hasPermission === true ? 'visible' : 'hidden' }}
              />
              <canvas ref={canvasRef} className="hidden" />
            </div>
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
          
          {/* Overlay avec instructions (web uniquement) - seulement si caméra active */}
          {!Capacitor.isNativePlatform() && hasPermission === true && (
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <div className="relative mb-8">
                {/* Zone de scan */}
                <div className="w-64 h-64 border-4 border-white border-opacity-30 rounded-lg bg-transparent">
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
                  
                  {isScanning && (
                    <p className="text-primary text-xs bg-black bg-opacity-50 px-3 py-1 rounded">
                      Scanner actif - Recherche de QR code...
                    </p>
                  )}
                  
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
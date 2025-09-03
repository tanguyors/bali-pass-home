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
import { logger } from "@/lib/logger";

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
    logger.debug("QRScanner useEffect triggered", { isOpen });
    
    if (isOpen) {
      logger.debug("QRScanner is opening");
      setScanned(false);
      setManualInput("");
      setHasPermission(null);
      setIsScanning(false);
      
      // Délai pour s'assurer que le DOM est prêt
      const timer = setTimeout(() => {
        if (isOpen) { // Double check isOpen is still true
          startCamera();
        }
      }, 100);
      
      return () => {
        clearTimeout(timer);
        stopCamera();
      };
    } else {
      logger.debug("QRScanner is closing");
      stopCamera();
      return () => {}; // Return empty cleanup function for else branch
    }
  }, [isOpen]); // Only depend on isOpen

  const startCamera = async () => {
    logger.debug("startCamera called");
    
    // Vérifier si on est dans un environnement natif
    if (Capacitor.isNativePlatform()) {
      logger.debug("Native platform detected");
      setHasPermission(true);
      return;
    }

    // Utiliser l'API web pour le navigateur
    try {
      logger.debug("Requesting camera access");
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });

      logger.debug("Camera stream obtained");
      
      if (videoRef.current) {
        logger.debug("Setting video source");
        videoRef.current.srcObject = stream;
        
        // Propriétés nécessaires pour Safari mobile
        videoRef.current.playsInline = true;
        videoRef.current.muted = true;
        videoRef.current.autoplay = true;
        
        logger.debug("Video element properties set");
        
        // Attendre que la vidéo soit prête
        videoRef.current.onloadedmetadata = () => {
          logger.debug("Video metadata loaded");
          setHasPermission(true);
          setIsScanning(true);
          startScanning();
        };
        
        // Fallback
        setTimeout(() => {
          logger.debug("Fallback: setting permission to true");
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
    logger.debug("Starting QR code scanning");
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
      logger.debug("QR CODE DÉTECTÉ", { 
        rawData: code.data,
        cleanedData: code.data.trim().replace(/[\r\n\t\s]/g, '')
      });
      
      // Nettoyer les données scannées
      const cleanedData = code.data.trim().replace(/[\r\n\t\s]/g, '');
      
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
    if (!isScanning && !intervalRef.current) return; // Early exit if already stopped
    
    logger.debug("Stopping camera and scanning");
    
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
    setHasPermission(null);
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
      <DialogContent className="max-w-full max-h-full w-full h-full p-0 border-0 rounded-none">
        <VisuallyHidden>
          <DialogTitle>Scanner QR des partenaires</DialogTitle>
        </VisuallyHidden>
        
        {/* Loading state overlay */}
        {hasPermission === null && (
          <div className="absolute inset-0 bg-gradient-to-br from-background/95 via-background/90 to-primary/10 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="text-center p-8 bg-card/80 backdrop-blur-md rounded-3xl border border-border/50 shadow-2xl max-w-sm mx-4">
              <div className="relative mb-6">
                <div className="w-16 h-16 mx-auto bg-gradient-to-br from-primary to-primary/70 rounded-2xl flex items-center justify-center shadow-lg">
                  <Camera className="w-8 h-8 text-white animate-pulse" />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-emerald-500 rounded-full animate-ping"></div>
              </div>
              <h3 className="text-xl font-bold mb-3 bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
                Initialisation
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Préparation de la caméra pour scanner les codes QR
              </p>
            </div>
          </div>
        )}

        {/* Error state overlay */}
        {hasPermission === false && (
          <div className="absolute inset-0 bg-gradient-to-br from-background/95 via-background/90 to-destructive/10 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="text-center p-8 bg-card/80 backdrop-blur-md rounded-3xl border border-border/50 shadow-2xl max-w-md mx-4">
              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-destructive to-destructive/70 rounded-2xl flex items-center justify-center shadow-lg mb-6">
                <Camera className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-foreground">Scanner indisponible</h3>
              <p className="text-muted-foreground mb-6 text-sm">
                Saisissez manuellement le code partenaire
              </p>
              
              <div className="space-y-4">
                <div className="relative">
                  <input
                    type="text"
                    value={manualInput}
                    onChange={(e) => setManualInput(e.target.value)}
                    placeholder="PARTNER_XXXXX"
                    className="w-full p-4 bg-background/60 border border-border/60 rounded-2xl text-center font-mono text-sm focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                  />
                </div>
                <div className="flex gap-3">
                  <Button 
                    onClick={handleManualSubmit}
                    disabled={!manualInput.trim()}
                    className="flex-1 h-12 rounded-2xl bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg transition-all duration-300"
                  >
                    Valider
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={onClose}
                    className="h-12 px-6 rounded-2xl border-border/60 hover:bg-muted/50 transition-all duration-300"
                  >
                    Fermer
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="relative w-full h-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
          {/* Video element - Web */}
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
          
          {/* Interface native */}
          {Capacitor.isNativePlatform() && (
            <div className="w-full h-full bg-gradient-to-br from-slate-900 via-slate-800 to-primary/10 flex items-center justify-center">
              <div className="text-center space-y-8 px-6">
                <div className="relative">
                  <div className="w-32 h-32 mx-auto bg-gradient-to-br from-primary via-primary to-primary/70 rounded-3xl flex items-center justify-center shadow-2xl">
                    <Camera className="w-16 h-16 text-white" />
                  </div>
                  <div className="absolute -top-3 -right-3 w-8 h-8 bg-emerald-500 rounded-full animate-ping"></div>
                </div>
                <div>
                  <h3 className="text-white text-2xl font-bold mb-3">Scanner QR</h3>
                  <p className="text-white/80 mb-8 text-lg leading-relaxed">
                    Capturez le code QR du partenaire
                  </p>
                  <Button 
                    onClick={takeNativePhoto}
                    size="lg"
                    className="h-14 px-8 rounded-2xl bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-xl text-lg font-semibold transition-all duration-300 transform hover:scale-105"
                  >
                    <Camera className="w-6 h-6 mr-3" />
                    Capturer
                  </Button>
                </div>
              </div>
            </div>
          )}
          
          {/* Overlay moderne pour le web */}
          {!Capacitor.isNativePlatform() && hasPermission === true && (
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              {/* Zone de scan moderne */}
              <div className="relative mb-12">
                <div className="w-72 h-72 relative">
                  {/* Fond du cadre avec effet glassmorphism */}
                  <div className="absolute inset-0 bg-white/5 backdrop-blur-sm rounded-3xl border border-white/20"></div>
                  
                  {/* Coins animés du cadre */}
                  <div className="absolute -top-3 -left-3 w-12 h-12 border-t-4 border-l-4 border-primary rounded-tl-2xl animate-pulse"></div>
                  <div className="absolute -top-3 -right-3 w-12 h-12 border-t-4 border-r-4 border-primary rounded-tr-2xl animate-pulse"></div>
                  <div className="absolute -bottom-3 -left-3 w-12 h-12 border-b-4 border-l-4 border-primary rounded-bl-2xl animate-pulse"></div>
                  <div className="absolute -bottom-3 -right-3 w-12 h-12 border-b-4 border-r-4 border-primary rounded-br-2xl animate-pulse"></div>
                  
                  {/* Ligne de scan avec gradient */}
                  <div className="absolute inset-4 overflow-hidden rounded-2xl">
                    <div className="w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent animate-scan-line opacity-90 shadow-lg"></div>
                  </div>
                  
                  {/* Icône centrale */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/20">
                      <div className="w-8 h-8 border-2 border-white/60 rounded border-dashed animate-spin"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Interface utilisateur moderne */}
              <div className="absolute bottom-24 left-6 right-6 pointer-events-auto space-y-4">
                {/* Instructions principales */}
                <div className="text-center">
                  <div className="inline-flex items-center gap-3 bg-black/60 backdrop-blur-md px-6 py-3 rounded-full border border-white/20">
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                    <p className="text-white font-medium">
                      Pointez la caméra vers le QR code du partenaire
                    </p>
                  </div>
                </div>
                
                {/* Statut de scan */}
                {isScanning && (
                  <div className="text-center">
                    <div className="inline-flex items-center gap-2 bg-primary/20 backdrop-blur-sm px-4 py-2 rounded-full border border-primary/30">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full animate-ping"></div>
                      <p className="text-primary text-sm font-medium">
                        Recherche en cours...
                      </p>
                    </div>
                  </div>
                )}
                
                {/* Zone de saisie manuelle moderne */}
                <div className="bg-black/70 backdrop-blur-md p-6 rounded-3xl border border-white/20 shadow-2xl">
                  <div className="text-center mb-4">
                    <p className="text-white/90 text-sm font-medium">
                      Ou saisissez le code manuellement
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        value={manualInput}
                        onChange={(e) => setManualInput(e.target.value)}
                        placeholder="PARTNER_XXXXX"
                        className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl text-white placeholder-white/50 font-mono text-sm focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                      />
                    </div>
                    <Button 
                      onClick={handleManualSubmit}
                      disabled={!manualInput.trim()}
                      className="h-12 px-6 rounded-2xl bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 disabled:opacity-50 font-semibold shadow-lg transition-all duration-300 transform hover:scale-105 disabled:transform-none"
                    >
                      OK
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Saisie manuelle pour l'app native */}
          {Capacitor.isNativePlatform() && (
            <div className="absolute bottom-24 left-6 right-6">
              <div className="bg-black/70 backdrop-blur-md p-6 rounded-3xl border border-white/20 shadow-2xl">
                <p className="text-white text-center mb-4 font-medium">
                  Ou saisissez le code manuellement
                </p>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={manualInput}
                    onChange={(e) => setManualInput(e.target.value)}
                    placeholder="PARTNER_XXXXX"
                    className="flex-1 px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl text-white placeholder-white/50 font-mono focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                  />
                  <Button 
                    onClick={handleManualSubmit}
                    disabled={!manualInput.trim()}
                    className="h-12 px-6 rounded-2xl bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 disabled:opacity-50 font-semibold shadow-lg transition-all duration-300"
                  >
                    Valider
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Bouton de fermeture moderne */}
          <div className="absolute top-6 right-6 z-10">
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="w-12 h-12 bg-black/30 backdrop-blur-sm text-white hover:bg-black/50 border border-white/20 rounded-2xl transition-all duration-300 transform hover:scale-110"
            >
              <X className="w-6 h-6" />
            </Button>
          </div>

          {/* État de validation avec animation */}
          {scanned && (
            <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/50 to-primary/20 backdrop-blur-sm flex items-center justify-center z-40">
              <div className="bg-card/90 backdrop-blur-md p-8 rounded-3xl border border-border/50 shadow-2xl animate-scale-in">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto bg-gradient-to-br from-primary to-primary/70 rounded-2xl flex items-center justify-center mb-4 animate-pulse">
                    <div className="w-6 h-6 border-2 border-white rounded-full border-t-transparent animate-spin"></div>
                  </div>
                  <p className="text-lg font-semibold text-foreground">Validation du code...</p>
                  <p className="text-sm text-muted-foreground mt-2">Vérification en cours</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
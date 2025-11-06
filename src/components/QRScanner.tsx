import { useState, useEffect, useRef } from "react";
import { X, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Capacitor } from "@capacitor/core";
import { BarcodeScanner } from "@capacitor-mlkit/barcode-scanning";
import { Camera as CapCamera, CameraResultType, CameraSource } from "@capacitor/camera";
import jsQR from "jsqr";
import { logger } from "@/lib/logger";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTrialStatus } from "@/hooks/useTrialStatus";
import { TrialExpiredModal } from "@/components/TrialExpiredModal";

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
  const [showTrialExpired, setShowTrialExpired] = useState(false);
  const { toast } = useToast();
  const { t } = useLanguage();
  const { isTrialExpired } = useTrialStatus();

  // Si le trial est expiré, afficher immédiatement le modal
  useEffect(() => {
    if (isOpen && isTrialExpired) {
      setShowTrialExpired(true);
    }
  }, [isOpen, isTrialExpired]);

  useEffect(() => {
    if (isOpen) {
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
      stopCamera();
      return () => {}; // Return empty cleanup function for else branch
    }
  }, [isOpen]); // Only depend on isOpen

  const startCamera = async () => {
    // iOS natif: utiliser le scanner MLKit
    if (Capacitor.getPlatform() === 'ios') {
      try {
        const support = await BarcodeScanner.isSupported();
        if (!support.supported) {
          toast({ title: "Scanner non supporté", description: "Le scanner n'est pas supporté sur cet appareil.", variant: "destructive" });
          setHasPermission(false);
          return;
        }

        const perm = await BarcodeScanner.requestPermissions();
        if (perm.camera !== 'granted') {
          toast({ title: "Autorisation requise", description: "Veuillez autoriser l'accès à la caméra.", variant: "destructive" });
          setHasPermission(false);
          return;
        }

        setHasPermission(true);
        setIsScanning(true);

        const { barcodes } = await BarcodeScanner.scan();
        const value = barcodes?.[0]?.rawValue?.trim();
        if (value) {
          handleScanResult(value);
        } else {
          setIsScanning(false);
        }
      } catch (err) {
        console.error('Erreur scanner iOS:', err);
        toast({ title: "Erreur scanner", description: "Impossible de démarrer le scanner.", variant: "destructive" });
        setHasPermission(false);
      }
      return;
    }

    // Utiliser l'API web pour le navigateur
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        // Propriétés nécessaires pour Safari mobile
        videoRef.current.playsInline = true;
        videoRef.current.muted = true;
        videoRef.current.autoplay = true;
        
        // Attendre que la vidéo soit prête
        videoRef.current.onloadedmetadata = () => {
          setHasPermission(true);
          setIsScanning(true);
          startScanning();
        };
        
        // Fallback
        setTimeout(() => {
          setHasPermission(true);
          setIsScanning(true);
          startScanning();
        }, 2000);
      }
      
    } catch (error) {
      console.error("Erreur lors de l'accès à la caméra:", error);
      
      let errorMessage = t('scanner.camera_error_default');
      if (error.name === 'NotAllowedError') {
        errorMessage = t('scanner.camera_error_permission');
      } else if (error.name === 'NotFoundError') {
        errorMessage = t('scanner.camera_error_not_found');
      }
      
      toast({
        title: t('scanner.camera_error_title'),
        description: errorMessage,
        variant: "destructive",
      });
      
      setHasPermission(false);
    }
  };

  const startScanning = () => {
    intervalRef.current = setInterval(() => {
      scanQRCode();
    }, 300); // Scan toutes les 300ms pour éviter de bloquer l'UI
  };

  const scanQRCode = () => {
    if (!videoRef.current || !canvasRef.current || scanned) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context || video.videoWidth === 0 || video.videoHeight === 0) return;

    // Utiliser requestAnimationFrame pour éviter de bloquer le thread principal
    requestAnimationFrame(() => {
      try {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        if (canvas.width === 0 || canvas.height === 0) return;

        context.drawImage(video, 0, 0);

        let imageData: ImageData | undefined;
        try {
          imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        } catch (e) {
          // Peut arriver si la vidéo n'est pas encore prête
          return;
        }
        if (!imageData) return;
        
        // Utilisation de jsQR avec une seule tentative pour améliorer la performance
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: "dontInvert",
        });

        if (code) {
          // Nettoyer les données scannées
          const cleanedData = code.data.trim().replace(/[\r\n\t\s]/g, '');
          
          // Ne pas arrêter la caméra ici. On valide d'abord le format.
          handleScanResult(cleanedData, true);
        }
      } catch (err) {
        // Ignore et continuer
        return;
      }
    });
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
        title: t('scanner.photo_taken'),
        description: t('scanner.manual_prompt'),
      });
      
    } catch (error) {
      console.error("Erreur lors de la prise de photo:", error);
      toast({
        title: t('common.error'),
        description: t('scanner.photo_error'),
        variant: "destructive",
      });
    }
  };

  const stopCamera = () => {
    if (!isScanning && !intervalRef.current) return; // Early exit if already stopped
    
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
      handleScanResult(manualInput.trim(), false);
    }
  };

  const handleScanResult = async (data: string, silentInvalid: boolean = true) => {
    if (scanned) return;

    try {
      // Valider rapidement le format attendu du code
      const isValidFormat = /^PARTNER_[A-Z0-9]{4,}$/i.test(data);
      if (!isValidFormat) {
        // Si le code est invalide et qu'on vient du champ manuel, on affiche un toast
        if (!silentInvalid) {
          toast({
            title: "Code invalide",
            description: "Ce n'est pas un code partenaire Bali'Pass valide.",
            variant: "destructive",
          });
        }
        // Ne pas bloquer le scanner
        return;
      }

      // Montrer l'état de validation et éviter les scans concurrents
      setScanned(true);

      // Créer un timeout pour la requête (5 secondes)
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Timeout')), 5000)
      );

      // Chercher le partenaire dans la base de données avec timeout
      const queryPromise = supabase
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

      const { data: partner, error } = await Promise.race([queryPromise, timeoutPromise]) as any;

      if (error || !partner) {
        if (!silentInvalid) {
          toast({
            title: "Partenaire introuvable",
            description: "Ce code ne correspond à aucun partenaire actif.",
            variant: "destructive",
          });
        }
        setScanned(false); // Reprendre le scan
        return;
      }

      // Vérifier les offres actives
      const activeOffers = partner.offers?.filter((offer: any) => offer.is_active) || [];
      
      if (activeOffers.length === 0) {
        if (!silentInvalid) {
          toast({
            title: "Aucune offre disponible",
            description: "Ce partenaire n'a actuellement aucune offre active.",
            variant: "destructive",
          });
        }
        setScanned(false); // Reprendre le scan
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
      if (!silentInvalid) {
        toast({
          title: "Erreur",
          description: "Une erreur s'est produite lors de la validation.",
          variant: "destructive",
        });
      }
      setScanned(false);
    }
  };

  return (
    <>
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent hideCloseButton className="max-w-full max-h-full w-full h-full p-0 border-0 rounded-none">
        <VisuallyHidden>
          <DialogTitle>{t('action.scan_qr')}</DialogTitle>
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
                {t('scanner.init_title')}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {t('scanner.init_desc')}
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
              <h3 className="text-xl font-bold mb-3 text-foreground">{t('scanner.unavailable_title')}</h3>
              <p className="text-muted-foreground mb-6 text-sm">
                {t('scanner.manual_title')}
              </p>
              
              <div className="space-y-4">
                <div className="relative">
                  <input
                    type="text"
                    value={manualInput}
                    onChange={(e) => setManualInput(e.target.value)}
                    placeholder={t('scanner.manual_placeholder')}
                    className="w-full p-4 bg-background/60 border border-border/60 rounded-2xl text-center font-mono text-sm focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                  />
                </div>
                <div className="flex gap-3">
                  <Button 
                    onClick={handleManualSubmit}
                    disabled={!manualInput.trim()}
                    className="flex-1 h-12 rounded-2xl bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg transition-all duration-300"
                  >
                    {t('common.confirm')}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={onClose}
                    className="h-12 px-6 rounded-2xl border-border/60 hover:bg-muted/50 transition-all duration-300"
                  >
                    {t('common.close')}
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
                  <h3 className="text-white text-2xl font-bold mb-3">{t('action.scan_qr')}</h3>
                  <p className="text-white/80 mb-8 text-lg leading-relaxed">
                    {t('scanner.capture_instruction')}
                  </p>
                  <Button 
                    onClick={takeNativePhoto}
                    size="lg"
                    className="h-14 px-8 rounded-2xl bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-xl text-lg font-semibold transition-all duration-300 transform hover:scale-105"
                  >
                    <Camera className="w-6 h-6 mr-3" />
                    {t('scanner.capture_button')}
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
                    <p className="text-white font-medium">{t('scanner.point_instruction')}</p>
                  </div>
                </div>
                
                {/* Statut de scan */}
                {isScanning && (
                  <div className="text-center">
                    <div className="inline-flex items-center gap-2 bg-primary/20 backdrop-blur-sm px-4 py-2 rounded-full border border-primary/30">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full animate-ping"></div>
                      <p className="text-primary text-sm font-medium">{t('scanner.searching')}</p>
                    </div>
                  </div>
                )}
                
                {/* Zone de saisie manuelle moderne */}
                <div className="bg-black/70 backdrop-blur-md p-6 rounded-3xl border border-white/20 shadow-2xl">
                  <div className="text-center mb-4">
                    <p className="text-white/90 text-sm font-medium">{t('scanner.manual_or')}</p>
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
                      {t('common.confirm')}
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
                <p className="text-white text-center mb-4 font-medium">{t('scanner.manual_or')}</p>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={manualInput}
                    onChange={(e) => setManualInput(e.target.value)}
                    placeholder={t('scanner.manual_placeholder')}
                    className="flex-1 px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl text-white placeholder-white/50 font-mono focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                  />
                  <Button 
                    onClick={handleManualSubmit}
                    disabled={!manualInput.trim()}
                    className="h-12 px-6 rounded-2xl bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 disabled:opacity-50 font-semibold shadow-lg transition-all duration-300"
                  >
                    {t('common.confirm')}
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
                  <p className="text-lg font-semibold text-foreground">{t('scanner.validating')}</p>
                  <p className="text-sm text-muted-foreground mt-2">{t('scanner.validating_desc')}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>

    {/* Modal Trial Expiré */}
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
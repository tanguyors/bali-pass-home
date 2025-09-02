import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { QrCode, MapPin, Compass } from "lucide-react";
import baliHeroImage from "@/assets/bali-hero.jpg";
import { User } from "@supabase/supabase-js";
import { QRScanner } from "@/components/QRScanner";
import { PartnerOffersModal } from "@/components/PartnerOffersModal";
import { useTranslation } from "@/hooks/useTranslation";

interface HeroWithPassProps {
  user: User;
}

export function HeroWithPass({ user }: HeroWithPassProps) {
  const { t } = useTranslation();
  const firstName = user.user_metadata?.first_name || user.email?.split('@')[0] || 'Utilisateur';
  const navigate = useNavigate();
  const [showScanner, setShowScanner] = useState(false);
  const [scannedPartner, setScannedPartner] = useState<any>(null);

  const handleScanQR = () => {
    setShowScanner(true);
  };

  const handleNearMe = () => {
    // TODO: Implement geolocation and nearby offers
    navigate("/map");
  };

  const handleAllOffers = () => {
    navigate("/explorer");
  };

  const handleScanSuccess = (partnerData: any) => {
    setScannedPartner(partnerData);
  };

  return (
    <>
      <div className="relative h-[45vh] min-h-80 overflow-hidden rounded-b-3xl">
        {/* Background image */}
        <img 
          src={baliHeroImage}
          alt="Bali Paradise"
          className="absolute inset-0 w-full h-full object-cover"
        />
        
        {/* Bottom gradient overlay only */}
        <div className="absolute inset-0 gradient-overlay-bottom" />
        
        {/* Content positioned at bottom */}
        <div className="relative z-10 flex flex-col justify-end h-full p-6 text-white">
          {/* Welcome badge */}
          <div className="flex flex-wrap gap-2 mb-8">
            <div className="bg-primary/90 backdrop-blur-sm rounded-full px-3 py-1.5 text-xs font-medium">
              {t('pass.active')} ✓
            </div>
          </div>
          
          {/* Personalized headlines */}
          <h1 className="text-mobile-hero font-bold mb-3 text-shadow-strong">
            {t('hero.welcome_back')} {firstName} !
          </h1>
          <p className="text-mobile-subtitle mb-6 opacity-95 text-shadow">
            {t('hero.scan_and_save')}
          </p>
          
          {/* Action Buttons */}
          <div className="space-y-3">
            <Button 
              variant="hero" 
              className="w-full flex items-center justify-center gap-3"
              onClick={handleScanQR}
            >
              <QrCode className="w-5 h-5" />
              {t('action.scan_qr')}
            </Button>
            
            <div className="grid grid-cols-2 gap-3">
              <Button 
                variant="heroSecondary" 
                className="text-shadow text-sm"
                onClick={handleNearMe}
              >
                <MapPin className="w-4 h-4" />
                {t('explorer.near_me')}
              </Button>
              
              <Button 
                variant="heroSecondary" 
                className="text-shadow text-sm"
                onClick={handleAllOffers}
              >
                <Compass className="w-4 h-4" />
                {t('explorer.all_offers')}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <QRScanner
        isOpen={showScanner}
        onClose={() => setShowScanner(false)}
        onScanSuccess={handleScanSuccess}
      />

      <PartnerOffersModal
        isOpen={!!scannedPartner}
        onClose={() => setScannedPartner(null)}
        partner={scannedPartner}
      />
    </>
  );
}
import { Button } from "@/components/ui/button";
import { QrCode, MapPin, Compass } from "lucide-react";
import baliHeroImage from "@/assets/bali-hero.jpg";
import { User } from "@supabase/supabase-js";

interface HeroWithPassProps {
  user: User;
}

export function HeroWithPass({ user }: HeroWithPassProps) {
  const firstName = user.user_metadata?.first_name || user.email?.split('@')[0] || 'Utilisateur';

  const handleScanQR = () => {
    console.log("Opening QR scanner...");
  };

  const handleNearMe = () => {
    console.log("Finding nearby offers...");
  };

  const handleAllOffers = () => {
    console.log("Showing all offers...");
  };

  return (
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
            Pass Actif ✓
          </div>
        </div>
        
        {/* Personalized headlines */}
        <h1 className="text-mobile-hero font-bold mb-3 text-shadow-strong">
          Bienvenue {firstName} !
        </h1>
        <p className="text-mobile-subtitle mb-6 opacity-95 text-shadow">
          Ton pass est actif. Découvre les offres autour de toi.
        </p>
        
        {/* Action Buttons */}
        <div className="space-y-3">
          <Button 
            variant="hero" 
            className="w-full flex items-center justify-center gap-3"
            onClick={handleScanQR}
          >
            <QrCode className="w-5 h-5" />
            Scanner un partenaire
          </Button>
          
          <div className="grid grid-cols-2 gap-3">
            <Button 
              variant="heroSecondary" 
              className="text-shadow text-sm"
              onClick={handleNearMe}
            >
              <MapPin className="w-4 h-4" />
              Autour de moi
            </Button>
            
            <Button 
              variant="heroSecondary" 
              className="text-shadow text-sm"
              onClick={handleAllOffers}
            >
              <Compass className="w-4 h-4" />
              Toutes les offres
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
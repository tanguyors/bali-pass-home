import { Button } from "@/components/ui/button";
import { usePassSettings } from "@/hooks/usePassSettings";
import { ArrowRight, CreditCard } from "lucide-react";
import baliHeroImage from "@/assets/bali-hero.jpg";

export function BaliPassHero() {
  const { settings: passSettings } = usePassSettings();

  const getSettingValue = (key: string, defaultValue: string = '') => {
    const setting = passSettings.find(s => s.setting_key === key);
    return setting ? setting.setting_value : defaultValue;
  };

  const ctaText = getSettingValue('cta_text', "Obtenir le Bali'Pass");

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
        {/* Top chips */}
        <div className="flex flex-wrap gap-2 mb-8">
          {getSettingValue('validity_period') && (
            <div className="bg-white/25 backdrop-blur-sm rounded-full px-3 py-1.5 text-xs font-medium">
              {getSettingValue('validity_period')}
            </div>
          )}
          {getSettingValue('partner_count') && (
            <div className="bg-white/25 backdrop-blur-sm rounded-full px-3 py-1.5 text-xs font-medium">
              {getSettingValue('partner_count')} Partenaires
            </div>
          )}
          {getSettingValue('security_badge') && (
            <div className="bg-white/25 backdrop-blur-sm rounded-full px-3 py-1.5 text-xs font-medium">
              {getSettingValue('security_badge')}
            </div>
          )}
        </div>
        
        {/* Headlines with text shadow */}
        <h1 className="text-mobile-hero font-bold mb-3 text-shadow-strong">
          Explore More. Spend Less.
        </h1>
        <p className="text-mobile-subtitle mb-6 opacity-95 text-shadow">
          Profite d'avantages exclusifs à Bali.
        </p>
        
        {/* CTA Buttons */}
        <div className="space-y-4">
          <Button variant="hero" className="w-full flex items-center justify-center gap-3">
            <CreditCard className="w-5 h-5" />
            {ctaText}
          </Button>
          
          <Button variant="heroSecondary" className="text-shadow">
            Voir les offres
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
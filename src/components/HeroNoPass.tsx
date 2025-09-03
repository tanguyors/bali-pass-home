import { Button } from "@/components/ui/button";
import { CreditCard, ArrowRight } from "lucide-react";
import baliHeroImage from "@/assets/bali-hero.jpg";
import { useLanguage } from "@/contexts/LanguageContext";
import { logger } from "@/lib/logger";

interface PassSettings {
  setting_key: string;
  setting_value: string;
}

interface HeroNoPassProps {
  passSettings: PassSettings[];
}

export function HeroNoPass({ passSettings }: HeroNoPassProps) {
  const { t } = useLanguage();

  const getSettingValue = (key: string, defaultValue: string = '') => {
    const setting = passSettings.find(s => s.setting_key === key);
    return setting ? setting.setting_value : defaultValue;
  };

  const handleBuyPass = () => {
    window.open('https://passbali.com/', '_blank');
  };

  const handleViewOffers = () => {
    // TODO: Navigate to offers
    logger.debug("Navigating to offers");
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
        {/* Top chips without pricing for connected users */}
        <div className="flex flex-wrap gap-2 mb-8">
          {getSettingValue('validity_period') && (
            <div className="bg-white/25 backdrop-blur-sm rounded-full px-3 py-1.5 text-xs font-medium">
              {getSettingValue('validity_period')}
            </div>
          )}
          {getSettingValue('partner_count') && (
            <div className="bg-white/25 backdrop-blur-sm rounded-full px-3 py-1.5 text-xs font-medium">
              {getSettingValue('partner_count')} {t('hero.partners')}
            </div>
          )}
        </div>
        
        {/* Headlines with text shadow */}
        <h1 className="text-mobile-hero font-bold mb-3 text-shadow-strong">
          {t('pass.get_pass')}
        </h1>
        <p className="text-mobile-subtitle mb-6 opacity-95 text-shadow">
          {t('pass.exclusive_discounts')}
        </p>
        
        {/* CTA Buttons */}
        <div className="space-y-4">
          <Button 
            variant="hero" 
            className="w-full flex items-center justify-center gap-3"
            onClick={handleBuyPass}
          >
            <CreditCard className="w-5 h-5" />
            {t('pass.get_pass')}
          </Button>
          
          <Button 
            variant="heroSecondary" 
            className="text-shadow"
            onClick={handleViewOffers}
          >
            {t('pass.discover_offers')}
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
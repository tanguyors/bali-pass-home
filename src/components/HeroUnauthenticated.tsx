import { Button } from "@/components/ui/button";
import { usePassSettings } from "@/hooks/usePassSettings";
import { CreditCard } from "lucide-react";
import baliHeroImage from "@/assets/bali-hero.jpg";
import { useNavigate } from "react-router-dom";
import { LanguageSelector } from "@/components/LanguageSelector";
import { useLanguage } from "@/contexts/LanguageContext";

export function HeroUnauthenticated() {
  const { t } = useLanguage();
  const { settings: passSettings } = usePassSettings();
  const navigate = useNavigate();

  const getSettingValue = (key: string, defaultValue: string = '') => {
    const setting = passSettings.find(s => s.setting_key === key);
    return setting ? setting.setting_value : defaultValue;
  };

  const handleGetPass = () => {
    window.open('https://passbali.com/', '_blank');
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
      
      {/* Language Selector - Top Right */}
      <div className="absolute top-4 right-4 z-20">
        <LanguageSelector variant="mobile" className="bg-white/10 backdrop-blur-md border-white/20 text-white" />
      </div>
      
      {/* Content positioned center */}
      <div className="relative z-10 flex flex-col justify-center items-center h-full p-6 text-white text-center">
        {/* Top chips */}
        <div className="flex flex-wrap justify-center gap-2 mb-6">
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
          {getSettingValue('security_badge') && (
            <div className="bg-white/25 backdrop-blur-sm rounded-full px-3 py-1.5 text-xs font-medium">
              {getSettingValue('security_badge')}
            </div>
          )}
        </div>
        
        {/* Headlines with text shadow */}
        <h1 className="text-mobile-hero font-bold mb-3 text-shadow-strong">
          {t('hero.welcome_to_bali')}
        </h1>
        <p className="text-mobile-subtitle mb-8 opacity-95 text-shadow">
          {t('hero.exclusive_discounts')}
        </p>
        
        {/* CTA Button */}
        <div className="w-full max-w-sm">
            <Button 
            variant="hero" 
            className="w-full flex items-center justify-center gap-3"
            onClick={handleGetPass}
          >
            <CreditCard className="w-5 h-5" />
            {t('hero.get_your_pass')}
          </Button>
        </div>
      </div>
    </div>
  );
}
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { CreditCard } from "lucide-react";
import baliHeroImage from "@/assets/bali-hero.jpg";
import { useNavigate } from "react-router-dom";

interface PassSettings {
  setting_key: string;
  setting_value: string;
}

export function HeroUnauthenticated() {
  const [passSettings, setPassSettings] = useState<PassSettings[]>([]);
  const [ctaText, setCtaText] = useState("Obtenir le Bali'Pass");
  const navigate = useNavigate();

  useEffect(() => {
    fetchPassSettings();
  }, []);

  const fetchPassSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('pass_settings')
        .select('setting_key, setting_value');
      
      if (error) {
        console.error('Error fetching pass settings:', error);
        return;
      }
      
      if (data) {
        setPassSettings(data);
        const ctaSetting = data.find(setting => setting.setting_key === 'cta_text');
        if (ctaSetting) {
          setCtaText(ctaSetting.setting_value);
        }
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const getSettingValue = (key: string, defaultValue: string = '') => {
    const setting = passSettings.find(s => s.setting_key === key);
    return setting ? setting.setting_value : defaultValue;
  };

  const handleGetPass = () => {
    navigate('/auth');
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
        
        {/* CTA Button */}
        <div className="space-y-4">
          <Button 
            variant="hero" 
            className="w-full flex items-center justify-center gap-3"
            onClick={handleGetPass}
          >
            <CreditCard className="w-5 h-5" />
            {ctaText}
          </Button>
        </div>
      </div>
    </div>
  );
}
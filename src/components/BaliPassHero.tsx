import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import baliHeroImage from "@/assets/bali-hero.jpg";

interface PassSettings {
  setting_key: string;
  setting_value: string;
}

export function BaliPassHero() {
  const [passSettings, setPassSettings] = useState<PassSettings[]>([]);
  const [ctaText, setCtaText] = useState("Obtenir le Bali'Pass");

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

  return (
    <div className="relative h-64 overflow-hidden rounded-b-3xl">
      {/* Background image */}
      <img 
        src={baliHeroImage}
        alt="Bali Paradise"
        className="absolute inset-0 w-full h-full object-cover"
      />
      
      {/* Overlay */}
      <div className="absolute inset-0 gradient-overlay" />
      
      {/* Content */}
      <div className="relative z-10 flex flex-col justify-end h-full p-4 text-white">
        {/* Top chips */}
        <div className="flex flex-wrap gap-2 mb-6">
          {getSettingValue('validity_period') && (
            <div className="bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-medium">
              {getSettingValue('validity_period')}
            </div>
          )}
          {getSettingValue('partner_count') && (
            <div className="bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-medium">
              {getSettingValue('partner_count')} Partenaires
            </div>
          )}
          {getSettingValue('security_badge') && (
            <div className="bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-medium">
              {getSettingValue('security_badge')}
            </div>
          )}
        </div>
        
        {/* Headlines */}
        <h1 className="text-mobile-hero font-bold mb-2">
          Explore More. Spend Less.
        </h1>
        <p className="text-mobile-subtitle mb-4 opacity-90">
          Profite d'avantages exclusifs à Bali.
        </p>
        
        {/* CTA Buttons */}
        <div className="space-y-3">
          <Button variant="hero" className="w-full h-12 text-base">
            {ctaText}
          </Button>
          
          <button className="text-white/90 text-sm underline underline-offset-2 tap-target">
            Voir les offres
          </button>
        </div>
      </div>
    </div>
  );
}
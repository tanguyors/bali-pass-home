import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface PricingData {
  price?: string;
  max_savings?: string;
  availability_status?: string;
}

export function PricingHighlight() {
  const [pricingData, setPricingData] = useState<PricingData>({});

  useEffect(() => {
    fetchPricingData();
  }, []);

  const fetchPricingData = async () => {
    try {
      const { data, error } = await supabase
        .from('pass_settings')
        .select('setting_key, setting_value')
        .in('setting_key', ['pass_price', 'max_savings', 'availability_status']);
      
      if (error) {
        console.error('Error fetching pricing data:', error);
        return;
      }
      
      if (data) {
        const pricing: PricingData = {};
        data.forEach(setting => {
          switch (setting.setting_key) {
            case 'pass_price':
              pricing.price = setting.setting_value;
              break;
            case 'max_savings':
              pricing.max_savings = setting.setting_value;
              break;
            case 'availability_status':
              pricing.availability_status = setting.setting_value;
              break;
          }
        });
        setPricingData(pricing);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="mx-4 -mt-6 relative z-20">
      <div className="bg-card rounded-3xl p-6 shadow-bali">
        <div className="flex items-center justify-between">
          {/* Left column - Price */}
          <div className="flex-1">
            <p className="text-sm text-muted-foreground mb-1">Vous payez</p>
            <p className="text-2xl font-bold text-primary">
              {pricingData.price || "Prix à venir"}
            </p>
          </div>
          
          {/* Right column - Savings */}
          {pricingData.max_savings && (
            <div className="flex-1 text-right">
              <p className="text-sm text-muted-foreground mb-1">Vous économisez</p>
              <p className="text-2xl font-bold text-coral">
                {pricingData.max_savings}
              </p>
            </div>
          )}
        </div>
        
        {/* Availability chip */}
        {pricingData.availability_status && (
          <div className="mt-4 flex justify-center">
            <div className="bg-primary/10 text-primary text-xs font-medium px-3 py-1 rounded-full">
              {pricingData.availability_status}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { DollarSign, Gift } from "lucide-react";

interface PricingData {
  price?: string;
  max_savings?: string;
  currency?: string;
  availability_status?: string;
}

import { useTranslation } from "@/hooks/useTranslation";

export function PricingHighlight() {
  const { t } = useTranslation();
  const [pricingData, setPricingData] = useState<PricingData>({});

  const formatPrice = (cents: string, currency: string = 'usd') => {
    const value = parseInt(cents) / 100;
    const currencySymbol = currency === 'usd' ? '$' : '€';
    return `${currencySymbol}${value.toFixed(2)}`;
  };

  const formatSavings = (cents: string, currency: string = 'usd') => {
    const value = parseInt(cents) / 100;
    const currencySymbol = currency === 'usd' ? '$' : '€';
    return `${currencySymbol}${value.toLocaleString()}`;
  };

  useEffect(() => {
    fetchPricingData();
  }, []);

  const fetchPricingData = async () => {
    try {
      const { data, error } = await supabase
        .from('pass_settings')
        .select('setting_key, setting_value')
        .in('setting_key', ['pass_price', 'savings_amount', 'pass_currency', 'availability_status']);
      
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
            case 'savings_amount':
              pricing.max_savings = setting.setting_value;
              break;
            case 'pass_currency':
              pricing.currency = setting.setting_value;
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
        <div className="flex items-center">
          {/* Left column - Price */}
          <div className="flex-1 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-1">
                {t('pricing.you_pay')}
              </p>
              <p className="text-xl font-bold text-foreground">
                {pricingData.price ? formatPrice(pricingData.price, pricingData.currency) : "Prix à venir"}
              </p>
            </div>
          </div>
          
          {/* Vertical separator */}
          {pricingData.max_savings && (
            <>
              <div className="w-px h-12 bg-border mx-4"></div>
              
              {/* Right column - Savings */}
              <div className="flex-1 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-coral/10 flex items-center justify-center">
                  <Gift className="w-5 h-5 text-coral" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-1">
                    {t('pricing.you_save')}
                  </p>
                  <p className="text-xl font-bold text-coral">
                    {pricingData.max_savings ? formatSavings(pricingData.max_savings, pricingData.currency) : "Économies à venir"}
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
        
        {/* Availability chip */}
        {pricingData.availability_status && (
          <div className="mt-5 pt-4 border-t border-border/50 flex justify-center">
            <div className="bg-primary/10 text-primary text-xs font-semibold px-4 py-2 rounded-full">
              {pricingData.availability_status}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
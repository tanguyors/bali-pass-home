import { useLanguage } from "@/contexts/LanguageContext";

export function PricingHighlight() {
  const { t } = useLanguage();

  return (
    <div className="mx-4 -mt-6 relative z-20">
      <div className="bg-card rounded-3xl p-6 shadow-bali">
        <div className="flex items-center">
          {/* Left column - Trial Price */}
          <div className="flex-1 text-center">
            <p className="text-sm text-primary font-semibold uppercase tracking-wide mb-2">
              {t('pricing.try_now')}
            </p>
            <p className="text-4xl font-bold text-white mb-1">
              $0
            </p>
            <p className="text-sm text-primary font-medium">
              {t('pricing.for_7_days')}
            </p>
          </div>
          
          {/* Vertical separator */}
          <div className="w-px h-20 bg-border mx-4"></div>
          
          {/* Right column - Potential Savings */}
          <div className="flex-1 text-center">
            <p className="text-sm text-white font-semibold uppercase tracking-wide mb-2">
              {t('pricing.save_up_to')}
            </p>
            <p className="text-4xl font-bold text-coral mb-1">
              $1,000.00
            </p>
            <p className="text-sm text-white font-medium">
              {t('pricing.in_cumulative_savings')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
import { useLanguage } from "@/contexts/LanguageContext";

export function PricingHighlight() {
  const { t } = useLanguage();

  return (
    <div className="mx-4 -mt-6 relative z-20">
      <div className="bg-card rounded-3xl p-6 shadow-bali">
        <div className="flex items-center">
          {/* Left column - Monthly Price */}
          <div className="flex-1 text-center">
            <p className="text-sm text-primary font-semibold uppercase tracking-wide mb-2">
              {t('pricing.starting_from')}
            </p>
            <p className="text-4xl font-bold text-foreground mb-1">
              $29
            </p>
            <p className="text-sm text-primary font-medium">
              {t('pricing.per_month')}
            </p>
          </div>
          
          {/* Vertical separator */}
          <div className="w-px h-20 bg-border mx-4"></div>
          
          {/* Right column - Potential Savings */}
          <div className="flex-1 text-center">
            <p className="text-sm text-foreground font-semibold uppercase tracking-wide mb-2">
              {t('pricing.save_up_to')}
            </p>
            <p className="text-4xl font-bold text-coral mb-1">
              $2,000
            </p>
            <p className="text-sm text-foreground font-medium">
              {t('pricing.in_cumulative_savings')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
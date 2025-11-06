import { X, CheckCircle, Sparkles } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useState } from "react";

export function TrialExpiredBanner() {
  const { t } = useLanguage();
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="mx-4 mt-4 mb-6 relative animate-in fade-in-50 slide-in-from-top-4 duration-500">
      <div className="bg-gradient-to-br from-primary via-primary to-lagoon rounded-3xl p-1 shadow-bali-4">
        <div className="bg-card rounded-[22px] p-6 relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-lagoon/5 rounded-full blur-3xl"></div>
          
          {/* Close button */}
          <button
            onClick={() => setIsVisible(false)}
            className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors z-10"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Content */}
          <div className="relative z-10">
            {/* Header with icon */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-lagoon flex items-center justify-center flex-shrink-0 shadow-lg">
                <Sparkles className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-foreground mb-1">
                  {t('trial.expired_title')}
                </h3>
                <p className="text-sm text-muted-foreground">
                  Accès à toutes les offres partenaires
                </p>
              </div>
            </div>

            {/* Benefits */}
            <div className="space-y-2 bg-muted/30 rounded-xl p-4">
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                <span className="text-foreground">Accès à toutes les offres disponibles</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                <span className="text-foreground">{t('trial.benefit_2')}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                <span className="text-foreground">{t('trial.benefit_3')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

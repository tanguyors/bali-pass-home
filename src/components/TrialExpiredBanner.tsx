import { Button } from "@/components/ui/button";
import { Sparkles, X } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { openExternalUrl } from "@/lib/browser";
import { useState } from "react";

export function TrialExpiredBanner() {
  const { t } = useLanguage();
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="mx-4 mt-4 relative">
      <div className="bg-gradient-to-r from-primary to-lagoon rounded-2xl p-6 shadow-lg text-white relative overflow-hidden">
        {/* Close button */}
        <button
          onClick={() => setIsVisible(false)}
          className="absolute top-3 right-3 text-white/80 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icon */}
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-6 h-6" />
          </div>

          {/* Content */}
          <div className="flex-1">
            <h3 className="text-xl font-bold mb-2">
              {t('trial.expired_title')}
            </h3>
            <p className="text-white/90 text-sm mb-4">
              {t('trial.expired_description')}
            </p>

            {/* CTA Button */}
            <Button
              onClick={() => openExternalUrl('https://passbali.com/')}
              className="bg-white text-primary hover:bg-white/90 font-semibold shadow-md"
              size="sm"
            >
              {t('trial.buy_pass_now')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

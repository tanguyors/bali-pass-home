import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Gift, Sparkles, CheckCircle, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

export function TrialPromoBanner() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <div className="mx-4 mt-6">
      <Card className="relative overflow-hidden border-2 border-primary/20 shadow-lg">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-secondary/5 rounded-full translate-y-1/2 -translate-x-1/2" />
        
        <div className="relative p-5">
          {/* Badge */}
          <div className="flex items-center gap-2 mb-3">
            <Badge className="bg-gradient-to-r from-primary to-primary/80 text-white border-0 px-3 py-1">
              <Gift className="w-3 h-3 mr-1" />
              {t('trial_promo.badge')}
            </Badge>
            <Sparkles className="w-4 h-4 text-primary animate-pulse" />
          </div>

          {/* Title */}
          <h3 className="text-lg font-bold text-foreground mb-2">
            {t('trial_promo.title')}
          </h3>

          {/* Description */}
          <p className="text-sm text-muted-foreground mb-4">
            {t('trial_promo.description')}
          </p>

          {/* Benefits */}
          <div className="space-y-2 mb-4">
            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
              <span className="text-xs text-foreground">{t('trial_promo.benefit_1')}</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
              <span className="text-xs text-foreground">{t('trial_promo.benefit_2')}</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
              <span className="text-xs text-foreground">{t('trial_promo.benefit_3')}</span>
            </div>
          </div>

          {/* CTA Button */}
          <Button 
            onClick={() => navigate('/auth')}
            className="w-full h-11 font-semibold group"
          >
            {t('trial_promo.cta')}
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>

          {/* Small disclaimer */}
          <p className="text-[10px] text-muted-foreground text-center mt-2">
            {t('trial_promo.disclaimer')}
          </p>
        </div>
      </Card>
    </div>
  );
}

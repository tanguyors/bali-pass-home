import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle, Sparkles } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { openExternalUrl } from "@/lib/browser";
import { usePartnersCount } from "@/hooks/usePartnersCount";
import { useOffersCount } from "@/hooks/useOffersCount";
import { useNavigate } from "react-router-dom";

interface TrialExpiredModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TrialExpiredModal({ isOpen, onClose }: TrialExpiredModalProps) {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { partnersCount } = usePartnersCount();
  const { offersCount } = useOffersCount();

  const handleDiscoverOffers = () => {
    navigate('/explorer');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent hideCloseButton className="sm:max-w-md p-0 gap-0 overflow-hidden border-0 bg-gradient-to-br from-primary/5 via-background to-lagoon/5">
        {/* Header with gradient */}
        <div className="relative bg-gradient-to-br from-primary to-lagoon pt-12 pb-8 px-6 text-center">
          {/* Decorative blobs */}
          <div className="absolute top-0 left-0 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
          
          {/* Icon */}
          <div className="relative mx-auto mb-4 w-20 h-20 rounded-3xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-2xl">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          
          {/* Title */}
          <h2 className="text-2xl font-bold text-white mb-2">
            {t('trial.expired_title')}
          </h2>
          <p className="text-white/90 text-sm max-w-xs mx-auto">
            {t('trial.expired_description')}
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Benefits card */}
          <div className="bg-card border border-border rounded-2xl p-5 space-y-3 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-4 h-4 text-primary" />
              </div>
              <p className="text-sm text-foreground flex-1">
                {t('trial.benefit_1')} {offersCount > 0 && `(${offersCount})`}
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-4 h-4 text-primary" />
              </div>
              <p className="text-sm text-foreground flex-1">
                {t('trial.benefit_2')} {partnersCount > 0 && `chez +${partnersCount} partenaires`}
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-4 h-4 text-primary" />
              </div>
              <p className="text-sm text-foreground flex-1">
                {t('trial.benefit_3')}
              </p>
            </div>
          </div>

        </div>
      </DialogContent>
    </Dialog>
  );
}

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle, Sparkles } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { openExternalUrl } from "@/lib/browser";

interface TrialExpiredModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TrialExpiredModal({ isOpen, onClose }: TrialExpiredModalProps) {
  const { t } = useLanguage();

  const handleBuyPass = () => {
    openExternalUrl('https://passbali.com/');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-primary" />
          </div>
          <DialogTitle className="text-2xl font-bold">
            {t('trial.expired_title')}
          </DialogTitle>
          <DialogDescription className="text-base pt-2">
            {t('trial.expired_description')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="bg-muted/50 rounded-lg p-4 space-y-3">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <p className="text-sm text-foreground">
                {t('trial.benefit_1')}
              </p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <p className="text-sm text-foreground">
                {t('trial.benefit_2')}
              </p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <p className="text-sm text-foreground">
                {t('trial.benefit_3')}
              </p>
            </div>
          </div>

          <Button 
            onClick={handleBuyPass}
            className="w-full h-12 text-base font-semibold"
            size="lg"
          >
            {t('trial.buy_pass_now')}
          </Button>

          <Button 
            onClick={onClose}
            variant="ghost"
            className="w-full"
          >
            {t('trial.maybe_later')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

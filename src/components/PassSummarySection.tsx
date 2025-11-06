import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, CheckCircle, Award } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

interface Pass {
  id: string;
  status: string;
  expires_at: string;
  purchased_at: string;
  qr_token?: string;
}

interface PassSummarySectionProps {
  pass: Pass;
}

export function PassSummarySection({ pass }: PassSummarySectionProps) {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const isExpired = new Date(pass.expires_at) < new Date();

  const handleViewPass = () => {
    navigate('/mon-pass');
  };

  return (
    <div className="mx-4 mt-6">
      <Card className="p-4 gradient-card">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-foreground">{t('pass_summary.my_pass')}</h3>
          </div>
          <div className="flex flex-col gap-1.5 items-end">
            {pass.qr_token?.startsWith('TRIAL_') && (
              <Badge 
                variant="secondary" 
                className="bg-yellow-100 text-yellow-800 border-yellow-300 font-bold text-xs"
              >
                <Award className="w-3 h-3 mr-1" />
                {t('pass.trial_badge')}
              </Badge>
            )}
            <Badge variant={isExpired ? "destructive" : "default"}>
              {isExpired ? t('pass_summary.expired') : t('pass_summary.active')}
            </Badge>
          </div>
        </div>
        
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span>{t('pass_summary.purchased_on')} {formatDate(pass.purchased_at)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span>{t('pass_summary.valid_until')} {formatDate(pass.expires_at)}</span>
          </div>
        </div>
        
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full"
          onClick={handleViewPass}
        >
          {t('pass_summary.view_pass')}
        </Button>
      </Card>
    </div>
  );
}
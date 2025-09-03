import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

interface Pass {
  id: string;
  status: string;
  expires_at: string;
  purchased_at: string;
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
          <Badge variant={isExpired ? "destructive" : "default"}>
            {isExpired ? t('pass_summary.expired') : t('pass_summary.active')}
          </Badge>
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
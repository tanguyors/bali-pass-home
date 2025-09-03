import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

export function AuthButtons() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const handleSignIn = () => {
    navigate('/auth');
  };

  const handleSignUp = () => {
    navigate('/auth');
  };

  return (
    <div className="mx-4 mt-6 space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <Button 
          variant="outline" 
          onClick={handleSignIn}
          className="h-12"
        >
          {t('auth.sign_in')}
        </Button>
        
        <Button 
          variant="default" 
          onClick={handleSignUp}
          className="h-12"
        >
          {t('auth.create_account')}
        </Button>
      </div>
    </div>
  );
}
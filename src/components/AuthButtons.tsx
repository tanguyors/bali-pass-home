import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";

export function AuthButtons() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { user } = useAuth();

  const handleAction = () => {
    if (user) {
      // User is logged in but has no pass, redirect to pass purchase
      window.open('https://passbali.com/', '_blank');
    } else {
      // User is not logged in, go to auth page
      navigate('/auth');
    }
  };

  const handleSignUp = () => {
    window.open('https://passbali.com/auth', '_blank');
  };

  return (
    <div className="mx-4 mt-6 space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <Button 
          variant="outline" 
          onClick={handleAction}
          className="h-12"
        >
          {user ? t('pass.discover_our_pass') : t('auth.sign_in')}
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
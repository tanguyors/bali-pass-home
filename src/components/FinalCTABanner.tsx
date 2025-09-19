import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { openExternalUrl } from "@/lib/browser";

export function FinalCTABanner() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { user } = useAuth();

  const handleAction = () => {
    if (user) {
      // User is logged in but has no pass, redirect to pass purchase
      openExternalUrl('https://passbali.com/');
    } else {
      // User is not logged in, go to auth page
      navigate('/auth');
    }
  };

  return (
    <div className="mt-8 mx-4 mb-8">
      <div className="gradient-tropical rounded-3xl p-6 text-center text-white shadow-bali-4">
        <h2 className="text-xl font-bold mb-2">
          {t('footer.ready_for_bali')}
        </h2>
        <p className="text-sm opacity-90 mb-4">
          {t('footer.discover_exclusive')}
        </p>
        
        <Button 
          variant="pillWhite" 
          className="w-full h-12"
          onClick={handleAction}
        >
          {user ? t('pass.discover_our_pass') : t('auth.sign_in')}
        </Button>
      </div>
    </div>
  );
}
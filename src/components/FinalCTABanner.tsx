import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

export function FinalCTABanner() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const handleGetPass = () => {
    window.open('https://passbali.com/', '_blank');
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
          onClick={handleGetPass}
        >
          {t('pass.get_pass')}
        </Button>
      </div>
    </div>
  );
}
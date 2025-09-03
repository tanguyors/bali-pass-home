import { useState } from "react";
import { QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { QRScanner } from "@/components/QRScanner";
import { PartnerOffersModal } from "@/components/PartnerOffersModal";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";

export function FloatingActionButton() {
  const [showScanner, setShowScanner] = useState(false);
  const [scannedPartner, setScannedPartner] = useState<any>(null);
  const { user, hasActivePass } = useAuth();
  const { t } = useLanguage();

  // Don't render if user is not authenticated or doesn't have active pass
  if (!user || !hasActivePass) {
    return null;
  }

  const handleQRScan = () => {
    setShowScanner(true);
  };

  const handleScanSuccess = (partnerData: any) => {
    setScannedPartner(partnerData);
  };

  return (
    <>
      <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 z-50">
        <Button
          variant="fab"
          onClick={handleQRScan}
          className="relative w-16 h-16 rounded-full shadow-bali-4"
          aria-label={t('action.scan_qr')}
          style={{ position: 'static' }}
        >
          <QrCode className="w-7 h-7" />
        </Button>
      </div>

      <QRScanner
        isOpen={showScanner}
        onClose={() => setShowScanner(false)}
        onScanSuccess={handleScanSuccess}
      />

      <PartnerOffersModal
        isOpen={!!scannedPartner}
        onClose={() => setScannedPartner(null)}
        partner={scannedPartner}
      />
    </>
  );
}
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { QrCode, Heart, Grid3X3, Radar } from "lucide-react";
import { QRScanner } from "@/components/QRScanner";
import { PartnerOffersModal } from "@/components/PartnerOffersModal";
import { useTranslation } from "@/hooks/useTranslation";

interface QuickActionsProps {
  hasActivePass?: boolean;
}

export function QuickActions({ hasActivePass = false }: QuickActionsProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [showScanner, setShowScanner] = useState(false);
  const [scannedPartner, setScannedPartner] = useState<any>(null);

  const handleScanSuccess = (partnerData: any) => {
    setScannedPartner(partnerData);
  };

  const actions = [
    {
      icon: QrCode,
      title: t('action.scan_qr'),
      subtitle: t('toast.scan_qr'),
      gradientClass: "gradient-turquoise",
      iconBgColor: "bg-lagoon",
      iconColor: "text-white",
      animationClass: "animate-pulse-soft",
      action: () => {
        setShowScanner(true);
      }
    },
    {
      icon: Heart,
      title: t('nav.favorites'),
      subtitle: t('favorites.no_favorites'),
      gradientClass: "gradient-coral-soft",
      iconBgColor: "bg-coral",
      iconColor: "text-white",
      animationClass: "",
      action: () => {
        navigate("/favorites");
      }
    },
    {
      icon: Grid3X3,
      title: t('explorer.all_offers'),
      subtitle: t('nav.explorer'),
      gradientClass: "gradient-gold-soft",
      iconBgColor: "bg-gold",
      iconColor: "text-foreground",
      animationClass: "",
      action: () => {
        navigate("/explorer");
      }
    }
  ];

  return (
    <>
      <div className="px-4 mt-6">
        <div className="space-y-3">
          {actions.map((action, index) => (
            <button
              key={index}
              onClick={action.action}
              className={`${action.gradientClass} rounded-full px-5 py-4 flex items-center gap-4 tap-target hover:opacity-80 transition-all duration-200 w-full shadow-bali-2`}
            >
              <div className={`w-12 h-12 rounded-full ${action.iconBgColor} flex items-center justify-center ${action.animationClass} shadow-sm`}>
                <action.icon className={`w-6 h-6 ${action.iconColor}`} />
              </div>
              <div className="flex-1 text-left">
                <h3 className="font-semibold text-foreground text-mobile-body">
                  {action.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {action.subtitle}
                </p>
              </div>
            </button>
          ))}
        </div>
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
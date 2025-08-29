import { QrCode, MapPin, Grid3X3, Radar } from "lucide-react";

interface QuickActionsProps {
  hasActivePass?: boolean;
}

export function QuickActions({ hasActivePass = false }: QuickActionsProps) {
  const actions = [
    {
      icon: QrCode,
      title: "Scanner un partenaire",
      subtitle: "QR code",
      gradientClass: "gradient-turquoise",
      iconBgColor: "bg-lagoon",
      iconColor: "text-white",
      animationClass: "animate-pulse-soft",
      action: () => {
        // Open QR scanner
        console.log("Opening QR scanner");
      }
    },
    {
      icon: Radar,
      title: "Autour de moi",
      subtitle: "Géolocalisation",
      gradientClass: "gradient-coral-soft",
      iconBgColor: "bg-coral",
      iconColor: "text-white",
      animationClass: "animate-radar",
      action: () => {
        // Get geolocation and show nearby offers
        console.log("Getting nearby offers");
      }
    },
    {
      icon: Grid3X3,
      title: "Toutes les offres",
      subtitle: "Explorer",
      gradientClass: "gradient-gold-soft",
      iconBgColor: "bg-gold",
      iconColor: "text-foreground",
      animationClass: "",
      action: () => {
        // Navigate to explore screen
        console.log("Navigate to explore");
      }
    }
  ];

  return (
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
  );
}
import { QrCode, MapPin, Grid3X3 } from "lucide-react";

export function QuickActions() {
  const actions = [
    {
      icon: QrCode,
      title: "Scanner un partenaire",
      subtitle: "QR code",
      bgColor: "bg-lagoon/10",
      iconColor: "text-lagoon",
      action: () => {
        // Open QR scanner
        console.log("Opening QR scanner");
      }
    },
    {
      icon: MapPin,
      title: "Autour de moi",
      subtitle: "Géolocalisation",
      bgColor: "bg-coral/10",
      iconColor: "text-coral",
      action: () => {
        // Get geolocation and show nearby offers
        console.log("Getting nearby offers");
      }
    },
    {
      icon: Grid3X3,
      title: "Toutes les offres",
      subtitle: "Explorer",
      bgColor: "bg-gold/10",
      iconColor: "text-gold",
      action: () => {
        // Navigate to explore screen
        console.log("Navigate to explore");
      }
    }
  ];

  return (
    <div className="px-4 mt-6">
      <div className="grid grid-cols-1 gap-3">
        {actions.map((action, index) => (
          <button
            key={index}
            onClick={action.action}
            className={`bg-card rounded-2xl p-4 flex items-center gap-4 tap-target hover:opacity-80 transition-opacity shadow-bali-2`}
          >
            <div className={`w-12 h-12 rounded-xl ${action.bgColor} flex items-center justify-center`}>
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
import { Shield, Clock, CheckCircle } from "lucide-react";

export function ReassuranceSection() {
  const reassuranceItems = [
    {
      icon: Shield,
      emoji: "🔒",
      title: "Paiement sécurisé",
      bgColor: "bg-primary/10",
      iconColor: "text-primary"
    },
    {
      icon: Clock,
      emoji: "⏳",
      title: "Valide 12 mois",
      bgColor: "bg-lagoon/10",
      iconColor: "text-lagoon"
    },
    {
      icon: CheckCircle,
      emoji: "✅",
      title: "Partenaires vérifiés",
      bgColor: "bg-coral/10",
      iconColor: "text-coral"
    }
  ];

  return (
    <div className="mt-8 px-4">
      <div className="flex items-center justify-center gap-8">
        {reassuranceItems.map((item, index) => (
          <div
            key={index}
            className="flex flex-col items-center text-center max-w-20"
          >
            {/* Circular Icon */}
            <div className={`w-16 h-16 rounded-full ${item.bgColor} flex items-center justify-center mb-3 shadow-bali-2`}>
              <span className="text-2xl" role="img" aria-label={item.title}>
                {item.emoji}
              </span>
            </div>
            
            {/* Label */}
            <p className="text-xs font-semibold text-foreground leading-tight">
              {item.title}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
import { Shield, Clock, CheckCircle } from "lucide-react";

export function ReassuranceSection() {
  const reassuranceItems = [
    {
      icon: Shield,
      title: "Paiement sécurisé",
      subtitle: "SSL & crypté"
    },
    {
      icon: Clock,
      title: "Valide 12 mois",
      subtitle: "Dès l'activation"
    },
    {
      icon: CheckCircle,
      title: "Partenaires vérifiés",
      subtitle: "Qualité garantie"
    }
  ];

  return (
    <div className="mt-8 px-4">
      <div className="grid grid-cols-3 gap-3">
        {reassuranceItems.map((item, index) => (
          <div
            key={index}
            className="bg-card rounded-2xl p-3 text-center shadow-sm"
          >
            <div className="w-8 h-8 mx-auto mb-2 bg-primary/10 rounded-lg flex items-center justify-center">
              <item.icon className="w-4 h-4 text-primary" />
            </div>
            <h3 className="text-xs font-semibold text-foreground mb-1">
              {item.title}
            </h3>
            <p className="text-xs text-muted-foreground">
              {item.subtitle}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
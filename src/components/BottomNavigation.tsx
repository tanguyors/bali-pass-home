import { Home, Search, Map, CreditCard, User } from "lucide-react";

export function BottomNavigation() {
  const navItems = [
    { icon: Home, label: "Accueil", active: true },
    { icon: Search, label: "Explorer", active: false },
    { icon: Map, label: "Carte", active: false },
    { icon: CreditCard, label: "Mon Pass", active: false },
    { icon: User, label: "Profil", active: false },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-40">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item, index) => (
          <button
            key={index}
            className={`flex flex-col items-center gap-1 tap-target p-2 rounded-lg transition-colors ${
              item.active 
                ? 'text-primary' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <item.icon className="w-5 h-5" />
            <span className="text-xs font-medium">
              {item.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
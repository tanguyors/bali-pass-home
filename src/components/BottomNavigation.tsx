import { Home, Search, CreditCard, User } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

export function BottomNavigation() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useLanguage();
  
  const navItems = [
    { icon: Home, label: t('nav.home'), path: "/", active: location.pathname === "/" },
    { icon: Search, label: t('nav.explorer'), path: "/explorer", active: location.pathname === "/explorer" },
    { icon: CreditCard, label: t('nav.my_pass'), path: "/mon-pass", active: location.pathname === "/mon-pass" },
    { icon: User, label: t('nav.profile'), path: "/profil", active: location.pathname === "/profil" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-sm border-t border-border z-40">
      <div className="flex items-center justify-around h-16 px-2 relative">
        {navItems.map((item, index) => (
          <button
            key={index}
            onClick={() => navigate(item.path)}
            className={`flex flex-col items-center gap-1 tap-target p-2 rounded-lg transition-colors ${
              item.active 
                ? 'text-primary' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <item.icon 
              className="w-5 h-5" 
              strokeWidth={item.active ? 2.5 : 1.5}
              fill={item.active ? "currentColor" : "none"}
            />
            <span className="text-xs font-medium">
              {item.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
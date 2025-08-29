import { Search, Globe, Bell } from "lucide-react";
import { Input } from "@/components/ui/input";

export function BaliPassHeader() {
  return (
    <div className="sticky top-0 z-40 bg-secondary border-b border-border">
      {/* Top bar */}
      <div className="flex items-center justify-between h-14 px-4">
        {/* Logo */}
        <div className="flex items-center">
          <h1 className="text-xl font-bold text-primary">Bali'Pass</h1>
        </div>
        
        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <button className="tap-target p-2 rounded-full hover:bg-primary/10 transition-colors">
            <Globe className="w-5 h-5 text-foreground" />
          </button>
          <button className="tap-target p-2 rounded-full hover:bg-primary/10 transition-colors">
            <Bell className="w-5 h-5 text-foreground" />
          </button>
        </div>
      </div>
      
      {/* Search bar */}
      <div className="px-4 pb-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Rechercher offres, partenaires..."
            className="pl-10 pr-4 h-10 rounded-full border-border"
          />
        </div>
      </div>
    </div>
  );
}
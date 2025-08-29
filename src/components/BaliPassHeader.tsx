import { Search, Globe, Bell, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";

interface BaliPassHeaderProps {
  onFilterClick?: () => void;
}

export function BaliPassHeader({ onFilterClick }: BaliPassHeaderProps) {
  return (
    <div className="sticky top-0 z-40 bg-secondary border-b border-border">
      {/* Compact top bar */}
      <div className="flex items-center justify-between h-12 px-4">
        {/* Logo */}
        <div className="flex items-center">
          <h1 className="text-lg font-bold text-primary">Bali'Pass</h1>
        </div>
        
        {/* Action buttons in white circles */}
        <div className="flex items-center gap-3">
          <button className="w-9 h-9 rounded-full bg-white shadow-bali-2 flex items-center justify-center tap-target hover:bg-gray-50 transition-colors">
            <Globe className="w-4 h-4 text-foreground" />
          </button>
          <button className="w-9 h-9 rounded-full bg-white shadow-bali-2 flex items-center justify-center tap-target hover:bg-gray-50 transition-colors">
            <Bell className="w-4 h-4 text-foreground" />
          </button>
        </div>
      </div>
      
      {/* Centered search bar with filter */}
      <div className="px-4 pb-3">
        <div className="relative max-w-sm mx-auto">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Rechercher une offre…"
            className="pl-11 pr-12 h-10 rounded-full border-border bg-white shadow-bali-2 text-center placeholder:text-left"
          />
          {onFilterClick && (
            <button
              onClick={onFilterClick}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 w-6 h-6 flex items-center justify-center tap-target"
            >
              <Filter className="w-4 h-4 text-muted-foreground" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
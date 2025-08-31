import { useState } from 'react';
import { Search, Filter, MapPin, Layers, Plus, Minus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface MapControlsProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onFilterClick: () => void;
  onLocationClick: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  activeFilters: number;
  userLocation: { lat: number; lng: number } | null;
}

export function MapControls({
  searchQuery,
  onSearchChange,
  onFilterClick,
  onLocationClick,
  onZoomIn,
  onZoomOut,
  activeFilters,
  userLocation
}: MapControlsProps) {
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);

  return (
    <>
      {/* Search Header */}
      <div className="absolute top-4 left-4 right-4 z-50">
        <div className="flex items-center gap-2">
          <div className={`relative transition-all duration-300 ${
            isSearchExpanded ? 'flex-1' : 'w-12'
          }`}>
            {isSearchExpanded ? (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  placeholder="Rechercher un partenaire ou une offre…"
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="pl-10 pr-4 h-12 bg-background/95 backdrop-blur-sm border-border shadow-lg"
                  autoFocus
                  onBlur={() => !searchQuery && setIsSearchExpanded(false)}
                />
              </div>
            ) : (
              <Button
                variant="outline"
                size="icon"
                onClick={() => setIsSearchExpanded(true)}
                className="w-12 h-12 bg-background/95 backdrop-blur-sm border-border shadow-lg"
              >
                <Search className="w-5 h-5" />
              </Button>
            )}
          </div>
          
          {!isSearchExpanded && (
            <>
              <Button
                variant="outline"
                size="icon"
                onClick={onFilterClick}
                className="w-12 h-12 bg-background/95 backdrop-blur-sm border-border shadow-lg relative"
              >
                <Filter className="w-5 h-5" />
                {activeFilters > 0 && (
                  <div className="absolute -top-2 -right-2 w-5 h-5 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">
                    {activeFilters}
                  </div>
                )}
              </Button>
              
              <Button
                variant="outline"
                size="icon"
                onClick={onLocationClick}
                disabled={!userLocation}
                className="w-12 h-12 bg-background/95 backdrop-blur-sm border-border shadow-lg"
              >
                <MapPin className="w-5 h-5" />
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Zoom Controls */}
      <div className="absolute right-4 top-1/2 transform -translate-y-1/2 z-40">
        <div className="flex flex-col gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={onZoomIn}
            className="w-10 h-10 bg-background/95 backdrop-blur-sm border-border shadow-lg"
          >
            <Plus className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={onZoomOut}
            className="w-10 h-10 bg-background/95 backdrop-blur-sm border-border shadow-lg"
          >
            <Minus className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Map Style Toggle */}
      <div className="absolute right-4 bottom-32 z-40">
        <Button
          variant="outline"
          size="icon"
          className="w-10 h-10 bg-background/95 backdrop-blur-sm border-border shadow-lg"
        >
          <Layers className="w-4 h-4" />
        </Button>
      </div>
    </>
  );
}
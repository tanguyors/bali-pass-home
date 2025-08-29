import { useState } from "react";
import { Filter, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DestinationsSection } from "@/components/DestinationsSection";
import { CategoriesSlider } from "@/components/CategoriesSlider";
import { FeaturedOffers } from "@/components/FeaturedOffers";
import { BottomNavigation } from "@/components/BottomNavigation";
import { FloatingActionButton } from "@/components/FloatingActionButton";
import { FilterBottomSheet } from "@/components/FilterBottomSheet";

const Explorer = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Header with Search */}
      <div className="sticky top-0 z-40 bg-secondary border-b border-border">
        <div className="flex items-center gap-3 h-14 px-4">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Rechercher une offre…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-11 pr-4 h-10 rounded-full border-border bg-white shadow-bali-2"
            />
          </div>
          
          {/* Filter Button */}
          <Button
            variant="outline"
            size="icon"
            onClick={() => setIsFilterOpen(true)}
            className="w-10 h-10 rounded-full bg-white shadow-bali-2 border-border hover:bg-gray-50"
          >
            <Filter className="w-4 h-4" />
          </Button>
        </div>
      </div>
      
      {/* Main Content */}
      <main className="pb-20">
        {/* Page Title */}
        <div className="px-4 pt-6 pb-4">
          <h1 className="text-2xl font-bold text-foreground">
            Explorer Bali
          </h1>
          <p className="text-mobile-body text-muted-foreground mt-1">
            Découvre les meilleures offres près de toi
          </p>
        </div>
        
        {/* Destinations */}
        <DestinationsSection />
        
        {/* Categories Slider */}
        <CategoriesSlider />
        
        {/* Featured Offers */}
        <div className="mt-8">
          <div className="px-4 mb-4">
            <h2 className="text-xl font-bold text-foreground">
              Offres populaires
            </h2>
            <p className="text-mobile-body text-muted-foreground">
              Les plus appréciées par nos voyageurs
            </p>
          </div>
          <FeaturedOffers />
        </div>
      </main>
      
      {/* Filter Bottom Sheet */}
      <FilterBottomSheet 
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
      />
      
      {/* Floating Action Button */}
      <FloatingActionButton />
      
      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
};

export default Explorer;
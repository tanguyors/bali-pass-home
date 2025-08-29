import { useEffect, useState } from "react";
import { X, MapPin, Tag, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

interface FilterBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

interface City {
  id: string;
  name: string;
  slug: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string;
}

export function FilterBottomSheet({ isOpen, onClose }: FilterBottomSheetProps) {
  const [cities, setCities] = useState<City[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedSort, setSelectedSort] = useState<string>("popular");

  useEffect(() => {
    if (isOpen) {
      fetchFilters();
    }
  }, [isOpen]);

  const fetchFilters = async () => {
    try {
      // Fetch cities
      const { data: citiesData } = await supabase
        .from('cities')
        .select('id, name, slug')
        .order('name', { ascending: true });
      
      // Fetch categories
      const { data: categoriesData } = await supabase
        .from('categories')
        .select('id, name, slug, icon')
        .order('name', { ascending: true });
      
      if (citiesData) setCities(citiesData);
      if (categoriesData) setCategories(categoriesData);
    } catch (error) {
      console.error('Error fetching filters:', error);
    }
  };

  const handleApplyFilters = () => {
    // Here you would apply the filters to the main content
    console.log('Filters applied:', { selectedCity, selectedCategory, selectedSort });
    onClose();
  };

  const handleClearFilters = () => {
    setSelectedCity("");
    setSelectedCategory("");
    setSelectedSort("popular");
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-50"
        onClick={onClose}
      />
      
      {/* Bottom Sheet */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl shadow-bali-4 animate-slide-up">
        <div className="flex flex-col max-h-[80vh]">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h2 className="text-lg font-semibold text-foreground">Filtres</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="w-8 h-8"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {/* Destinations */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="w-4 h-4 text-primary" />
                <h3 className="font-medium text-foreground">Destination</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={selectedCity === "" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCity("")}
                  className="rounded-full text-xs"
                >
                  Toutes
                </Button>
                {cities.map((city) => (
                  <Button
                    key={city.id}
                    variant={selectedCity === city.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCity(city.id)}
                    className="rounded-full text-xs"
                  >
                    {city.name}
                  </Button>
                ))}
              </div>
            </div>
            
            {/* Categories */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Tag className="w-4 h-4 text-primary" />
                <h3 className="font-medium text-foreground">Catégorie</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={selectedCategory === "" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory("")}
                  className="rounded-full text-xs"
                >
                  Toutes
                </Button>
                {categories.map((category) => (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category.id)}
                    className="rounded-full text-xs"
                  >
                    {category.icon && <span className="mr-1">{category.icon}</span>}
                    {category.name}
                  </Button>
                ))}
              </div>
            </div>
            
            {/* Sort Options */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-4 h-4 text-primary" />
                <h3 className="font-medium text-foreground">Trier par</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: "popular", label: "Popularité" },
                  { id: "newest", label: "Plus récent" },
                  { id: "ending", label: "Fin bientôt" },
                  { id: "discount", label: "Réduction" }
                ].map((option) => (
                  <Button
                    key={option.id}
                    variant={selectedSort === option.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedSort(option.id)}
                    className="rounded-full text-xs"
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>
          
          {/* Footer Actions */}
          <div className="p-4 border-t border-border">
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleClearFilters}
                className="flex-1"
              >
                Effacer
              </Button>
              <Button
                onClick={handleApplyFilters}
                className="flex-1"
              >
                Appliquer
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
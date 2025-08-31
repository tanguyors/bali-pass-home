import { useState, useEffect } from 'react';
import { X, MapPin, Tag, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { supabase } from '@/integrations/supabase/client';

interface Category {
  id: string;
  name: string;
  icon: string;
}

interface MapFiltersProps {
  isOpen: boolean;
  onClose: () => void;
  onFiltersChange: (filters: MapFilters) => void;
  userLocation: { lat: number; lng: number } | null;
}

export interface MapFilters {
  categories: string[];
  maxDistance: number | null;
  hasOffers: boolean;
}

export function MapFilters({ isOpen, onClose, onFiltersChange, userLocation }: MapFiltersProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [maxDistance, setMaxDistance] = useState<number>(50);
  const [hasOffers, setHasOffers] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchCategories();
    }
  }, [isOpen]);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name, icon')
        .order('name');

      if (error) {
        console.error('Error fetching categories:', error);
        return;
      }

      setCategories(data || []);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const toggleCategory = (categoryId: string) => {
    const newCategories = selectedCategories.includes(categoryId)
      ? selectedCategories.filter(id => id !== categoryId)
      : [...selectedCategories, categoryId];
    
    setSelectedCategories(newCategories);
  };

  const applyFilters = () => {
    onFiltersChange({
      categories: selectedCategories,
      maxDistance: userLocation ? maxDistance : null,
      hasOffers
    });
    onClose();
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setMaxDistance(50);
    setHasOffers(false);
    onFiltersChange({
      categories: [],
      maxDistance: null,
      hasOffers: false
    });
  };

  const activeFiltersCount = selectedCategories.length + (hasOffers ? 1 : 0) + (userLocation && maxDistance < 50 ? 1 : 0);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Filter panel */}
      <div className="absolute bottom-0 left-0 right-0 bg-background border-t border-border rounded-t-2xl p-6 max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold">Filtres</h2>
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                {activeFiltersCount}
              </Badge>
            )}
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Categories */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Tag className="w-4 h-4" />
            <h3 className="font-medium">Catégories</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategories.includes(category.id) ? "default" : "outline"}
                size="sm"
                onClick={() => toggleCategory(category.id)}
                className="text-xs"
              >
                <span className="mr-1">{category.icon}</span>
                {category.name}
              </Button>
            ))}
          </div>
        </div>

        <Separator className="my-4" />

        {/* Distance filter */}
        {userLocation && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="w-4 h-4" />
              <h3 className="font-medium">Distance maximale</h3>
            </div>
            <div className="px-2">
              <Slider
                value={[maxDistance]}
                onValueChange={([value]) => setMaxDistance(value)}
                max={100}
                min={1}
                step={1}
                className="mb-2"
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>1 km</span>
                <span className="font-medium">{maxDistance} km</span>
                <span>100 km</span>
              </div>
            </div>
          </div>
        )}

        {/* Offers filter */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Star className="w-4 h-4" />
            <h3 className="font-medium">Partenaires avec offres</h3>
          </div>
          <Button
            variant={hasOffers ? "default" : "outline"}
            size="sm"
            onClick={() => setHasOffers(!hasOffers)}
            className="text-xs"
          >
            Afficher uniquement les partenaires avec des offres
          </Button>
        </div>

        <Separator className="my-4" />

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={clearFilters}
            className="flex-1"
            disabled={activeFiltersCount === 0}
          >
            Effacer
          </Button>
          <Button
            onClick={applyFilters}
            className="flex-1"
          >
            Appliquer ({activeFiltersCount})
          </Button>
        </div>
      </div>
    </div>
  );
}
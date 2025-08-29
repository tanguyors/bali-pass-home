import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ChevronRight } from "lucide-react";

interface City {
  id: string;
  name: string;
  slug: string;
  is_featured: boolean;
}

export function DestinationsSection() {
  const [cities, setCities] = useState<City[]>([]);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);

  useEffect(() => {
    fetchCities();
  }, []);

  const fetchCities = async () => {
    try {
      const { data, error } = await supabase
        .from('cities')
        .select('id, name, slug, is_featured')
        .order('is_featured', { ascending: false })
        .order('name', { ascending: true });
      
      if (error) {
        console.error('Error fetching cities:', error);
        return;
      }
      
      if (data) {
        setCities(data);
        // Select first featured city or first city
        const defaultCity = data.find(city => city.is_featured) || data[0];
        if (defaultCity) {
          setSelectedCity(defaultCity.id);
        }
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  if (cities.length === 0) {
    return null;
  }

  return (
    <div className="mt-8">
      {/* Section Header */}
      <div className="px-4 mb-4">
        <h2 className="text-xl font-bold text-foreground mb-1">
          Explorer les destinations
        </h2>
        <p className="text-mobile-body text-muted-foreground">
          Découvre les lieux partenaires à Bali.
        </p>
      </div>

      {/* City Chips */}
      <div className="px-4 mb-4">
        <div className="flex flex-wrap gap-2">
          {cities.map((city) => (
            <button
              key={city.id}
              onClick={() => setSelectedCity(city.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium tap-target transition-all ${
                selectedCity === city.id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-primary/10'
              }`}
            >
              {city.name}
            </button>
          ))}
        </div>
      </div>

      {/* Destination Cards Carousel */}
      <div className="overflow-x-auto">
        <div className="flex gap-4 px-4 pb-2">
          {cities
            .filter(city => !selectedCity || city.id === selectedCity)
            .map((city) => (
              <div
                key={city.id}
                className="flex-shrink-0 w-64 bg-card rounded-2xl overflow-hidden shadow-bali"
              >
                {/* Placeholder for city image */}
                <div className="h-32 bg-gradient-card flex items-center justify-center">
                  <p className="text-muted-foreground text-sm">Image à venir</p>
                </div>
                
                <div className="p-4">
                  <h3 className="font-semibold text-foreground mb-1">
                    {city.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Offres disponibles
                  </p>
                  
                  <button className="flex items-center gap-2 text-primary text-sm font-medium tap-target">
                    Explorer
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
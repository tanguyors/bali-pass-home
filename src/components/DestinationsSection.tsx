import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { MapPin } from "lucide-react";

interface City {
  id: string;
  name: string;
  slug: string;
  is_featured: boolean;
}

interface CityWithOffers extends City {
  offers_count?: number;
}

export function DestinationsSection() {
  const navigate = useNavigate();
  const [cities, setCities] = useState<CityWithOffers[]>([]);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [filteredCities, setFilteredCities] = useState<CityWithOffers[]>([]);

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
        // Add mock offers count for demo (in real app, this would come from a join or separate query)
        const citiesWithOffers = data.map(city => ({
          ...city,
          offers_count: Math.floor(Math.random() * 20) + 5 // 5-24 offers
        }));
        
        setCities(citiesWithOffers);
        setFilteredCities(citiesWithOffers);
        
        // Select first featured city or first city
        const defaultCity = citiesWithOffers.find(city => city.is_featured) || citiesWithOffers[0];
        if (defaultCity) {
          setSelectedCity(defaultCity.id);
        }
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleCityFilter = (cityId: string | null) => {
    setSelectedCity(cityId);
    if (cityId) {
      setFilteredCities(cities.filter(city => city.id === cityId));
    } else {
      setFilteredCities(cities);
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

      {/* Compact Filter Chips */}
      <div className="px-4 mb-4">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleCityFilter(null)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium tap-target transition-all ${
              !selectedCity
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-primary/10'
            }`}
          >
            Toutes
          </button>
          {cities.map((city) => (
            <button
              key={city.id}
              onClick={() => handleCityFilter(city.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium tap-target transition-all ${
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

      {/* Visual Carousel */}
      <div className="overflow-x-auto">
        <div className="flex gap-4 px-4 pb-2">
          {filteredCities.map((city) => (
            <button
              key={city.id}
              onClick={() => navigate(`/explorer?city=${city.slug}`)}
              className="flex-shrink-0 w-72 bg-card rounded-2xl overflow-hidden shadow-bali hover:shadow-bali-4 transition-shadow duration-200 text-left"
            >
              {/* City Image */}
              <div className="h-32 bg-gradient-card flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-lagoon/20"></div>
                <div className="relative z-10 text-center">
                  <MapPin className="w-8 h-8 text-primary/60 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Photo à venir</p>
                </div>
              </div>
              
              <div className="p-4">
                <h3 className="font-bold text-lg text-foreground mb-1">
                  {city.name}
                </h3>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    {city.offers_count} offres disponibles
                  </p>
                  <div className="bg-primary/10 text-primary text-xs font-semibold px-2 py-1 rounded-full">
                    {city.is_featured ? 'Populaire' : 'Explorer'}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
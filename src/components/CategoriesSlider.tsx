import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string;
}

export function CategoriesSlider() {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name, slug, icon')
        .order('name', { ascending: true });
      
      if (error) {
        console.error('Error fetching categories:', error);
        return;
      }
      
      if (data) {
        setCategories(data);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  if (categories.length === 0) {
    return null;
  }

  const gradients = [
    'from-lagoon/20 to-primary/20',
    'from-coral/20 to-gold/20',
    'from-primary/20 to-lagoon/20',
    'from-gold/20 to-coral/20',
  ];

  return (
    <div className="mt-8">
      {/* Section Header */}
      <div className="px-4 mb-4">
        <h2 className="text-xl font-bold text-foreground">
          Catégories
        </h2>
      </div>

      {/* Categories Slider */}
      <div className="overflow-x-auto">
        <div className="flex gap-3 px-4 pb-2">
          {categories.map((category, index) => (
            <button
              key={category.id}
              className="flex-shrink-0 w-28 h-28 rounded-3xl bg-gradient-to-br from-primary/10 to-lagoon/10 flex flex-col items-center justify-center gap-2 tap-target hover:opacity-80 transition-opacity shadow-sm"
            >
              {/* Icon placeholder or emoji */}
              <div className="w-8 h-8 rounded-lg bg-white/50 flex items-center justify-center">
                {category.icon ? (
                  <span className="text-lg">{category.icon}</span>
                ) : (
                  <div className="w-4 h-4 bg-primary/40 rounded" />
                )}
              </div>
              
              {/* Category name */}
              <span className="text-xs font-medium text-center text-foreground leading-tight px-2">
                {category.name}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
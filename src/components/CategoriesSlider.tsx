import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";

interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string;
}

interface CategoryWithOffers extends Category {
  offers_count: number;
  gradient: string;
}

export function CategoriesSlider() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [categories, setCategories] = useState<CategoryWithOffers[]>([]);

  // Gradient palette for categories
  const gradientPalette = [
    "bg-gradient-to-br from-primary/80 to-lagoon/60",
    "bg-gradient-to-br from-coral/80 to-orange/60", 
    "bg-gradient-to-br from-gold/80 to-orange/60",
    "bg-gradient-to-br from-lagoon/80 to-primary/60",
    "bg-gradient-to-br from-orange/80 to-coral/60",
    "bg-gradient-to-br from-primary/80 to-gold/60",
  ];

  useEffect(() => {
    let mounted = true;
    
    const loadCategories = async () => {
      if (!mounted) return;
      await fetchCategories();
    };
    
    loadCategories();
    
    return () => {
      mounted = false;
    };
  }, []);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select(`
          id, 
          name, 
          slug, 
          icon,
          offers!inner(
            id,
            is_active,
            partners!inner(
              status
            )
          )
        `)
        .order('name', { ascending: true });
      
      if (error) {
        console.error('Error fetching categories:', error);
        return;
      }
      
      if (data) {
        // Enhance categories with real offers count and gradients
        const categoriesWithExtras: CategoryWithOffers[] = data.map((category, index) => {
          // Count only active offers from approved partners
          const activeOffers = category.offers?.filter(offer => 
            offer.is_active && offer.partners?.status === 'approved'
          ) || [];
          
          return {
            id: category.id,
            name: category.name,
            slug: category.slug,
            icon: category.icon,
            offers_count: activeOffers.length,
            gradient: gradientPalette[index % gradientPalette.length]
          };
        }).filter(category => category.offers_count > 0); // Only show categories with offers
        
        setCategories(categoriesWithExtras);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  if (categories.length === 0) {
    return null;
  }

  return (
    <div className="mt-8">
      {/* Section Header */}
      <div className="px-4 mb-4">
        <h2 className="text-xl font-bold text-foreground">
          {t('categories.title')}
        </h2>
        <p className="text-mobile-body text-muted-foreground">
          {t('categories.subtitle')}
        </p>
      </div>

      {/* Horizontal Swipeable Carousel */}
      <div className="overflow-x-auto">
        <div className="flex gap-4 px-4 pb-2" style={{ scrollSnapType: 'x mandatory' }}>
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => navigate(`/explorer?category=${category.slug}`)}
              className="flex-shrink-0 w-32 h-32 rounded-3xl relative overflow-hidden tap-target hover:scale-105 transition-transform duration-200 shadow-bali-2"
              style={{ scrollSnapAlign: 'start' }}
            >
              {/* Gradient Background */}
              <div className={`absolute inset-0 ${category.gradient}`}></div>
              
              {/* Content */}
              <div className="relative z-10 h-full flex flex-col items-center justify-center gap-2 p-3">
                {/* Icon */}
                <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  {category.icon ? (
                    <span className="text-xl">{category.icon}</span>
                  ) : (
                    <div className="w-5 h-5 bg-white/60 rounded" />
                  )}
                </div>
                
                {/* Category name */}
                <span className="text-xs font-semibold text-white text-center leading-tight px-1">
                  {t(`category_names.${category.name}`) || category.name}
                </span>
              </div>
              
              {/* Offers count badge */}
              <div className="absolute top-2 right-2 bg-white/90 text-foreground text-xs font-bold px-2 py-1 rounded-full shadow-sm">
                {category.offers_count}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
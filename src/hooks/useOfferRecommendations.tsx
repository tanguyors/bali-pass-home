import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface OfferRecommendation {
  id: string;
  title: string;
  title_en?: string;
  title_es?: string;
  title_id?: string;
  title_zh?: string;
  short_desc?: string;
  short_desc_en?: string;
  short_desc_es?: string;
  short_desc_id?: string;
  short_desc_zh?: string;
  photos?: string[];
  partners: {
    id: string;
    name: string;
    city_id: string;
    lat?: number;
    lng?: number;
  };
  categories: {
    name: string;
  };
}

export function useOfferRecommendations(cityId: string | null) {
  const { data: offers = [], isLoading } = useQuery({
    queryKey: ["offer-recommendations", cityId],
    queryFn: async () => {
      if (!cityId) return [];

      const { data, error } = await supabase
        .from("offers")
        .select(`
          id,
          title,
          title_en,
          title_es,
          title_id,
          title_zh,
          short_desc,
          short_desc_en,
          short_desc_es,
          short_desc_id,
          short_desc_zh,
          photos,
          partners!inner (
            id,
            name,
            city_id,
            lat,
            lng
          ),
          categories (
            name
          )
        `)
        .eq("is_active", true)
        .eq("partners.city_id", cityId)
        .limit(20);

      if (error) throw error;
      return data as OfferRecommendation[];
    },
    enabled: !!cityId,
  });

  return {
    offers,
    isLoading,
  };
}

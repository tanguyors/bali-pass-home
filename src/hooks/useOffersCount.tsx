import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useOffersCount() {
  const { data: count, isLoading } = useQuery({
    queryKey: ["offers-count"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("offers")
        .select("*", { count: "exact", head: true })
        .eq("is_active", true);

      if (error) throw error;
      return count || 0;
    },
  });

  return {
    offersCount: count || 0,
    loading: isLoading,
  };
}

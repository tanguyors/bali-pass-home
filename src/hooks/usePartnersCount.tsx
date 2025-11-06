import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function usePartnersCount() {
  const { data: count, isLoading } = useQuery({
    queryKey: ["partners-count"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("partners")
        .select("*", { count: "exact", head: true })
        .eq("status", "approved");

      if (error) throw error;
      return count || 0;
    },
  });

  return {
    partnersCount: count || 0,
    loading: isLoading,
  };
}

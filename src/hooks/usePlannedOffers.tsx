import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface PlannedOffer {
  id: string;
  itinerary_day_id: string;
  offer_id: string;
  planned_time?: string;
  notes?: string;
  is_visited: boolean;
  visited_at?: string;
  added_at: string;
  offers?: {
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
      name: string;
    };
  };
}

export function usePlannedOffers(dayId: string | null) {
  const queryClient = useQueryClient();

  const { data: plannedOffers = [], isLoading } = useQuery({
    queryKey: ["planned-offers", dayId],
    queryFn: async () => {
      if (!dayId) return [];

      const { data, error } = await supabase
        .from("itinerary_planned_offers" as any)
        .select(`
          *,
          offers (
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
            partners (
              name
            )
          )
        `)
        .eq("itinerary_day_id", dayId)
        .order("planned_time", { ascending: true, nullsFirst: false });

      if (error) throw error;
      return data as unknown as PlannedOffer[];
    },
    enabled: !!dayId,
  });

  const addOffer = useMutation({
    mutationFn: async (newOffer: {
      itinerary_day_id: string;
      offer_id: string;
      planned_time?: string;
      notes?: string;
    }) => {
      const { data, error } = await supabase
        .from("itinerary_planned_offers" as any)
        .insert(newOffer)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["planned-offers"] });
      toast.success("Offre ajoutée au planning");
    },
    onError: () => {
      toast.error("Erreur lors de l'ajout de l'offre");
    },
  });

  const updatePlannedOffer = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<PlannedOffer> & { id: string }) => {
      const { data, error } = await supabase
        .from("itinerary_planned_offers" as any)
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["planned-offers"] });
      toast.success("Offre mise à jour");
    },
    onError: () => {
      toast.error("Erreur lors de la mise à jour");
    },
  });

  const removePlannedOffer = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("itinerary_planned_offers" as any)
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["planned-offers"] });
      toast.success("Offre retirée du planning");
    },
    onError: () => {
      toast.error("Erreur lors de la suppression");
    },
  });

  return {
    plannedOffers,
    isLoading,
    addOffer,
    updatePlannedOffer,
    removePlannedOffer,
  };
}

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface ItineraryDay {
  id: string;
  itinerary_id: string;
  day_date: string;
  city_id?: string;
  day_order: number;
  notes?: string;
  created_at: string;
  updated_at: string;
  cities?: {
    id: string;
    name: string;
    geo_center_lat: number;
    geo_center_lng: number;
  };
  itinerary_planned_offers?: Array<{
    id: string;
    offer_id: string;
    planned_time?: string;
    notes?: string;
    offers: {
      id: string;
      title: string;
      slug: string;
      partners: {
        id: string;
        name: string;
        lat?: number;
        lng?: number;
        address?: string;
      };
    };
  }>;
}

export function useItineraryDays(itineraryId: string | null) {
  const queryClient = useQueryClient();

  const { data: days = [], isLoading } = useQuery({
    queryKey: ["itinerary-days", itineraryId],
    queryFn: async () => {
      if (!itineraryId) return [];

      const { data, error } = await supabase
        .from("itinerary_days" as any)
        .select(`
          *,
          cities (
            id,
            name,
            geo_center_lat,
            geo_center_lng
          ),
          itinerary_planned_offers (
            id,
            offer_id,
            planned_time,
            notes,
            offers (
              id,
              title,
              slug,
              partners (
                id,
                name,
                lat,
                lng,
                address
              )
            )
          )
        `)
        .eq("itinerary_id", itineraryId)
        .order("day_date", { ascending: true });

      if (error) throw error;
      return data as unknown as ItineraryDay[];
    },
    enabled: !!itineraryId,
  });

  const createDay = useMutation({
    mutationFn: async (newDay: Omit<ItineraryDay, "id" | "created_at" | "updated_at" | "cities">) => {
      const { data, error } = await supabase
        .from("itinerary_days" as any)
        .insert(newDay)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["itinerary-days"] });
      toast.success("Jour ajouté");
    },
    onError: () => {
      toast.error("Erreur lors de l'ajout du jour");
    },
  });

  const updateDay = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<ItineraryDay> & { id: string }) => {
      const { data, error } = await supabase
        .from("itinerary_days" as any)
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["itinerary-days"] });
      toast.success("Jour mis à jour");
    },
    onError: () => {
      toast.error("Erreur lors de la mise à jour");
    },
  });

  const deleteDay = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("itinerary_days" as any)
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["itinerary-days"] });
      toast.success("Jour supprimé");
    },
    onError: () => {
      toast.error("Erreur lors de la suppression");
    },
  });

  return {
    days,
    isLoading,
    createDay,
    updateDay,
    deleteDay,
  };
}

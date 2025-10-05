import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface Itinerary {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export function useItineraries() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: itineraries = [], isLoading } = useQuery({
    queryKey: ["itineraries", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("travel_itineraries" as any)
        .select("*")
        .eq("user_id", user.id)
        .order("start_date", { ascending: false });

      if (error) throw error;
      return data as unknown as Itinerary[];
    },
    enabled: !!user,
  });

  const createItinerary = useMutation({
    mutationFn: async (newItinerary: Omit<Itinerary, "id" | "user_id" | "created_at" | "updated_at">) => {
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("travel_itineraries" as any)
        .insert({
          ...newItinerary,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["itineraries"] });
      toast.success("Itinéraire créé avec succès");
    },
    onError: () => {
      toast.error("Erreur lors de la création de l'itinéraire");
    },
  });

  const updateItinerary = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Itinerary> & { id: string }) => {
      const { data, error } = await supabase
        .from("travel_itineraries" as any)
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["itineraries"] });
      toast.success("Itinéraire mis à jour");
    },
    onError: () => {
      toast.error("Erreur lors de la mise à jour");
    },
  });

  const deleteItinerary = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("travel_itineraries" as any)
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["itineraries"] });
      toast.success("Itinéraire supprimé");
    },
    onError: () => {
      toast.error("Erreur lors de la suppression");
    },
  });

  return {
    itineraries,
    isLoading,
    createItinerary,
    updateItinerary,
    deleteItinerary,
  };
}

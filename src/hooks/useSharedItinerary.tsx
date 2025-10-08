import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export interface SharedItineraryData {
  id: string;
  title: string;
  description?: string;
  start_date: string;
  end_date: string;
  is_public: boolean;
  share_token?: string;
  days?: any[];
}

// Récupérer un itinéraire par son token de partage
export function useSharedItinerary(token: string | undefined) {
  return useQuery({
    queryKey: ["shared-itinerary", token],
    queryFn: async () => {
      if (!token) throw new Error("Token manquant");

      const { data, error } = await supabase
        .from("travel_itineraries" as any)
        .select(`
          *,
          itinerary_days (
            *,
            cities (*),
            itinerary_planned_offers (
              *,
              offers (
                *,
                partners (
                  id,
                  name,
                  slug,
                  lat,
                  lng,
                  address
                )
              )
            )
          )
        `)
        .eq("share_token", token)
        .eq("is_public", true)
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error("Itinéraire non trouvé");
      
      return data as unknown as SharedItineraryData;
    },
    enabled: !!token,
  });
}

// Générer et activer le partage d'un itinéraire
export function useGenerateShareLink() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (itineraryId: string) => {
      // Appeler la fonction RPC pour générer un token
      const { data: tokenData, error: tokenError } = await supabase.rpc(
        "generate_share_token" as any
      );

      if (tokenError) throw tokenError;

      // Mettre à jour l'itinéraire avec le token et is_public
      const { data, error } = await supabase
        .from("travel_itineraries" as any)
        .update({
          share_token: tokenData,
          is_public: true,
        })
        .eq("id", itineraryId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["itineraries"] });
      toast.success("Lien de partage créé !");
    },
    onError: () => {
      toast.error("Erreur lors de la création du lien");
    },
  });
}

// Désactiver le partage d'un itinéraire
export function useDisableSharing() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (itineraryId: string) => {
      const { error } = await supabase
        .from("travel_itineraries" as any)
        .update({
          is_public: false,
        })
        .eq("id", itineraryId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["itineraries"] });
      toast.success("Partage désactivé");
    },
    onError: () => {
      toast.error("Erreur lors de la désactivation");
    },
  });
}

// Dupliquer un itinéraire partagé
export function useDuplicateItinerary() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async (token: string) => {
      // 1. Récupérer l'itinéraire source avec tous ses détails
      const { data: sourceItinerary, error: fetchError } = await supabase
        .from("travel_itineraries" as any)
        .select(`
          *,
          itinerary_days (
            *,
            itinerary_planned_offers (*)
          )
        `)
        .eq("share_token", token)
        .eq("is_public", true)
        .single();

      if (fetchError) throw fetchError;
      if (!sourceItinerary) throw new Error("Itinéraire non trouvé");

      const source = sourceItinerary as any;

      // 2. Vérifier que l'utilisateur est connecté
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Vous devez être connecté pour dupliquer un itinéraire");

      // 3. Créer le nouvel itinéraire
      const { data: newItinerary, error: createError } = await supabase
        .from("travel_itineraries" as any)
        .insert({
          user_id: user.id,
          title: `${source.title} (copie)`,
          description: source.description,
          start_date: source.start_date,
          end_date: source.end_date,
          is_active: true,
          is_public: false,
        })
        .select()
        .single();

      if (createError) throw createError;

      const newItin = newItinerary as any;

      // 4. Dupliquer tous les jours
      if (source.itinerary_days && source.itinerary_days.length > 0) {
        const daysToInsert = source.itinerary_days.map((day: any) => ({
          itinerary_id: newItin.id,
          day_date: day.day_date,
          day_order: day.day_order,
          city_id: day.city_id,
          notes: day.notes,
        }));

        const { data: newDays, error: daysError } = await supabase
          .from("itinerary_days" as any)
          .insert(daysToInsert)
          .select();

        if (daysError) throw daysError;

        // 5. Dupliquer toutes les offres planifiées
        const offersToInsert: any[] = [];
        source.itinerary_days.forEach((sourceDay: any, index: number) => {
          if (sourceDay.itinerary_planned_offers && sourceDay.itinerary_planned_offers.length > 0) {
            sourceDay.itinerary_planned_offers.forEach((offer: any) => {
              offersToInsert.push({
                itinerary_day_id: (newDays as any)[index].id,
                offer_id: offer.offer_id,
                planned_time: offer.planned_time,
                notes: offer.notes,
              });
            });
          }
        });

        if (offersToInsert.length > 0) {
          const { error: offersError } = await supabase
            .from("itinerary_planned_offers" as any)
            .insert(offersToInsert);

          if (offersError) throw offersError;
        }
      }

      return newItinerary;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["itineraries"] });
      toast.success("Itinéraire dupliqué avec succès !");
      navigate("/travel-planner");
    },
    onError: (error: any) => {
      if (error.message === "Vous devez être connecté pour dupliquer un itinéraire") {
        toast.error(error.message);
      } else {
        toast.error("Erreur lors de la duplication");
      }
    },
  });
}

// Générer l'URL de la carte statique Google Maps
export function generateStaticMapUrl(days: any[]): string {
  const GOOGLE_MAPS_API_KEY = "AIzaSyDjk8VZ-HRiKy5TLPZF40nMkbwv0hgvXQI";
  const baseUrl = "https://maps.googleapis.com/maps/api/staticmap";
  
  let markers = "";
  let paths = "";
  const colors = ["blue", "red", "green", "yellow", "purple", "orange"];
  
  days.forEach((day, dayIndex) => {
    const color = colors[dayIndex % colors.length];
    const offers = day.itinerary_planned_offers || [];
    
    offers.forEach((plannedOffer: any, offerIndex: number) => {
      const partner = plannedOffer.offers?.partners;
      if (partner?.lat && partner?.lng) {
        const label = offerIndex + 1;
        markers += `&markers=color:${color}|label:${label}|${partner.lat},${partner.lng}`;
        
        // Ajouter au chemin pour ce jour
        if (offerIndex === 0) {
          paths += `&path=color:0x${color}80|weight:3|${partner.lat},${partner.lng}`;
        } else {
          paths += `|${partner.lat},${partner.lng}`;
        }
      }
    });
  });
  
  return `${baseUrl}?size=800x600&key=${GOOGLE_MAPS_API_KEY}${markers}${paths}`;
}

// Générer la description texte de l'itinéraire
export function generateItineraryDescription(itinerary: SharedItineraryData): string {
  let description = `📅 ${itinerary.title}\n\n`;
  
  if (itinerary.description) {
    description += `${itinerary.description}\n\n`;
  }
  
  description += `🗓️ Du ${new Date(itinerary.start_date).toLocaleDateString('fr-FR')} au ${new Date(itinerary.end_date).toLocaleDateString('fr-FR')}\n\n`;
  
  if (itinerary.days && itinerary.days.length > 0) {
    itinerary.days.forEach((day: any, index: number) => {
      description += `📍 Jour ${index + 1} - ${new Date(day.day_date).toLocaleDateString('fr-FR')}\n`;
      
      if (day.cities) {
        description += `   📌 ${day.cities.name}\n`;
      }
      
      const offers = day.itinerary_planned_offers || [];
      offers.forEach((po: any) => {
        if (po.offers) {
          description += `   • ${po.offers.title}`;
          if (po.offers.partners) {
            description += ` - ${po.offers.partners.name}`;
          }
          description += `\n`;
        }
      });
      
      description += `\n`;
    });
  }
  
  return description;
}

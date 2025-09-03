import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface OfferFavorite {
  id: string;
  user_id: string;
  offer_id: string;
  created_at: string;
  offer: {
    id: string;
    title: string;
    short_desc: string | null;
    value_text: string | null;
    partner: {
      id: string;
      name: string;
      address: string | null;
      photos: string[] | null;
    };
    category: {
      id: string;
      name: string;
      icon: string | null;
    };
  };
}

export const useOfferFavorites = () => {
  const [favorites, setFavorites] = useState<OfferFavorite[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchFavorites = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setFavorites([]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('favorites')
        .select(`
          id,
          user_id,
          offer_id,
          created_at,
          offer:offers(
            id,
            title,
            short_desc,
            value_text,
            partner:partners(
              id,
              name,
              address,
              photos
            ),
            category:categories(
              id,
              name,
              icon
            )
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching offer favorites:', error);
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Impossible de charger les favoris",
        });
        return;
      }

      setFavorites(data || []);
    } catch (error) {
      console.error('Error fetching offer favorites:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de charger les favoris",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const removeFromFavorites = useCallback(async (offerId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('offer_id', offerId);

      if (error) {
        console.error('Error removing from favorites:', error);
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Impossible de retirer des favoris",
        });
        return;
      }

      toast({
        title: "Retiré des favoris",
        description: "L'offre a été retirée de vos favoris"
      });

      fetchFavorites();
    } catch (error) {
      console.error('Error removing from favorites:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de retirer des favoris",
      });
    }
  }, [toast, fetchFavorites]);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  return {
    favorites,
    loading,
    removeFromFavorites,
    refreshFavorites: fetchFavorites,
  };
};
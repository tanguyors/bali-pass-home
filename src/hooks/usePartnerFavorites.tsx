import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface PartnerFavorite {
  id: string;
  user_id: string;
  partner_id: string;
  created_at: string;
  partner?: {
    id: string;
    name: string;
    slug: string;
    logo_url?: string;
    city_id: string;
    cities?: {
      name: string;
    };
  };
}

export const usePartnerFavorites = () => {
  const [favorites, setFavorites] = useState<PartnerFavorite[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchFavorites = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        setFavorites([]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('partner_favorites')
        .select(`
          *,
          partners!partner_favorites_partner_id_fkey (
            id,
            name,
            slug,
            logo_url,
            city_id,
            cities (
              name
            )
          )
        `)
        .eq('user_id', session.user.id);

      if (error) throw error;
      setFavorites(data || []);
    } catch (error) {
      console.error('Error fetching partner favorites:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les favoris",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addToFavorites = async (partnerId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        toast({
          title: "Connexion requise",
          description: "Vous devez être connecté pour ajouter aux favoris",
          variant: "destructive"
        });
        return false;
      }

      const { error } = await supabase
        .from('partner_favorites')
        .insert({
          user_id: session.user.id,
          partner_id: partnerId
        });

      if (error) throw error;

      toast({
        title: "Ajouté aux favoris",
        description: "Le partenaire a été ajouté à vos favoris"
      });

      fetchFavorites();
      return true;
    } catch (error: any) {
      console.error('Error adding to favorites:', error);
      if (error.code === '23505') {
        toast({
          title: "Déjà en favoris",
          description: "Ce partenaire est déjà dans vos favoris",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Erreur",
          description: "Impossible d'ajouter aux favoris",
          variant: "destructive"
        });
      }
      return false;
    }
  };

  const removeFromFavorites = async (partnerId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return false;

      const { error } = await supabase
        .from('partner_favorites')
        .delete()
        .eq('user_id', session.user.id)
        .eq('partner_id', partnerId);

      if (error) throw error;

      toast({
        title: "Retiré des favoris",
        description: "Le partenaire a été retiré de vos favoris"
      });

      fetchFavorites();
      return true;
    } catch (error) {
      console.error('Error removing from favorites:', error);
      toast({
        title: "Erreur",
        description: "Impossible de retirer des favoris",
        variant: "destructive"
      });
      return false;
    }
  };

  const isFavorite = (partnerId: string): boolean => {
    return favorites.some(fav => fav.partner_id === partnerId);
  };

  const toggleFavorite = async (partnerId: string) => {
    if (isFavorite(partnerId)) {
      return await removeFromFavorites(partnerId);
    } else {
      return await addToFavorites(partnerId);
    }
  };

  useEffect(() => {
    fetchFavorites();
    
    // Listen to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') {
        fetchFavorites();
      } else if (event === 'SIGNED_OUT') {
        setFavorites([]);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return {
    favorites,
    loading,
    addToFavorites,
    removeFromFavorites,
    isFavorite,
    toggleFavorite,
    refetch: fetchFavorites
  };
};
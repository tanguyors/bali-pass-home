-- ==============================================
-- PHASE 3: CONTRAINTES DE DONNÉES ET FONCTIONS UTILITAIRES
-- ==============================================

-- Validation des dates sur passes (sans sous-requêtes)
ALTER TABLE public.passes 
ADD CONSTRAINT valid_pass_dates 
CHECK (expires_at > purchased_at);

-- Validation sur redemptions
ALTER TABLE public.redemptions 
ADD CONSTRAINT valid_redemption_date 
CHECK (redeemed_at >= created_at);

-- Validation des valeurs numériques
ALTER TABLE public.offers 
ADD CONSTRAINT valid_value_number 
CHECK (value_number IS NULL OR value_number >= 0);

-- Contrainte pour s'assurer que les passes ont un token QR unique
ALTER TABLE public.passes 
ADD CONSTRAINT unique_qr_token UNIQUE (qr_token);

-- Contrainte pour éviter les doublons dans les favoris
ALTER TABLE public.favorites 
ADD CONSTRAINT unique_user_offer_favorite UNIQUE (user_id, offer_id);

ALTER TABLE public.partner_favorites 
ADD CONSTRAINT unique_user_partner_favorite UNIQUE (user_id, partner_id);

-- ==============================================
-- FONCTIONS UTILITAIRES POUR PERFORMANCES
-- ==============================================

-- Fonction pour nettoyer les passes expirés (maintenance)
CREATE OR REPLACE FUNCTION public.cleanup_expired_passes()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.passes 
  SET status = 'expired'
  WHERE status = 'active' 
  AND expires_at < now();
END;
$$;

-- Fonction pour calculer les statistiques des partenaires rapidement
CREATE OR REPLACE FUNCTION public.get_partner_stats(partner_uuid uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
  result json;
BEGIN
  SELECT json_build_object(
    'total_offers', COUNT(o.id),
    'active_offers', COUNT(o.id) FILTER (WHERE o.is_active = true),
    'total_redemptions', (
      SELECT COUNT(r.id) 
      FROM public.redemptions r 
      WHERE r.partner_id = partner_uuid
    )
  ) INTO result
  FROM public.offers o
  WHERE o.partner_id = partner_uuid;
  
  RETURN result;
END;
$$;

-- Fonction pour rechercher des offres avec performance optimisée
CREATE OR REPLACE FUNCTION public.search_offers(
  search_term text DEFAULT '',
  category_filter uuid DEFAULT NULL,
  city_filter uuid DEFAULT NULL,
  limit_count integer DEFAULT 20
)
RETURNS TABLE (
  id uuid,
  title text,
  short_desc text,
  partner_name text,
  category_name text,
  city_name text
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    o.id,
    o.title,
    o.short_desc,
    p.name as partner_name,
    c.name as category_name,
    ci.name as city_name
  FROM public.offers o
  JOIN public.partners p ON p.id = o.partner_id
  JOIN public.categories c ON c.id = o.category_id
  JOIN public.cities ci ON ci.id = p.city_id
  WHERE 
    o.is_active = true 
    AND p.status = 'approved'
    AND (search_term = '' OR o.title ILIKE '%' || search_term || '%')
    AND (category_filter IS NULL OR o.category_id = category_filter)
    AND (city_filter IS NULL OR p.city_id = city_filter)
  ORDER BY o.created_at DESC
  LIMIT limit_count;
END;
$$;
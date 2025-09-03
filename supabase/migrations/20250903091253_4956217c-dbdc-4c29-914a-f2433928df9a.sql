-- ==============================================
-- PHASE 3B: CONTRAINTES ET FONCTIONS (APRÈS CORRECTION)
-- ==============================================

-- Maintenant que les données sont corrigées, appliquer les contraintes
ALTER TABLE public.passes 
ADD CONSTRAINT valid_pass_dates 
CHECK (expires_at > purchased_at);

ALTER TABLE public.redemptions 
ADD CONSTRAINT valid_redemption_date 
CHECK (redeemed_at >= created_at);

-- Validation des valeurs numériques
ALTER TABLE public.offers 
ADD CONSTRAINT valid_value_number 
CHECK (value_number IS NULL OR value_number >= 0);

-- Contraintes uniques pour éviter les doublons
ALTER TABLE public.favorites 
ADD CONSTRAINT unique_user_offer_favorite UNIQUE (user_id, offer_id);

ALTER TABLE public.partner_favorites 
ADD CONSTRAINT unique_user_partner_favorite UNIQUE (user_id, partner_id);

-- ==============================================
-- FONCTIONS UTILITAIRES
-- ==============================================

-- Fonction maintenance des passes expirés
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

-- Fonction recherche optimisée d'offres
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
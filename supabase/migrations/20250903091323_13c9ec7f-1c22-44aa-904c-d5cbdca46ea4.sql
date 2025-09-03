-- ==============================================
-- PHASE 4: FINALISATION DES OPTIMISATIONS
-- ==============================================

-- Contraintes seulement si elles n'existent pas déjà
DO $$
BEGIN
  -- Validation des valeurs numériques sur offers
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.constraint_column_usage 
    WHERE constraint_name = 'valid_value_number' 
    AND table_name = 'offers'
  ) THEN
    ALTER TABLE public.offers 
    ADD CONSTRAINT valid_value_number 
    CHECK (value_number IS NULL OR value_number >= 0);
  END IF;

  -- Contrainte unique sur qr_token (critical pour sécurité)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.constraint_column_usage 
    WHERE constraint_name = 'unique_qr_token' 
    AND table_name = 'passes'
  ) THEN
    ALTER TABLE public.passes 
    ADD CONSTRAINT unique_qr_token UNIQUE (qr_token);
  END IF;

  -- Contraintes uniques pour favoris
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.constraint_column_usage 
    WHERE constraint_name = 'unique_user_offer_favorite' 
    AND table_name = 'favorites'
  ) THEN
    ALTER TABLE public.favorites 
    ADD CONSTRAINT unique_user_offer_favorite UNIQUE (user_id, offer_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.constraint_column_usage 
    WHERE constraint_name = 'unique_user_partner_favorite' 
    AND table_name = 'partner_favorites'
  ) THEN
    ALTER TABLE public.partner_favorites 
    ADD CONSTRAINT unique_user_partner_favorite UNIQUE (user_id, partner_id);
  END IF;
END $$;

-- ==============================================
-- POLITIQUES RLS OPTIMISÉES FINALES
-- ==============================================

-- Politique optimisée pour profiles (remplace toutes les autres)
DROP POLICY IF EXISTS "optimized_profiles_access" ON public.profiles;
CREATE POLICY "final_profiles_policy" ON public.profiles
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Politique optimisée pour passes
DROP POLICY IF EXISTS "optimized_passes_access" ON public.passes;
CREATE POLICY "final_passes_policy" ON public.passes
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ==============================================
-- FONCTIONS FINALES
-- ==============================================

-- Fonction recherche ultra-optimisée
CREATE OR REPLACE FUNCTION public.fast_search_offers(
  search_text text DEFAULT '',
  category_uuid uuid DEFAULT NULL,
  limit_count integer DEFAULT 20
)
RETURNS TABLE (
  offer_id uuid,
  offer_title text,
  partner_name text,
  category_name text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT 
    o.id,
    o.title,
    p.name,
    c.name
  FROM public.offers o
  USE INDEX (idx_offers_partner_active, idx_offers_category_active)
  JOIN public.partners p ON p.id = o.partner_id
  JOIN public.categories c ON c.id = o.category_id
  WHERE 
    o.is_active = true 
    AND p.status = 'approved'
    AND (search_text = '' OR o.title ILIKE '%' || search_text || '%')
    AND (category_uuid IS NULL OR o.category_id = category_uuid)
  ORDER BY o.created_at DESC
  LIMIT limit_count;
$$;
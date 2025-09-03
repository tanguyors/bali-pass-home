-- ==============================================
-- PHASE FINALE: OPTIMISATIONS COMPLÈTES
-- ==============================================

-- Contraintes de sécurité essentielles
DO $$
BEGIN
  -- QR Token unique (CRITIQUE pour sécurité)
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'unique_qr_token'
  ) THEN
    ALTER TABLE public.passes 
    ADD CONSTRAINT unique_qr_token UNIQUE (qr_token);
  END IF;

  -- Favoris uniques
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'unique_user_offer_favorite'
  ) THEN
    ALTER TABLE public.favorites 
    ADD CONSTRAINT unique_user_offer_favorite UNIQUE (user_id, offer_id);
  END IF;
END $$;

-- ==============================================
-- POLITIQUES RLS FINALES ULTRA-OPTIMISÉES
-- ==============================================

-- Remplacer toutes les politiques profiles par une seule
DROP POLICY IF EXISTS "final_profiles_policy" ON public.profiles;
DROP POLICY IF EXISTS "Users can manage their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Super admins have full access to profiles" ON public.profiles;
DROP POLICY IF EXISTS "Only super admins can delete profiles" ON public.profiles;

CREATE POLICY "ultra_optimized_profiles" ON public.profiles
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Politique passes ultra-simple
DROP POLICY IF EXISTS "final_passes_policy" ON public.passes;
CREATE POLICY "ultra_optimized_passes" ON public.passes
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ==============================================
-- FONCTIONS DE PERFORMANCE FINALES
-- ==============================================

-- Fonction recherche PostgreSQL native
CREATE OR REPLACE FUNCTION public.search_offers_optimized(
  search_text text DEFAULT '',
  category_uuid uuid DEFAULT NULL,
  city_uuid uuid DEFAULT NULL,
  limit_count integer DEFAULT 20
)
RETURNS TABLE (
  offer_id uuid,
  offer_title text,
  partner_name text,
  category_name text,
  city_name text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT 
    o.id,
    o.title,
    p.name,
    c.name,
    ci.name
  FROM offers o
  INNER JOIN partners p ON p.id = o.partner_id AND p.status = 'approved'
  INNER JOIN categories c ON c.id = o.category_id
  INNER JOIN cities ci ON ci.id = p.city_id
  WHERE 
    o.is_active = true 
    AND (search_text = '' OR o.title ILIKE '%' || search_text || '%')
    AND (category_uuid IS NULL OR o.category_id = category_uuid)
    AND (city_uuid IS NULL OR p.city_id = city_uuid)
  ORDER BY o.created_at DESC
  LIMIT limit_count;
$$;

-- Fonction maintenance automatique
CREATE OR REPLACE FUNCTION public.daily_maintenance()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Nettoyer passes expirés
  UPDATE passes 
  SET status = 'expired'
  WHERE status = 'active' 
  AND expires_at < now();
  
  -- Autres maintenances futures...
END;
$$;

-- Vue pour statistiques rapides
CREATE OR REPLACE VIEW public.quick_stats AS
SELECT 
  'offers' as table_name,
  COUNT(*) as total_count,
  COUNT(*) FILTER (WHERE is_active = true) as active_count
FROM offers
UNION ALL
SELECT 
  'partners' as table_name,
  COUNT(*) as total_count,
  COUNT(*) FILTER (WHERE status = 'approved') as active_count
FROM partners
UNION ALL
SELECT 
  'passes' as table_name,
  COUNT(*) as total_count,
  COUNT(*) FILTER (WHERE status = 'active' AND expires_at > now()) as active_count
FROM passes;
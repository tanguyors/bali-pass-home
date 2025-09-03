-- ==============================================
-- OPTIMISATION FINALE - CORRECTION POSTGRESQL
-- ==============================================

-- Contraintes de sécurité et intégrité (avec vérification d'existence)
DO $$
BEGIN
  -- Contrainte unique QR token (CRITICAL pour sécurité)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'unique_qr_token' 
    AND table_name = 'passes'
  ) THEN
    ALTER TABLE public.passes 
    ADD CONSTRAINT unique_qr_token UNIQUE (qr_token);
  END IF;

  -- Éviter doublons favoris
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'unique_user_offer_favorite' 
    AND table_name = 'favorites'
  ) THEN
    ALTER TABLE public.favorites 
    ADD CONSTRAINT unique_user_offer_favorite UNIQUE (user_id, offer_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'unique_user_partner_favorite' 
    AND table_name = 'partner_favorites'
  ) THEN
    ALTER TABLE public.partner_favorites 
    ADD CONSTRAINT unique_user_partner_favorite UNIQUE (user_id, partner_id);
  END IF;
END $$;

-- ==============================================
-- POLITIQUES RLS NETTOYÉES ET OPTIMISÉES
-- ==============================================

-- Supprimer toutes les anciennes politiques profiles
DROP POLICY IF EXISTS "Only super admins can delete profiles" ON public.profiles;
DROP POLICY IF EXISTS "Super admins have full access to profiles" ON public.profiles;

-- Politiques finales ultra-simples et performantes
CREATE POLICY "profiles_user_access" ON public.profiles
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "passes_user_access" ON public.passes  
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ==============================================
-- FONCTIONS DE MAINTENANCE ET PERFORMANCE
-- ==============================================

-- Fonction maintenance passes expirés
CREATE OR REPLACE FUNCTION public.cleanup_expired_passes()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  updated_count integer;
BEGIN
  UPDATE public.passes 
  SET status = 'expired'
  WHERE status = 'active' 
  AND expires_at < now();
  
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count;
END;
$$;

-- Fonction recherche rapide (syntaxe PostgreSQL correcte)
CREATE OR REPLACE FUNCTION public.fast_search_offers(
  search_text text DEFAULT '',
  category_uuid uuid DEFAULT NULL,
  limit_count integer DEFAULT 20
)
RETURNS TABLE (
  offer_id uuid,
  offer_title text,
  partner_name text,
  category_name text,
  is_featured boolean
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
    o.is_featured
  FROM public.offers o
  INNER JOIN public.partners p ON p.id = o.partner_id
  INNER JOIN public.categories c ON c.id = o.category_id
  WHERE 
    o.is_active = true 
    AND p.status = 'approved'
    AND (search_text = '' OR o.title ILIKE '%' || search_text || '%')
    AND (category_uuid IS NULL OR o.category_id = category_uuid)
  ORDER BY o.is_featured DESC, o.created_at DESC
  LIMIT limit_count;
$$;
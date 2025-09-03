-- ==============================================
-- OPTIMISATION FINALE COMPLÈTE
-- ==============================================

-- 1. CONTRAINTES DE SÉCURITÉ
DO $$
BEGIN
  -- QR token unique (SÉCURITÉ CRITIQUE)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'unique_qr_token' 
    AND table_name = 'passes'
  ) THEN
    ALTER TABLE public.passes 
    ADD CONSTRAINT unique_qr_token UNIQUE (qr_token);
  END IF;

  -- Favoris uniques
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

-- 2. SUPPRESSION ET RECRÉATION DE FONCTIONS
DROP FUNCTION IF EXISTS public.cleanup_expired_passes();

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

-- 3. FONCTION DE STATISTIQUES PARTENAIRES
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
    'total_redemptions', COALESCE((
      SELECT COUNT(r.id) 
      FROM public.redemptions r 
      WHERE r.partner_id = partner_uuid
    ), 0)
  ) INTO result
  FROM public.offers o
  WHERE o.partner_id = partner_uuid;
  
  RETURN result;
END;
$$;
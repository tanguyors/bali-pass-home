-- ==============================================
-- CORRECTION DES AVERTISSEMENTS DE SÉCURITÉ
-- ==============================================

-- Corriger les fonctions avec search_path sécurisé
CREATE OR REPLACE FUNCTION public.cleanup_expired_passes()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

CREATE OR REPLACE FUNCTION public.get_partner_stats(partner_uuid uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public
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
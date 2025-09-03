-- ==============================================
-- CORRECTIFS DE SÉCURITÉ LINTER
-- ==============================================

-- 1. Corriger la vue avec SECURITY DEFINER (remplacer par vue normale)
DROP VIEW IF EXISTS public.quick_stats;
CREATE VIEW public.quick_stats WITH (security_barrier = false) AS
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

-- 2. Corriger les fonctions avec search_path manquant
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
SET search_path = public
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

CREATE OR REPLACE FUNCTION public.daily_maintenance()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Nettoyer passes expirés
  UPDATE passes 
  SET status = 'expired'
  WHERE status = 'active' 
  AND expires_at < now();
END;
$$;

CREATE OR REPLACE FUNCTION public.cleanup_expired_passes()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE passes 
  SET status = 'expired'
  WHERE status = 'active' 
  AND expires_at < now();
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
    'total_redemptions', (
      SELECT COUNT(r.id) 
      FROM redemptions r 
      WHERE r.partner_id = partner_uuid
    )
  ) INTO result
  FROM offers o
  WHERE o.partner_id = partner_uuid;
  
  RETURN result;
END;
$$;
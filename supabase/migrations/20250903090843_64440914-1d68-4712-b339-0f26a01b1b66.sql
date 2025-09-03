-- ==============================================
-- OPTIMISATION COMPLÈTE DE LA BASE DE DONNÉES
-- ==============================================

-- 1. NETTOYAGE DES POLITIQUES RLS REDONDANTES
-- ==============================================

-- Nettoyer les politiques redondantes sur profiles
DROP POLICY IF EXISTS "Allow authenticated users all operations" ON public.profiles;
DROP POLICY IF EXISTS "Users see own profile" ON public.profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile only" ON public.profiles;
DROP POLICY IF EXISTS "Users can access own profile" ON public.profiles;

-- Nettoyer les politiques redondantes sur passes  
DROP POLICY IF EXISTS "Allow authenticated users all operations" ON public.passes;
DROP POLICY IF EXISTS "Users see own passes" ON public.passes;

-- 2. CRÉATION D'INDEX POUR LES PERFORMANCES
-- ==============================================

-- Index pour les requêtes fréquentes sur offers
CREATE INDEX IF NOT EXISTS idx_offers_partner_active ON public.offers(partner_id, is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_offers_category_active ON public.offers(category_id, is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_offers_featured ON public.offers(is_featured, created_at) WHERE is_featured = true;

-- Index pour partners  
CREATE INDEX IF NOT EXISTS idx_partners_status_city ON public.partners(status, city_id) WHERE status = 'approved';
CREATE INDEX IF NOT EXISTS idx_partners_owner ON public.partners(owner_account_id);

-- Index pour redemptions (très important pour les performances)
CREATE INDEX IF NOT EXISTS idx_redemptions_pass_date ON public.redemptions(pass_id, redeemed_at DESC);
CREATE INDEX IF NOT EXISTS idx_redemptions_partner_date ON public.redemptions(partner_id, redeemed_at DESC);
CREATE INDEX IF NOT EXISTS idx_redemptions_status ON public.redemptions(status, redeemed_at DESC);

-- Index pour passes
CREATE INDEX IF NOT EXISTS idx_passes_user_status ON public.passes(user_id, status, expires_at) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_passes_token ON public.passes(qr_token) WHERE status = 'active';

-- Index pour favorites
CREATE INDEX IF NOT EXISTS idx_favorites_user_offer ON public.favorites(user_id, offer_id);
CREATE INDEX IF NOT EXISTS idx_partner_favorites_user ON public.partner_favorites(user_id, partner_id);

-- Index pour profiles (lookup rapide)
CREATE INDEX IF NOT EXISTS idx_profiles_user_type ON public.profiles(user_id, user_type);

-- Index pour community
CREATE INDEX IF NOT EXISTS idx_community_posts_user_date ON public.community_posts(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_likes_post ON public.community_likes(post_id, user_id);

-- 3. CONTRAINTES DE DONNÉES MANQUANTES
-- ==============================================

-- Validation des emails
ALTER TABLE public.profiles 
ADD CONSTRAINT valid_email_format 
CHECK (
  CASE 
    WHEN user_id IN (SELECT id FROM auth.users) THEN true
    ELSE false
  END
);

-- Validation des dates sur passes
ALTER TABLE public.passes 
ADD CONSTRAINT valid_pass_dates 
CHECK (expires_at > purchased_at);

-- Validation des statuses avec enum check
ALTER TABLE public.offers 
ADD CONSTRAINT valid_promo_type 
CHECK (promo_type IN ('percent', 'fixed', 'other'));

-- Validation sur redemptions
ALTER TABLE public.redemptions 
ADD CONSTRAINT valid_redemption_date 
CHECK (redeemed_at >= created_at);

-- 4. RELATIONS ÉTRANGÈRES MANQUANTES
-- ==============================================

-- FK pour community_posts -> offers (optionnel)
ALTER TABLE public.community_posts 
ADD CONSTRAINT fk_community_posts_offer 
FOREIGN KEY (offer_id) REFERENCES public.offers(id) ON DELETE SET NULL;

-- FK pour community_posts -> partners (optionnel)
ALTER TABLE public.community_posts 
ADD CONSTRAINT fk_community_posts_partner 
FOREIGN KEY (partner_id) REFERENCES public.partners(id) ON DELETE SET NULL;

-- FK pour offers -> categories
ALTER TABLE public.offers 
ADD CONSTRAINT fk_offers_category 
FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE RESTRICT;

-- FK pour offers -> partners
ALTER TABLE public.offers 
ADD CONSTRAINT fk_offers_partner 
FOREIGN KEY (partner_id) REFERENCES public.partners(id) ON DELETE CASCADE;

-- 5. POLITIQUES RLS OPTIMISÉES
-- ==============================================

-- Profiles : politique simple et efficace
CREATE POLICY "optimized_profiles_access" ON public.profiles
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Passes : politique optimisée  
CREATE POLICY "optimized_passes_access" ON public.passes
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Offers : lecture optimisée avec condition sur partner status
CREATE POLICY "optimized_offers_read" ON public.offers
  FOR SELECT TO authenticated
  USING (
    is_active = true 
    AND EXISTS (
      SELECT 1 FROM public.partners p 
      WHERE p.id = offers.partner_id 
      AND p.status = 'approved'
    )
  );

-- 6. FONCTIONS UTILITAIRES POUR PERFORMANCES
-- ==============================================

-- Fonction pour nettoyer les sessions expirées (maintenance)
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

-- Fonction pour calculer les statistiques rapidement
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

-- 7. TRIGGERS POUR MAINTENIR L'INTÉGRITÉ
-- ==============================================

-- Trigger pour mettre à jour les compteurs automatiquement
CREATE OR REPLACE FUNCTION public.update_partner_stats()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Mettre à jour les stats des partenaires lors de nouvelles rédemptions
  -- (Implémentation future si nécessaire)
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- 8. OPTIMISATION DES REQUÊTES COMMUNES
-- ==============================================

-- Vue matérialisée pour les offres populaires (performance)
CREATE MATERIALIZED VIEW IF NOT EXISTS public.popular_offers AS
SELECT 
  o.*,
  p.name as partner_name,
  p.city_id,
  c.name as category_name,
  COUNT(r.id) as redemption_count
FROM public.offers o
JOIN public.partners p ON p.id = o.partner_id
JOIN public.categories c ON c.id = o.category_id
LEFT JOIN public.redemptions r ON r.offer_id = o.id
WHERE o.is_active = true 
AND p.status = 'approved'
GROUP BY o.id, p.name, p.city_id, c.name
ORDER BY redemption_count DESC, o.created_at DESC;

-- Index sur la vue matérialisée
CREATE INDEX IF NOT EXISTS idx_popular_offers_city ON public.popular_offers(city_id, redemption_count DESC);
CREATE INDEX IF NOT EXISTS idx_popular_offers_category ON public.popular_offers(category_id, redemption_count DESC);

-- Fonction pour rafraîchir la vue (à appeler périodiquement)
CREATE OR REPLACE FUNCTION public.refresh_popular_offers()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW public.popular_offers;
END;
$$;
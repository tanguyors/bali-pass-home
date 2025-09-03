-- ==============================================
-- PHASE 2: INDEX DE PERFORMANCE CRITIQUES
-- ==============================================

-- Index pour les requêtes fréquentes sur offers (performance critique)
CREATE INDEX IF NOT EXISTS idx_offers_partner_active ON public.offers(partner_id, is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_offers_category_active ON public.offers(category_id, is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_offers_featured ON public.offers(is_featured, created_at) WHERE is_featured = true;

-- Index pour partners (améliore les requêtes de listing)
CREATE INDEX IF NOT EXISTS idx_partners_status_city ON public.partners(status, city_id) WHERE status = 'approved';
CREATE INDEX IF NOT EXISTS idx_partners_owner ON public.partners(owner_account_id);

-- Index pour redemptions (très important pour l'historique)
CREATE INDEX IF NOT EXISTS idx_redemptions_pass_date ON public.redemptions(pass_id, redeemed_at DESC);
CREATE INDEX IF NOT EXISTS idx_redemptions_partner_date ON public.redemptions(partner_id, redeemed_at DESC);
CREATE INDEX IF NOT EXISTS idx_redemptions_status ON public.redemptions(status, redeemed_at DESC);

-- Index pour passes (critical pour QR lookup)
CREATE INDEX IF NOT EXISTS idx_passes_user_status ON public.passes(user_id, status, expires_at) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_passes_token ON public.passes(qr_token) WHERE status = 'active';

-- Index pour favorites (performance des listes)
CREATE INDEX IF NOT EXISTS idx_favorites_user_offer ON public.favorites(user_id, offer_id);
CREATE INDEX IF NOT EXISTS idx_partner_favorites_user ON public.partner_favorites(user_id, partner_id);

-- Index pour profiles (lookup rapide)
CREATE INDEX IF NOT EXISTS idx_profiles_user_type ON public.profiles(user_id, user_type);

-- Index pour community (feed performance)
CREATE INDEX IF NOT EXISTS idx_community_posts_user_date ON public.community_posts(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_likes_post ON public.community_likes(post_id, user_id);
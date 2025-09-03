-- ==============================================
-- PHASE 3A: CORRECTION DES DONNÉES INVALIDES
-- ==============================================

-- Corriger les données invalides dans redemptions
-- Mettre redeemed_at = created_at pour les lignes où redeemed_at < created_at
UPDATE public.redemptions 
SET redeemed_at = created_at 
WHERE redeemed_at < created_at;

-- Vérifier et corriger les passes avec des dates invalides
UPDATE public.passes 
SET expires_at = purchased_at + interval '1 year'
WHERE expires_at <= purchased_at;
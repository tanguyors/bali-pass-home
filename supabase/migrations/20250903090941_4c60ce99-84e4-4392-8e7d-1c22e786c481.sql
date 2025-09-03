-- ==============================================
-- PHASE 1: NETTOYAGE DES POLITIQUES RLS REDONDANTES
-- ==============================================

-- Nettoyer les politiques redondantes sur profiles
DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Deny anonymous access to profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can manage their own profile" ON public.profiles;

-- Nettoyer les politiques redondantes sur passes  
DROP POLICY IF EXISTS "Admins can view all passes" ON public.passes;
DROP POLICY IF EXISTS "Partners can view passes for QR validation" ON public.passes;
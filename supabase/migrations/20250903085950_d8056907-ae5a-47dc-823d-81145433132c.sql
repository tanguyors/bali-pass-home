-- Simplifier les policies RLS pour éviter les timeouts
-- Supprimer les policies existantes pour profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

-- Créer des policies ultra-simples pour profiles
CREATE POLICY "Enable all for authenticated users" ON public.profiles
  FOR ALL
  USING (auth.uid() IS NOT NULL);

-- Supprimer les policies existantes pour passes
DROP POLICY IF EXISTS "Users can view their own passes" ON public.passes;
DROP POLICY IF EXISTS "Users can insert their own passes" ON public.passes;
DROP POLICY IF EXISTS "Users can update their own passes" ON public.passes;

-- Créer des policies ultra-simples pour passes
CREATE POLICY "Enable all for authenticated users" ON public.passes
  FOR ALL
  USING (auth.uid() IS NOT NULL);

-- Désactiver RLS temporairement sur les tables problématiques
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.passes DISABLE ROW LEVEL SECURITY;
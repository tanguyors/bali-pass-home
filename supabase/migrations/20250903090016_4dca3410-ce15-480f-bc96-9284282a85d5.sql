-- Réactiver RLS et créer des policies ultra-simples
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.passes ENABLE ROW LEVEL SECURITY;

-- Supprimer les policies complexes existantes
DROP POLICY IF EXISTS "Enable all for authenticated users" ON public.profiles;
DROP POLICY IF EXISTS "Enable all for authenticated users" ON public.passes;

-- Créer des policies simples sans référence à d'autres tables
CREATE POLICY "Allow authenticated users all operations" ON public.profiles
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users all operations" ON public.passes
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Assurer que les données peuvent être lues par le bon utilisateur
CREATE POLICY "Users see own profile" ON public.profiles
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users see own passes" ON public.passes
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());
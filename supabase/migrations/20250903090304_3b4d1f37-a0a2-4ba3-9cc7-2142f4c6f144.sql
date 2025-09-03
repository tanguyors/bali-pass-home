-- Supprimer TOUTES les politiques sur profiles et passes pour éviter les conflits
DROP POLICY IF EXISTS "Allow authenticated users all operations" ON public.profiles;
DROP POLICY IF EXISTS "Users see own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow authenticated users all operations" ON public.passes;
DROP POLICY IF EXISTS "Users see own passes" ON public.passes;

-- Créer UNE SEULE politique simple par table
CREATE POLICY "authenticated_full_access" ON public.profiles
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "authenticated_full_access" ON public.passes
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
-- Simplify profiles RLS policies to fix performance issues
-- Drop conflicting policies
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON profiles;
DROP POLICY IF EXISTS "Users can only view authorized profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile only" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile only" ON profiles;
DROP POLICY IF EXISTS "Employees can view affiliated users profiles" ON profiles;
DROP POLICY IF EXISTS "Authenticated users can view basic profile info for community" ON profiles;

-- Create simplified policies
CREATE POLICY "Users can manage their own profile"
ON profiles
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all profiles"
ON profiles
FOR ALL
USING (has_role_or_higher(auth.uid(), 'content_admin'::app_role))
WITH CHECK (has_role_or_higher(auth.uid(), 'content_admin'::app_role));
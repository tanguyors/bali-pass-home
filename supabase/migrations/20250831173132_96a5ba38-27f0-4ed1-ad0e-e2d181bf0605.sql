-- Allow authenticated users to view basic profile information for community features
CREATE POLICY "Authenticated users can view basic profile info for community"
ON public.profiles
FOR SELECT
TO authenticated
USING (true);
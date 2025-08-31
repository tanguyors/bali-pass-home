-- Create storage bucket for community photos
INSERT INTO storage.buckets (id, name, public) VALUES ('community-photos', 'community-photos', true);

-- Create RLS policies for community photos
CREATE POLICY "Authenticated users can upload community photos"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'community-photos');

CREATE POLICY "Community photos are publicly accessible"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'community-photos');

CREATE POLICY "Users can update their own community photos"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'community-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own community photos"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'community-photos' AND auth.uid()::text = (storage.foldername(name))[1]);
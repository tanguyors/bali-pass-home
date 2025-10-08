-- Add is_public column to travel_itineraries if it doesn't exist
ALTER TABLE travel_itineraries 
ADD COLUMN IF NOT EXISTS is_public boolean DEFAULT false;

-- Create index for better performance on public itineraries
CREATE INDEX IF NOT EXISTS idx_travel_itineraries_is_public 
ON travel_itineraries(is_public) 
WHERE is_public = true;

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Public itineraries are viewable by anyone" ON travel_itineraries;

-- Create policy to allow public access to public itineraries
CREATE POLICY "Public itineraries are viewable by anyone"
ON travel_itineraries
FOR SELECT
USING (is_public = true);
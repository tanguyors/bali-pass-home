-- Add foreign key constraint to partner_favorites table
ALTER TABLE public.partner_favorites 
ADD CONSTRAINT partner_favorites_partner_id_fkey 
FOREIGN KEY (partner_id) REFERENCES public.partners(id) ON DELETE CASCADE;
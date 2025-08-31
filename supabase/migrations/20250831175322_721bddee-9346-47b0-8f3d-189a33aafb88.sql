-- Create partner favorites table
CREATE TABLE public.partner_favorites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  partner_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, partner_id)
);

-- Enable Row Level Security
ALTER TABLE public.partner_favorites ENABLE ROW LEVEL SECURITY;

-- Create policies for partner favorites
CREATE POLICY "Users can manage their own partner favorites" 
ON public.partner_favorites 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_partner_favorites_updated_at
BEFORE UPDATE ON public.partner_favorites
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
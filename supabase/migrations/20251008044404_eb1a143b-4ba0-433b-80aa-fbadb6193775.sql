-- Ajouter la colonne share_token si elle n'existe pas
ALTER TABLE travel_itineraries 
ADD COLUMN IF NOT EXISTS share_token TEXT UNIQUE;

-- Créer un index pour les recherches par token
CREATE INDEX IF NOT EXISTS idx_travel_itineraries_share_token 
ON travel_itineraries(share_token) 
WHERE share_token IS NOT NULL;

-- Fonction pour générer un token de partage unique
CREATE OR REPLACE FUNCTION public.generate_share_token()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_token TEXT;
  token_exists BOOLEAN;
BEGIN
  LOOP
    -- Générer un token de 10 caractères alphanumériques
    new_token := UPPER(SUBSTRING(MD5(random()::text || clock_timestamp()::text), 1, 10));
    
    -- Vérifier si le token existe déjà
    SELECT EXISTS(SELECT 1 FROM travel_itineraries WHERE share_token = new_token) INTO token_exists;
    
    IF NOT token_exists THEN
      EXIT;
    END IF;
  END LOOP;
  
  RETURN new_token;
END;
$$;

-- Mettre à jour la politique RLS pour permettre l'accès par token
DROP POLICY IF EXISTS "Public itineraries accessible by token" ON travel_itineraries;

CREATE POLICY "Public itineraries accessible by token"
ON travel_itineraries
FOR SELECT
USING (
  is_public = true 
  AND share_token IS NOT NULL
);
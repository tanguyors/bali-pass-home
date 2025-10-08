-- Modifier la fonction pour générer des tokens courts et professionnels
CREATE OR REPLACE FUNCTION public.generate_share_token()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_token TEXT;
  token_exists BOOLEAN;
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; -- Évite les caractères ambigus comme 0, O, 1, I
  token_length INT := 5;
  i INT;
  random_string TEXT := '';
BEGIN
  LOOP
    -- Générer une chaîne aléatoire de 5 caractères
    random_string := '';
    FOR i IN 1..token_length LOOP
      random_string := random_string || SUBSTR(chars, 1 + (random() * (LENGTH(chars) - 1))::INT, 1);
    END LOOP;
    
    -- Créer le token au format BP-XXXXX (BaliPass)
    new_token := 'BP-' || random_string;
    
    -- Vérifier si le token existe déjà
    SELECT EXISTS(SELECT 1 FROM travel_itineraries WHERE share_token = new_token) INTO token_exists;
    
    IF NOT token_exists THEN
      EXIT;
    END IF;
  END LOOP;
  
  RETURN new_token;
END;
$$;
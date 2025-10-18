import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Languages, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function TranslateOffersButton() {
  const [isTranslating, setIsTranslating] = useState(false);
  const { toast } = useToast();

  const handleTranslate = async () => {
    setIsTranslating(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('translate-offers');
      
      if (error) throw error;
      
      toast({
        title: "Traduction terminée",
        description: `${data.translatedCount} champs traduits, ${data.skippedCount} déjà traduits`,
      });
    } catch (error: any) {
      toast({
        title: "Erreur de traduction",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsTranslating(false);
    }
  };

  return (
    <Button
      onClick={handleTranslate}
      disabled={isTranslating}
      className="gap-2"
    >
      {isTranslating ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          Traduction en cours...
        </>
      ) : (
        <>
          <Languages className="w-4 h-4" />
          Traduire toutes les offres
        </>
      )}
    </Button>
  );
}

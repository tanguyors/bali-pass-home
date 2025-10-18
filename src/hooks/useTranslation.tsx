import { useLanguage } from "@/contexts/LanguageContext";

export function useTranslation() {
  const { t, language } = useLanguage();

  const getTranslatedText = (
    baseText: string | null | undefined,
    translations: {
      en?: string | null;
      es?: string | null;
      id?: string | null;
      zh?: string | null;
    }
  ): string => {
    // Si on est en français, toujours retourner le texte de base (qui est en français)
    if (language === 'fr') return baseText || '';
    
    // Pour les autres langues, utiliser la traduction si disponible, sinon le texte de base
    if (language === 'en' && translations.en) return translations.en;
    if (language === 'es' && translations.es) return translations.es;
    if (language === 'id' && translations.id) return translations.id;
    if (language === 'zh' && translations.zh) return translations.zh;
    
    // Fallback sur le texte de base
    return baseText || '';
  };

  return { t, language, getTranslatedText };
}

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
    if (language === 'en' && translations.en) return translations.en;
    if (language === 'es' && translations.es) return translations.es;
    if (language === 'id' && translations.id) return translations.id;
    if (language === 'zh' && translations.zh) return translations.zh;
    return baseText || '';
  };

  return { t, language, getTranslatedText };
}

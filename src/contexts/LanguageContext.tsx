import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { locales, SupportedLanguage, getNestedValue } from '@/locales';

interface LanguageContextType {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = 'bali-pass-language';
const DEFAULT_LANGUAGE: SupportedLanguage = 'en'; // Anglais par défaut pour l'audience internationale

interface LanguageProviderProps {
  children: ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [language, setLanguageState] = useState<SupportedLanguage>(() => {
    try {
      // Récupérer la langue depuis localStorage ou utiliser la langue par défaut
      const savedLanguage = localStorage.getItem(STORAGE_KEY) as SupportedLanguage;
      return savedLanguage && locales[savedLanguage] ? savedLanguage : DEFAULT_LANGUAGE;
    } catch (error) {
      console.warn('Error accessing localStorage for language preference:', error);
      return DEFAULT_LANGUAGE;
    }
  });

  // Sauvegarder dans localStorage quand la langue change
  const setLanguage = (lang: SupportedLanguage) => {
    try {
      setLanguageState(lang);
      localStorage.setItem(STORAGE_KEY, lang);
    } catch (error) {
      console.warn('Error saving language preference to localStorage:', error);
      setLanguageState(lang);
    }
  };

  // Fonction de traduction avec système de fallback
  const t = (key: string): string => {
    try {
      // 1. Essayer dans la langue courante
      const currentLangValue = getNestedValue(locales[language], key);
      if (currentLangValue !== key) {
        return currentLangValue;
      }

      // 2. Fallback vers le français
      if (language !== 'fr') {
        const frenchValue = getNestedValue(locales.fr, key);
        if (frenchValue !== key) {
          return frenchValue;
        }
      }

      // 3. Fallback vers l'anglais si ce n'est pas la langue courante
      if (language !== 'en') {
        const englishValue = getNestedValue(locales.en, key);
        if (englishValue !== key) {
          return englishValue;
        }
      }

      // 4. Retourner la clé si aucune traduction n'est trouvée
      return key;
    } catch (error) {
      console.warn('Translation error for key:', key, error);
      return key;
    }
  };

  const value: LanguageContextType = {
    language,
    setLanguage,
    t,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    console.error('useLanguage must be used within a LanguageProvider. Providing fallback.');
    // Provide a fallback to prevent crashes
    return {
      language: DEFAULT_LANGUAGE,
      setLanguage: () => console.warn('setLanguage called outside provider'),
      t: (key: string) => key,
    };
  }
  return context;
}
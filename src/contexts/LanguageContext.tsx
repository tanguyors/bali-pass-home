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
    // Récupérer la langue depuis localStorage ou utiliser la langue par défaut
    const savedLanguage = localStorage.getItem(STORAGE_KEY) as SupportedLanguage;
    return savedLanguage && locales[savedLanguage] ? savedLanguage : DEFAULT_LANGUAGE;
  });

  // Sauvegarder dans localStorage quand la langue change
  const setLanguage = (lang: SupportedLanguage) => {
    setLanguageState(lang);
    localStorage.setItem(STORAGE_KEY, lang);
  };

  // Fonction de traduction avec système de fallback
  const t = (key: string): string => {
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
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
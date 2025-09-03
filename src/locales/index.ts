import { fr } from './fr';
import { en } from './en';
import { es } from './es';
import { id } from './id';
import { zh } from './zh';

export const locales = {
  fr,
  en,
  es,
  id,
  zh,
};

export type SupportedLanguage = keyof typeof locales;
export type TranslationKeys = keyof typeof fr;

// Function to get nested translation value
export function getNestedValue(obj: any, path: string): string {
  return path.split('.').reduce((current, key) => current?.[key], obj) || path;
}
import React from 'react';
import { Globe } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useLanguage } from '@/contexts/LanguageContext';
import { SupportedLanguage } from '@/locales';

interface LanguageSelectorProps {
  variant?: 'default' | 'mobile';
  className?: string;
}

const languageConfig = {
  fr: { flag: '🇫🇷', name: 'Français' },
  en: { flag: '🇺🇸', name: 'English' },
  es: { flag: '🇪🇸', name: 'Español' },
  id: { flag: '🇮🇩', name: 'Bahasa Indonesia' },
  zh: { flag: '🇨🇳', name: '中文' },
};

export function LanguageSelector({ variant = 'default', className = '' }: LanguageSelectorProps) {
  const { language, setLanguage, t } = useLanguage();

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage as SupportedLanguage);
  };

  const currentLanguageConfig = languageConfig[language];

  return (
    <Select value={language} onValueChange={handleLanguageChange}>
      <SelectTrigger 
        className={`w-auto gap-2 border-border/50 hover:border-border transition-colors ${className}`}
      >
        <Globe className="w-4 h-4 opacity-80" />
        <SelectValue>
          <div className="flex items-center gap-2">
            <span className="text-sm">{currentLanguageConfig.flag}</span>
            {variant === 'default' && (
              <span className="text-sm font-medium hidden sm:inline">
                {currentLanguageConfig.name}
              </span>
            )}
          </div>
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="bg-background/95 backdrop-blur-lg border-border/60">
        {Object.entries(languageConfig).map(([code, config]) => (
          <SelectItem key={code} value={code}>
            <div className="flex items-center gap-3">
              <span className="text-base">{config.flag}</span>
              <span className="font-medium">{config.name}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
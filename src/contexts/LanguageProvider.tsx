'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { en } from '@/locales/en';
import { id } from '@/locales/id';
import { zh } from '@/locales/zh';
import { ja } from '@/locales/ja';

const LANGUAGE_KEY = 'bito-ai-language';

const translations = { en, id, zh, ja };

type Language = keyof typeof translations;

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: keyof typeof en, replacements?: { [key: string]: string | number }) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>('id');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const savedLanguage = localStorage.getItem(LANGUAGE_KEY) as Language | null;
    if (savedLanguage && translations[savedLanguage]) {
      setLanguageState(savedLanguage);
    }
    setIsMounted(true);
  }, []);

  const setLanguage = useCallback((lang: Language) => {
    if (translations[lang]) {
      setLanguageState(lang);
      localStorage.setItem(LANGUAGE_KEY, lang);
      window.dispatchEvent(new StorageEvent('storage', { key: LANGUAGE_KEY, newValue: lang }));
    }
  }, []);

  const t = useCallback((key: keyof typeof en, replacements?: { [key: string]: string | number }) => {
    if (!isMounted) return ''; // Prevent hydration mismatch

    let translation = translations[language]?.[key] || translations.en[key] || key;

    if (replacements) {
      Object.keys(replacements).forEach(placeholder => {
        const regex = new RegExp(`{{${placeholder}}}`, 'g');
        translation = translation.replace(regex, String(replacements[placeholder]));
      });
    }

    return translation;
  }, [language, isMounted]);

  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === LANGUAGE_KEY && event.newValue && translations[event.newValue as Language]) {
        setLanguageState(event.newValue as Language);
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const value = { language, setLanguage, t };

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

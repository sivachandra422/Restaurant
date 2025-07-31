'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Language, detectLanguage, languageNames } from '@/lib/translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  languageNames: typeof languageNames;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Detect language on mount
    const detectedLanguage = detectLanguage();
    setLanguageState(detectedLanguage);
    setIsInitialized(true);
  }, []);

  const setLanguage = (newLanguage: Language) => {
    setLanguageState(newLanguage);
    if (typeof window !== 'undefined') {
      localStorage.setItem('sriKanyaLanguage', newLanguage);
      // Update document language for accessibility
      document.documentElement.lang = newLanguage;
    }
  };

  // Update document language when language changes
  useEffect(() => {
    if (isInitialized && typeof window !== 'undefined') {
      document.documentElement.lang = language;
    }
  }, [language, isInitialized]);

  const value: LanguageContextType = {
    language,
    setLanguage,
    languageNames,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
} 
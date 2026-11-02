import React, { createContext, useContext, useState, useEffect } from 'react';
import { ar } from './ar';
import { en } from './en';
import { Language, Theme } from '../types';

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: typeof ar;
  dir: 'rtl' | 'ltr';
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    return (localStorage.getItem('datasolu_lang') as Language) || 'ar';
  });

  const [theme, setTheme] = useState<Theme>(() => {
    return (localStorage.getItem('datasolu_theme') as Theme) || 'light';
  });

  useEffect(() => {
    localStorage.setItem('datasolu_lang', language);
    const dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.setAttribute('dir', dir);
    document.documentElement.setAttribute('lang', language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem('datasolu_theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === 'ar' ? 'en' : 'ar'));
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const dir = language === 'ar' ? 'rtl' : 'ltr';
  const t = language === 'ar' ? ar : (en as unknown as typeof ar);

  return (
    <I18nContext.Provider
      value={{
        language,
        setLanguage,
        toggleLanguage,
        t,
        dir,
        theme,
        setTheme,
        toggleTheme,
      }}
    >
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = () => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
};

import { useState, useEffect } from 'react';
import { Language } from '../types';

export function getBrowserLocale(): Language {
  if (typeof window === 'undefined' || !navigator) {
    return 'en';
  }

  // Check user saved preference in localStorage if previously set
  try {
    const saved = localStorage.getItem('rajan_app_language') as Language | null;
    if (saved && ['en', 'hi', 'gu', 'mr', 'ta', 'te', 'pa', 'bn', 'ur'].includes(saved)) {
      return saved;
    }
  } catch (e) {
    // ignore storage access errors
  }

  // Detect browser language preferences
  const languages = navigator.languages || [navigator.language || ''];
  const isHindiAvailable = languages.some((lang) => lang && lang.toLowerCase().startsWith('hi'));

  return isHindiAvailable ? 'hi' : 'en';
}

export function useBrowserLocale(): [Language, (lang: Language | ((prev: Language) => Language)) => void] {
  const [currentLang, setCurrentLangState] = useState<Language>(() => getBrowserLocale());

  useEffect(() => {
    // Automatically detect on mount if no explicit saved language
    try {
      const saved = localStorage.getItem('rajan_app_language');
      if (!saved) {
        const detected = getBrowserLocale();
        setCurrentLangState(detected);
      }
    } catch (e) {
      // ignore
    }
  }, []);

  const setCurrentLang = (action: Language | ((prev: Language) => Language)) => {
    setCurrentLangState((prev) => {
      const next = typeof action === 'function' ? action(prev) : action;
      try {
        localStorage.setItem('rajan_app_language', next);
      } catch (e) {
        // ignore storage errors
      }
      return next;
    });
  };

  return [currentLang, setCurrentLang];
}

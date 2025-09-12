import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { apiRequest } from '@/lib/queryClient';

type Language = 'en' | 'pt' | 'tet';

interface TranslationCache {
  [key: string]: {
    [targetLang in Language]?: string;
  };
}

interface TranslationContextType {
  currentLanguage: Language;
  setLanguage: (language: Language) => void;
  translate: (text: string, targetLanguage?: Language) => Promise<string>;
  translateBulk: (texts: string[], targetLanguage?: Language) => Promise<string[]>;
  getTranslation: (text: string, targetLanguage?: Language) => string | null;
  isTranslating: boolean;
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

interface TranslationProviderProps {
  children: React.ReactNode;
}

const MAX_CACHE_SIZE = 1000; // Limit cache to 1000 entries to prevent memory issues

export function TranslationProvider({ children }: TranslationProviderProps) {
  const [currentLanguage, setCurrentLanguage] = useState<Language>('en');
  const [translationCache, setTranslationCache] = useState<TranslationCache>({});
  const [isTranslating, setIsTranslating] = useState(false);

  const setLanguage = useCallback((language: Language) => {
    setCurrentLanguage(language);
    localStorage.setItem('selectedLanguage', language);
  }, []);

  // Load saved language on mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem('selectedLanguage') as Language;
    if (savedLanguage && ['en', 'pt', 'tet'].includes(savedLanguage)) {
      setCurrentLanguage(savedLanguage);
    }
  }, []);

  const getCacheKey = (text: string): string => {
    return text.trim().toLowerCase();
  };

  const getTranslation = useCallback((text: string, targetLanguage?: Language): string | null => {
    const lang = targetLanguage || currentLanguage;
    if (lang === 'en') return text; // English is the default
    
    const cacheKey = getCacheKey(text);
    return translationCache[cacheKey]?.[lang] || null;
  }, [currentLanguage, translationCache]);

  const translate = useCallback(async (text: string, targetLanguage?: Language): Promise<string> => {
    const lang = targetLanguage || currentLanguage;
    
    // Return original text if target is English
    if (lang === 'en') return text;
    
    // Check cache first
    const cached = getTranslation(text, lang);
    if (cached) return cached;

    try {
      setIsTranslating(true);
      
      const response = await apiRequest('POST', '/api/translate', {
        text,
        targetLanguage: lang,
        sourceLanguage: 'en'
      });

      const result = await response.json();
      const translatedText = result.translatedText || text;

      // Cache the translation with size limit
      const cacheKey = getCacheKey(text);
      setTranslationCache(prev => {
        const newCache = {
          ...prev,
          [cacheKey]: {
            ...prev[cacheKey],
            [lang]: translatedText
          }
        };
        
        // If cache is getting too large, remove oldest entries
        const keys = Object.keys(newCache);
        if (keys.length > MAX_CACHE_SIZE) {
          const entriesToRemove = keys.slice(0, keys.length - MAX_CACHE_SIZE);
          entriesToRemove.forEach(key => delete newCache[key]);
        }
        
        return newCache;
      });

      return translatedText;
    } catch (error) {
      console.error('Translation failed:', error);
      return text; // Return original text on error
    } finally {
      setIsTranslating(false);
    }
  }, [currentLanguage, getTranslation]);

  const translateBulk = useCallback(async (texts: string[], targetLanguage?: Language): Promise<string[]> => {
    const lang = targetLanguage || currentLanguage;
    
    // Return original texts if target is English
    if (lang === 'en') return texts;

    // Check which texts need translation
    const textsToTranslate: string[] = [];
    const indexMap: number[] = [];
    const results: string[] = new Array(texts.length);

    texts.forEach((text, index) => {
      const cached = getTranslation(text, lang);
      if (cached) {
        results[index] = cached;
      } else {
        textsToTranslate.push(text);
        indexMap.push(index);
      }
    });

    // If all texts are cached, return them
    if (textsToTranslate.length === 0) {
      return results;
    }

    try {
      setIsTranslating(true);
      
      const response = await apiRequest('POST', '/api/translate/bulk', {
        texts: textsToTranslate,
        targetLanguage: lang
      });

      const result = await response.json();
      const translations = result.translations || textsToTranslate;

      // Cache translations and populate results
      translations.forEach((translation: string, i: number) => {
        const originalIndex = indexMap[i];
        const originalText = textsToTranslate[i];
        
        results[originalIndex] = translation;
        
        // Cache the translation with size limit
        const cacheKey = getCacheKey(originalText);
        setTranslationCache(prev => {
          const newCache = {
            ...prev,
            [cacheKey]: {
              ...prev[cacheKey],
              [lang]: translation
            }
          };
          
          // If cache is getting too large, remove oldest entries
          const keys = Object.keys(newCache);
          if (keys.length > MAX_CACHE_SIZE) {
            const entriesToRemove = keys.slice(0, keys.length - MAX_CACHE_SIZE);
            entriesToRemove.forEach(key => delete newCache[key]);
          }
          
          return newCache;
        });
      });

      return results;
    } catch (error) {
      console.error('Bulk translation failed:', error);
      // Fill remaining with original texts
      indexMap.forEach((originalIndex, i) => {
        if (!results[originalIndex]) {
          results[originalIndex] = textsToTranslate[i];
        }
      });
      return results;
    } finally {
      setIsTranslating(false);
    }
  }, [currentLanguage, getTranslation]);

  const value: TranslationContextType = {
    currentLanguage,
    setLanguage,
    translate,
    translateBulk,
    getTranslation,
    isTranslating
  };

  return (
    <TranslationContext.Provider value={value}>
      {children}
    </TranslationContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(TranslationContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }
  return context;
}
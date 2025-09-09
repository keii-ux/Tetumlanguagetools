import { useState, useEffect } from 'react';
import { useTranslation } from '@/contexts/TranslationContext';

interface UseTranslateTextOptions {
  fallback?: string;
  immediate?: boolean;
}

export function useTranslateText(text: string, options: UseTranslateTextOptions = {}) {
  const { fallback = text, immediate = true } = options;
  const { currentLanguage, translate, getTranslation, isTranslating } = useTranslation();
  const [translatedText, setTranslatedText] = useState<string>(fallback);
  const [localLoading, setLocalLoading] = useState(false);

  useEffect(() => {
    if (!text.trim()) {
      setTranslatedText(fallback);
      return;
    }

    // Check cache first
    const cached = getTranslation(text, currentLanguage);
    if (cached) {
      setTranslatedText(cached);
      return;
    }

    // If English, use original text
    if (currentLanguage === 'en') {
      setTranslatedText(text);
      return;
    }

    // Don't translate if not immediate
    if (!immediate) {
      setTranslatedText(fallback);
      return;
    }

    // Translate
    const translateText = async () => {
      setLocalLoading(true);
      try {
        const result = await translate(text, currentLanguage);
        setTranslatedText(result);
      } catch (error) {
        console.error('Translation error:', error);
        setTranslatedText(fallback);
      } finally {
        setLocalLoading(false);
      }
    };

    translateText();
  }, [text, currentLanguage, translate, getTranslation, fallback, immediate]);

  return {
    text: translatedText,
    isLoading: localLoading || isTranslating,
    originalText: text
  };
}

export function useTranslateTexts(texts: string[], options: UseTranslateTextOptions = {}) {
  const { immediate = true } = options;
  const { currentLanguage, translateBulk, getTranslation, isTranslating } = useTranslation();
  const [translatedTexts, setTranslatedTexts] = useState<string[]>(texts);
  const [localLoading, setLocalLoading] = useState(false);

  useEffect(() => {
    if (!texts.length) {
      setTranslatedTexts([]);
      return;
    }

    // If English, use original texts
    if (currentLanguage === 'en') {
      setTranslatedTexts(texts);
      return;
    }

    // Check if all texts are cached
    const allCached = texts.every(text => getTranslation(text, currentLanguage) !== null);
    if (allCached) {
      const cachedTexts = texts.map(text => getTranslation(text, currentLanguage) || text);
      setTranslatedTexts(cachedTexts);
      return;
    }

    // Don't translate if not immediate
    if (!immediate) {
      setTranslatedTexts(texts);
      return;
    }

    // Translate
    const translateTexts = async () => {
      setLocalLoading(true);
      try {
        const results = await translateBulk(texts, currentLanguage);
        setTranslatedTexts(results);
      } catch (error) {
        console.error('Bulk translation error:', error);
        setTranslatedTexts(texts);
      } finally {
        setLocalLoading(false);
      }
    };

    translateTexts();
  }, [texts, currentLanguage, translateBulk, getTranslation, immediate]);

  return {
    texts: translatedTexts,
    isLoading: localLoading || isTranslating,
    originalTexts: texts
  };
}
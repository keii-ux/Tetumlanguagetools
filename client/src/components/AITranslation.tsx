import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";

interface AITranslationProps {
  text: string;
  fromLang: string;
  toLang: string;
  label: string;
  bgColor: string;
  textColor: string;
  contentColor: string;
  borderColor: string;
}

export function AITranslation({ 
  text, 
  fromLang, 
  toLang, 
  label,
  bgColor,
  textColor,
  contentColor,
  borderColor
}: AITranslationProps) {
  const [translation, setTranslation] = useState("");
  const [isTranslating, setIsTranslating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let isCancelled = false;

    const translateText = async () => {
      if (!text || text.trim().length === 0) {
        setTranslation("");
        return;
      }

      setIsTranslating(true);
      setError("");

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

        const response = await fetch('/api/asean/translate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text: text.trim(),
            fromLanguage: fromLang,
            toLanguage: toLang
          }),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (isCancelled) return;

        if (!response.ok) {
          const errorText = await response.text().catch(() => 'Network error');
          throw new Error(`HTTP ${response.status}: ${errorText}`);
        }

        const data = await response.json();
        
        if (!isCancelled) {
          setTranslation(data.translation || text);
        }
      } catch (err: any) {
        if (isCancelled) return;
        
        console.warn('Translation error:', err.message || err);
        
        if (err.name === 'AbortError') {
          setError("Translation timeout");
        } else {
          setError("Translation unavailable");
        }
        setTranslation(text); // Fallback to original text
      } finally {
        if (!isCancelled) {
          setIsTranslating(false);
        }
      }
    };

    // Debounce translation requests
    const timeoutId = setTimeout(() => {
      translateText().catch(err => {
        console.warn('Async translation error:', err);
      });
    }, 500);

    return () => {
      isCancelled = true;
      clearTimeout(timeoutId);
    };
  }, [text, fromLang, toLang]);

  return (
    <div className={`${bgColor} rounded-lg p-3 border-l-4 ${borderColor}`}>
      <h4 className={`text-sm font-bold ${textColor} mb-1 flex items-center gap-2`}>
        {label}
        {isTranslating && <Loader2 className="h-3 w-3 animate-spin" />}
      </h4>
      <div className={`font-medium ${contentColor}`}>
        {isTranslating ? (
          <div className="flex items-center gap-2">
            <span className="opacity-50">Translating...</span>
            <Loader2 className="h-4 w-4 animate-spin opacity-50" />
          </div>
        ) : error ? (
          <span className="text-red-600 text-sm">{error}</span>
        ) : translation ? (
          <span>{translation}</span>
        ) : (
          <span className="opacity-50 text-sm">No translation available</span>
        )}
      </div>
      <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
        🤖 Google Translate API • INL Standards
      </p>
    </div>
  );
}
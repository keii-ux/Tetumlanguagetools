import { useTranslateText } from '@/hooks/useTranslateText';

interface TranslatedTextProps {
  text: string;
  fallback?: string;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
  immediate?: boolean;
}

export function TranslatedText({ 
  text, 
  fallback, 
  className = '', 
  as: Component = 'span',
  immediate = true 
}: TranslatedTextProps) {
  const { text: translatedText, isLoading } = useTranslateText(text, { 
    fallback: fallback || text, 
    immediate 
  });

  if (isLoading && immediate) {
    return (
      <Component className={`${className} opacity-75`}>
        {fallback || text}
      </Component>
    );
  }

  return (
    <Component className={className}>
      {translatedText}
    </Component>
  );
}
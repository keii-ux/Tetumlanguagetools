import OpenAI from 'openai';

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});

interface TranslationRequest {
  text: string;
  targetLanguage: 'tet' | 'pt' | 'en';
  sourceLanguage?: string;
}

interface TranslationResponse {
  translatedText: string;
  sourceLanguage: string;
  targetLanguage: string;
}

export async function translateText(request: TranslationRequest): Promise<TranslationResponse> {
  const { text, targetLanguage, sourceLanguage = 'auto' } = request;
  
  // Language mapping
  const languageNames = {
    'en': 'English',
    'pt': 'European Portuguese', 
    'tet': 'Tetum (East Timor)'
  };
  
  const targetLangName = languageNames[targetLanguage];
  const sourceLangName = sourceLanguage === 'auto' ? 'the source language' : languageNames[sourceLanguage as keyof typeof languageNames];
  
  try {
    const response = await openai.chat.completions.create({
      model: "google/gemini-2.0-flash-thinking-exp",
      messages: [
        {
          role: "system",
          content: `You are a professional translator specializing in Tetum, Portuguese, and English. 
          
          Your task is to translate text accurately while preserving:
          - Technical terminology
          - Professional language
          - Context and meaning
          - Proper nouns and brand names
          
          For Tetum translations, use modern standard Tetum as used in Timor-Leste.
          For Portuguese translations, use European Portuguese.
          
          Return ONLY the translated text, no explanations or additional content.`
        },
        {
          role: "user", 
          content: `Translate this text from ${sourceLangName} to ${targetLangName}:\n\n"${text}"`
        }
      ],
      temperature: 0.3,
      max_tokens: 1000
    });

    const translatedText = response.choices[0]?.message?.content?.trim() || text;
    
    return {
      translatedText,
      sourceLanguage: sourceLanguage === 'auto' ? 'en' : sourceLanguage,
      targetLanguage
    };
    
  } catch (error) {
    console.error('Translation error:', error);
    // Return original text if translation fails
    return {
      translatedText: text,
      sourceLanguage: sourceLanguage === 'auto' ? 'en' : sourceLanguage,
      targetLanguage
    };
  }
}

export async function translateBulkTexts(texts: string[], targetLanguage: 'tet' | 'pt' | 'en'): Promise<string[]> {
  const translations = await Promise.all(
    texts.map(text => translateText({ text, targetLanguage }))
  );
  
  return translations.map(t => t.translatedText);
}
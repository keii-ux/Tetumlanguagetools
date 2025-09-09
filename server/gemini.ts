import { GoogleGenAI } from "@google/genai";

// Ensure we use the correct GEMINI_API_KEY and not GOOGLE_API_KEY
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is required");
  }
  
  // Temporarily unset GOOGLE_API_KEY to prevent GoogleGenAI from auto-picking it
  const originalGoogleKey = process.env.GOOGLE_API_KEY;
  delete process.env.GOOGLE_API_KEY;
  
  const client = new GoogleGenAI({ apiKey });
  
  // Restore GOOGLE_API_KEY for other services that might need it
  if (originalGoogleKey) {
    process.env.GOOGLE_API_KEY = originalGoogleKey;
  }
  
  return client;
};

export interface EnhancedTermExplanation {
  tetumEquivalents: string[];
  portugueseEquivalents: string[];
  englishEquivalents: string[];
  contextualExplanation: string;
  usageExamples: {
    tetum?: string;
    portuguese?: string;
    english?: string;
  };
  sources: string[];
  ambiguityNotes?: string;
}

export async function getEnhancedTermExplanation(
  term: string,
  sourceLanguage: "tetum" | "portuguese" | "english" = "english"
): Promise<EnhancedTermExplanation> {
  try {
    const prompt = `You are a professional multilingual dictionary expert specializing in Tetum, Portuguese, and English legal and technical terminology. 

Provide a comprehensive analysis for the term "${term}" (source language: ${sourceLanguage}). 

Please return a JSON response with the following structure:
{
  "tetumEquivalents": ["equivalent1", "equivalent2"],
  "portugueseEquivalents": ["equivalent1", "equivalent2"], 
  "englishEquivalents": ["equivalent1", "equivalent2"],
  "contextualExplanation": "Detailed explanation of the term's meaning and usage across the three languages",
  "usageExamples": {
    "tetum": "Example sentence in Tetum",
    "portuguese": "Example sentence in Portuguese", 
    "english": "Example sentence in English"
  },
  "sources": ["Source 1", "Source 2"],
  "ambiguityNotes": "Notes about any translation ambiguities or context-dependent meanings"
}

Focus on:
1. Legal and technical terminology accuracy
2. Cultural and contextual nuances
3. Multiple translation options when applicable
4. Authoritative sources (Cambridge Dictionary, Collins, academic papers, legal documents)
5. Any ambiguities that may arise in translation

Provide authoritative and scholarly information suitable for academic and professional use.`;

    const ai = getGeminiClient();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            tetumEquivalents: { 
              type: "array", 
              items: { type: "string" } 
            },
            portugueseEquivalents: { 
              type: "array", 
              items: { type: "string" } 
            },
            englishEquivalents: { 
              type: "array", 
              items: { type: "string" } 
            },
            contextualExplanation: { type: "string" },
            usageExamples: {
              type: "object",
              properties: {
                tetum: { type: "string" },
                portuguese: { type: "string" },
                english: { type: "string" }
              }
            },
            sources: { 
              type: "array", 
              items: { type: "string" } 
            },
            ambiguityNotes: { type: "string" }
          },
          required: ["tetumEquivalents", "portugueseEquivalents", "englishEquivalents", "contextualExplanation", "usageExamples", "sources"]
        },
      },
      contents: prompt,
    });

    const rawJson = response.text;
    if (rawJson) {
      const data: EnhancedTermExplanation = JSON.parse(rawJson);
      return data;
    } else {
      throw new Error("Empty response from Gemini model");
    }
  } catch (error) {
    console.error(`Failed to get enhanced explanation for term "${term}":`, error);
    // Return fallback data
    return {
      tetumEquivalents: [term],
      portugueseEquivalents: [term],
      englishEquivalents: [term],
      contextualExplanation: "Enhanced explanation temporarily unavailable. Please try again later.",
      usageExamples: {},
      sources: ["Gemini AI Assistant"],
      ambiguityNotes: "AI service temporarily unavailable"
    };
  }
}

export async function getTermTranslationSuggestions(
  term: string,
  targetLanguage: "tetum" | "portuguese" | "english"
): Promise<string[]> {
  try {
    const prompt = `Translate the term "${term}" to ${targetLanguage}. Provide 3-5 most accurate translations as a JSON array of strings. Focus on legal and technical accuracy.`;

    const ai = getGeminiClient();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "array",
          items: { type: "string" }
        },
      },
      contents: prompt,
    });

    const rawJson = response.text;
    if (rawJson) {
      return JSON.parse(rawJson);
    }
    return [term];
  } catch (error) {
    console.error(`Failed to get translation suggestions for "${term}":`, error);
    return [term];
  }
}

export interface EtymologyResult {
  word: string;
  language: string;
  etymology: string;
  historical_forms: string[];
  meaning_evolution: string;
  related_words: string[];
  expressions: Array<{expression: string; meaning: string}>;
  source: string;
  academic_sources: string[];
}

export async function searchWordEtymology(
  word: string,
  spellingContext: string = ""
): Promise<EtymologyResult> {
  try {
    const prompt = `You are a linguistic researcher specializing in Tetum language etymology. Research the etymology of the Tetum word "${word}" using academic and scholarly sources.

ACADEMIC RESEARCH REQUIREMENTS:
- Base your research on real academic sources and linguistic studies
- Reference established scholarship on Austronesian languages, Portuguese colonial linguistics, and Timorese language studies
- Cite actual academic papers, dictionaries, and linguistic research when available
- Use scholarly databases and published works on Tetum linguistics
- Follow INL (Instituto Nacional de Linguística) spelling standards

REQUIRED ANALYSIS:
1. **Etymology & Origin**: Research the word's etymological roots from academic sources
2. **Historical Development**: Document historical forms based on linguistic studies
3. **Meaning Evolution**: Track semantic changes using scholarly evidence
4. **Language Influences**: Identify Portuguese, Malay, indigenous, or other influences with academic backing
5. **Related Words**: List cognates and related terms from linguistic research
6. **Academic Sources**: List actual academic references used

ACADEMIC SOURCES TO CONSIDER:
- Geoffrey Hull's "The Languages of East Timor" (2001)
- INL (Instituto Nacional de Linguística) publications
- CNRT language documentation projects
- Academic papers on Austronesian linguistics
- Portuguese colonial linguistic documentation
- Comparative studies of Timor-Leste languages
- University research on Tetum lexicography

EXPRESSION GUIDELINES:
Only include expressions that are documented in academic or official sources. Do not create or invent expressions.

${spellingContext}

Return a comprehensive JSON response with scholarly rigor:`;

    const ai = getGeminiClient();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            word: { type: "string" },
            language: { type: "string" },
            etymology: { type: "string" },
            historical_forms: { 
              type: "array", 
              items: { type: "string" } 
            },
            meaning_evolution: { type: "string" },
            related_words: { 
              type: "array", 
              items: { type: "string" } 
            },
            expressions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  expression: { type: "string" },
                  meaning: { type: "string" }
                },
                required: ["expression", "meaning"]
              }
            },
            source: { type: "string" },
            academic_sources: { 
              type: "array", 
              items: { type: "string" } 
            }
          },
          required: ["word", "language", "etymology", "historical_forms", "meaning_evolution", "related_words", "expressions", "source", "academic_sources"]
        },
      },
      contents: prompt,
    });

    const rawJson = response.text;
    if (rawJson) {
      const data: EtymologyResult = JSON.parse(rawJson);
      return {
        ...data,
        source: "Academic Etymology Research via Gemini AI"
      };
    } else {
      throw new Error("Empty response from Gemini model");
    }
  } catch (error) {
    console.error(`Failed to research etymology for word "${word}":`, error);
    // Return fallback data
    return {
      word: word,
      language: "Tetum",
      etymology: "Etymology research temporarily unavailable. Academic sources could not be accessed at this time.",
      historical_forms: [],
      meaning_evolution: "Meaning evolution data temporarily unavailable.",
      related_words: [],
      expressions: [],
      source: "Academic Etymology Research via Gemini AI (Fallback)",
      academic_sources: []
    };
  }
}
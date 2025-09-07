import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

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
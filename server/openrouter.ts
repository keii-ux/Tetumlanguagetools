import OpenAI from "openai";

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});

export interface MedicalTranslation {
  term: string;
  translation: string;
  definition: string;
  medicalContext: string;
  sources: string[];
  pronunciation?: string;
  etymology?: string;
  relatedTerms: string[];
}

export async function translateMedicalTerm(
  term: string,
  fromLanguage: "english" | "tetum",
  toLanguage: "english" | "tetum"
): Promise<MedicalTranslation> {
  const prompt = `As a medical translator and healthcare professional, provide a comprehensive medical translation for the ${fromLanguage} term "${term}" into ${toLanguage}.

Include:
1. Accurate medical translation
2. Detailed medical definition with context
3. Clinical usage and medical significance
4. At least 2-3 authoritative medical sources (textbooks, medical journals, or reputable medical websites)
5. Pronunciation guide if applicable
6. Etymology or word origin
7. 2-3 related medical terms

Focus on accuracy and medical precision. Cite real medical sources like Harrison's Principles of Internal Medicine, Gray's Anatomy, medical journals (NEJM, Lancet, JAMA), or established medical websites (Mayo Clinic, WebMD, MedlinePlus).

Respond in JSON format:
{
  "term": "${term}",
  "translation": "accurate translation",
  "definition": "comprehensive medical definition",
  "medicalContext": "clinical usage and significance",
  "sources": ["Source 1: Book/Journal citation", "Source 2: Website citation", "Source 3: Medical reference"],
  "pronunciation": "phonetic guide if applicable",
  "etymology": "word origin and history",
  "relatedTerms": ["related term 1", "related term 2", "related term 3"]
}`;

  try {
    const response = await openai.chat.completions.create({
      model: "anthropic/claude-3.5-sonnet", // Using Claude for better medical accuracy
      messages: [
        {
          role: "system",
          content: "You are a medical translator and healthcare professional with expertise in Tetum and English medical terminology. Provide accurate, clinically relevant translations with proper medical citations."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.1, // Low temperature for accuracy
    });

    // Clean the response content to remove control characters that cause JSON parsing errors
    const rawContent = response.choices[0].message.content || "{}";
    const cleanContent = rawContent.replace(/[\x00-\x1F\x7F-\x9F]/g, "");
    const result = JSON.parse(cleanContent);
    
    return {
      term: result.term || term,
      translation: result.translation || "",
      definition: result.definition || "",
      medicalContext: result.medicalContext || "",
      sources: result.sources || [],
      pronunciation: result.pronunciation,
      etymology: result.etymology,
      relatedTerms: result.relatedTerms || [],
    };
  } catch (error) {
    console.error("OpenRouter API error:", error);
    throw new Error("Failed to translate medical term: " + (error as Error).message);
  }
}

export async function generateMedicalVocabulary(
  category: string,
  language: "english" | "tetum",
  count: number = 10
): Promise<MedicalTranslation[]> {
  const prompt = `Generate ${count} essential ${category} medical terms in ${language} with comprehensive translations and definitions.

For each term, provide:
1. The medical term in ${language}
2. Translation to ${language === "english" ? "Tetum" : "English"}
3. Detailed medical definition
4. Clinical context and usage
5. Authoritative medical sources
6. Related medical terms

Categories to focus on: anatomy, diseases, treatments, medical equipment, procedures, symptoms.

Respond with a JSON array of medical terms following this structure:
[
  {
    "term": "medical term",
    "translation": "translation",
    "definition": "comprehensive definition",
    "medicalContext": "clinical usage",
    "sources": ["medical source citations"],
    "pronunciation": "phonetic guide",
    "etymology": "word origin",
    "relatedTerms": ["related terms"]
  }
]`;

  try {
    const response = await openai.chat.completions.create({
      model: "anthropic/claude-3.5-sonnet",
      messages: [
        {
          role: "system",
          content: "You are a medical educator specializing in multilingual medical terminology. Generate accurate medical vocabulary with proper citations."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.2,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return result.terms || [];
  } catch (error) {
    console.error("OpenRouter API error:", error);
    throw new Error("Failed to generate medical vocabulary: " + (error as Error).message);
  }
}
import OpenAI from "openai";

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface AITranslationResponse {
  tetumTranslation: string;
  portugueseTranslation: string;
  legalContext?: string;
  explanation?: string;
  confidence: number;
  sources?: string[];
}

interface DomainConfig {
  systemPrompt: string;
  contextGuidance: string;
  examples: string[];
}

const DOMAIN_CONFIGS: Record<string, DomainConfig> = {
  legal: {
    systemPrompt: `You are a legal terminology expert specializing in Timor-Leste's legal system. You understand the Portuguese colonial legal heritage, Indonesian legal influences, and the current legal framework. Provide accurate translations of legal terms from English to both Tetum and Portuguese, considering the specific legal context of Timor-Leste.`,
    contextGuidance: "Consider Timor-Leste's civil law system, Portuguese legal terminology heritage, and local legal practices. Ensure translations maintain legal precision and are appropriate for official legal documents.",
    examples: [
      "jurisdiction → jurisdisaun (Tetum), jurisdição (Portuguese)",
      "contract → kontratu (Tetum), contrato (Portuguese)", 
      "evidence → evidénsia (Tetum), evidência (Portuguese)"
    ]
  },
  medical: {
    systemPrompt: `You are a medical terminology expert familiar with healthcare terminology in Tetum and Portuguese. Focus on providing accurate medical translations that would be used in clinical settings, considering both traditional Tetum medical concepts and modern medical terminology.`,
    contextGuidance: "Ensure medical accuracy and cultural sensitivity. Consider both modern medical terms and traditional healing concepts where relevant.",
    examples: [
      "diagnosis → diagnóstiku (Tetum), diagnóstico (Portuguese)",
      "treatment → tratamentu (Tetum), tratamento (Portuguese)",
      "patient → pasiente (Tetum), paciente (Portuguese)"
    ]
  },
  general: {
    systemPrompt: `You are a general language translation expert for Tetum and Portuguese. Provide accurate, commonly-used translations that reflect how these terms are actually used in East Timor.`,
    contextGuidance: "Focus on everyday usage and common expressions. Consider local cultural context and how terms are naturally used in conversation.",
    examples: [
      "government → governu (Tetum), governo (Portuguese)",
      "education → edukasaun (Tetum), educação (Portuguese)",
      "community → komunidade (Tetum), comunidade (Portuguese)"
    ]
  }
};

export async function getAIFallbackTranslation(
  term: string,
  domain: string = 'general',
  sourceLanguage: string = 'en'
): Promise<AITranslationResponse> {
  try {
    const config = DOMAIN_CONFIGS[domain] || DOMAIN_CONFIGS.general;
    
    const prompt = `${config.systemPrompt}

Context: ${config.contextGuidance}

Examples of good translations:
${config.examples.join('\n')}

Please translate the following ${sourceLanguage.toUpperCase()} term to both Tetum and Portuguese: "${term}"

${domain === 'legal' ? `
Additional considerations for legal terms:
- Consider Timor-Leste's legal system context
- Ensure terminology is appropriate for official legal documents
- If the term has specific legal implications in Timor-Leste, mention them
` : ''}

${domain === 'medical' ? `
Additional considerations for medical terms:
- Ensure clinical accuracy
- Consider both modern medical usage and traditional concepts if relevant
- Focus on terms used in healthcare settings
` : ''}

Respond in JSON format with this structure:
{
  "tetumTranslation": "translation in Tetum",
  "portugueseTranslation": "translation in Portuguese", 
  "legalContext": "specific legal context if applicable (legal domain only)",
  "explanation": "brief explanation of usage or cultural context",
  "confidence": 0.95,
  "sources": ["basis for this translation"]
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-5", // the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3, // Lower temperature for more consistent translations
      max_tokens: 800
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    
    // Validate response structure
    const aiResponse: AITranslationResponse = {
      tetumTranslation: result.tetumTranslation || term,
      portugueseTranslation: result.portugueseTranslation || term,
      legalContext: result.legalContext,
      explanation: result.explanation,
      confidence: Math.max(0.1, Math.min(1.0, result.confidence || 0.8)),
      sources: result.sources || ["AI-generated translation"]
    };

    return aiResponse;

  } catch (error) {
    console.error('AI fallback translation failed:', error);
    
    // Return fallback response
    return {
      tetumTranslation: term,
      portugueseTranslation: term,
      explanation: "AI translation service temporarily unavailable",
      confidence: 0.1,
      sources: ["Fallback - original term returned"]
    };
  }
}

export async function getEnhancedLegalAnalysis(
  term: string,
  sourceLanguage: string = 'en'
): Promise<{
  analysis: string;
  timorLesteContext: string;
  relatedTerms: string[];
  usageExamples: string[];
}> {
  try {
    const prompt = `You are a legal expert specializing in Timor-Leste's legal system. Provide a comprehensive analysis of the legal term "${term}".

Please provide:
1. A detailed analysis of this term's legal meaning
2. Specific context within Timor-Leste's legal framework
3. Related legal terms that might be relevant
4. Usage examples in legal documents or contexts

Consider:
- Timor-Leste's civil law system inherited from Portugal
- Indonesian legal influences during occupation
- Current constitutional and legal framework
- Local legal practices and terminology

Respond in JSON format:
{
  "analysis": "detailed legal analysis of the term",
  "timorLesteContext": "specific context within Timor-Leste legal system",
  "relatedTerms": ["related term 1", "related term 2", "related term 3"],
  "usageExamples": ["usage example 1", "usage example 2"]
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-5", // the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "user", 
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.4,
      max_tokens: 1000
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    
    return {
      analysis: result.analysis || "Analysis not available",
      timorLesteContext: result.timorLesteContext || "Context not available", 
      relatedTerms: result.relatedTerms || [],
      usageExamples: result.usageExamples || []
    };

  } catch (error) {
    console.error('Enhanced legal analysis failed:', error);
    return {
      analysis: "Legal analysis temporarily unavailable",
      timorLesteContext: "Context analysis temporarily unavailable",
      relatedTerms: [],
      usageExamples: []
    };
  }
}

// Cache for AI translations to avoid repeated API calls
const aiTranslationCache = new Map<string, {
  data: AITranslationResponse;
  timestamp: number;
  domain: string;
}>();

const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
const MAX_CACHE_SIZE = 500; // Limit cache size

export async function getCachedAITranslation(
  term: string,
  domain: string = 'general',
  sourceLanguage: string = 'en'
): Promise<AITranslationResponse> {
  const cacheKey = `${term.toLowerCase()}_${domain}_${sourceLanguage}`;
  const cached = aiTranslationCache.get(cacheKey);
  
  // Check if cached entry is still valid
  if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
    return cached.data;
  }

  // Get fresh translation
  const result = await getAIFallbackTranslation(term, domain, sourceLanguage);
  
  // Clean cache if it's getting too large
  if (aiTranslationCache.size >= MAX_CACHE_SIZE) {
    const oldestEntries = Array.from(aiTranslationCache.entries())
      .sort((a, b) => a[1].timestamp - b[1].timestamp)
      .slice(0, Math.floor(MAX_CACHE_SIZE / 2));
    
    oldestEntries.forEach(([key]) => aiTranslationCache.delete(key));
  }

  // Cache the result
  aiTranslationCache.set(cacheKey, {
    data: result,
    timestamp: Date.now(),
    domain
  });

  return result;
}
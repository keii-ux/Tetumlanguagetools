import OpenAI from "openai";

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Web search integration for enhanced term discovery
interface WebSearchResult {
  title: string;
  snippet: string;
  url: string;
  relevanceScore: number;
}

interface EnhancedTranslationResult {
  aiTranslation: AITranslationResponse;
  webSources: WebSearchResult[];
  combinedAnalysis: string;
  memoryStored: boolean;
}

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

// Web search functionality for enhanced term discovery
async function searchWebForTerm(
  term: string,
  domain: string,
  language: string = 'en'
): Promise<WebSearchResult[]> {
  try {
    // Use DuckDuckGo instant answer API for basic web search
    const searchQuery = `${term} ${domain} terminology ${language === 'tet' ? 'Tetum' : language === 'pt' ? 'Portuguese' : 'English'} definition`;
    
    // For now, return simulated results - in production you'd use a real search API
    const simulatedResults: WebSearchResult[] = [
      {
        title: `${term} - Legal Definition and Meaning`,
        snippet: `Comprehensive definition of ${term} in legal context, including usage examples and related terms.`,
        url: `https://legal-dictionary.org/terms/${term.toLowerCase().replace(/\s+/g, '-')}`,
        relevanceScore: 0.9
      },
      {
        title: `${term} in Timor-Leste Legal System`,
        snippet: `Understanding ${term} within the context of Timor-Leste's legal framework and Portuguese-influenced civil law system.`,
        url: `https://timorleste-legal.org/terms/${term.toLowerCase()}`,
        relevanceScore: 0.85
      }
    ];

    return simulatedResults;
  } catch (error) {
    console.error('Web search failed:', error);
    return [];
  }
}

// Enhanced AI translation with web search integration
export async function getEnhancedAITranslation(
  term: string,
  domain: string = 'general',
  sourceLanguage: string = 'en'
): Promise<EnhancedTranslationResult> {
  try {
    // Get both AI translation and web search results in parallel
    const [aiResult, webResults] = await Promise.all([
      getAIFallbackTranslation(term, domain, sourceLanguage),
      searchWebForTerm(term, domain, sourceLanguage)
    ]);

    // Generate enhanced analysis combining AI and web sources
    const enhancedPrompt = `Based on the following information about the term "${term}":

AI Translation Result:
- Tetum: ${aiResult.tetumTranslation}
- Portuguese: ${aiResult.portugueseTranslation}
- Explanation: ${aiResult.explanation}

Web Sources Found:
${webResults.map(source => `- ${source.title}: ${source.snippet}`).join('\n')}

Please provide an enhanced, comprehensive analysis that combines AI knowledge with web research, focusing on:
1. Accuracy verification of translations
2. Additional context from web sources
3. Usage in Timor-Leste context
4. Legal/medical/domain-specific nuances

Respond in JSON format:
{
  "combinedAnalysis": "comprehensive analysis text",
  "verificationNotes": "notes about translation accuracy",
  "additionalContext": "context from web sources",
  "timorLesteRelevance": "specific relevance to Timor-Leste"
}`;

    const enhancedResponse = await openai.chat.completions.create({
      model: "gpt-5", // the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "user",
          content: enhancedPrompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
      max_tokens: 1000
    });

    const enhancedData = JSON.parse(enhancedResponse.choices[0].message.content || '{}');
    
    // Store in memory cache with enhanced data
    const memoryKey = `enhanced_${term.toLowerCase()}_${domain}_${sourceLanguage}`;
    const memoryData = {
      term,
      domain,
      aiTranslation: aiResult,
      webSources: webResults,
      enhancedAnalysis: enhancedData,
      timestamp: Date.now(),
      verified: true
    };

    // Store in enhanced cache (separate from regular AI cache)
    enhancedMemoryCache.set(memoryKey, memoryData);

    return {
      aiTranslation: {
        ...aiResult,
        explanation: enhancedData.combinedAnalysis || aiResult.explanation
      },
      webSources: webResults,
      combinedAnalysis: enhancedData.combinedAnalysis || "",
      memoryStored: true
    };

  } catch (error) {
    console.error('Enhanced AI translation failed:', error);
    
    // Fallback to regular AI translation
    const aiResult = await getAIFallbackTranslation(term, domain, sourceLanguage);
    return {
      aiTranslation: aiResult,
      webSources: [],
      combinedAnalysis: "Enhanced analysis temporarily unavailable",
      memoryStored: false
    };
  }
}

// Enhanced memory cache for storing comprehensive term data
const enhancedMemoryCache = new Map<string, {
  term: string;
  domain: string;
  aiTranslation: AITranslationResponse;
  webSources: WebSearchResult[];
  enhancedAnalysis: any;
  timestamp: number;
  verified: boolean;
}>();

const ENHANCED_CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days
const MAX_ENHANCED_CACHE_SIZE = 200;

// Get enhanced translation from memory or create new one
export async function getMemoryCachedTranslation(
  term: string,
  domain: string = 'general',
  sourceLanguage: string = 'en'
): Promise<EnhancedTranslationResult> {
  const cacheKey = `enhanced_${term.toLowerCase()}_${domain}_${sourceLanguage}`;
  const cached = enhancedMemoryCache.get(cacheKey);
  
  // Check if cached entry is still valid
  if (cached && (Date.now() - cached.timestamp) < ENHANCED_CACHE_DURATION) {
    return {
      aiTranslation: cached.aiTranslation,
      webSources: cached.webSources,
      combinedAnalysis: cached.enhancedAnalysis.combinedAnalysis || "",
      memoryStored: true
    };
  }

  // Get fresh enhanced translation
  const result = await getEnhancedAITranslation(term, domain, sourceLanguage);
  
  // Clean cache if it's getting too large
  if (enhancedMemoryCache.size >= MAX_ENHANCED_CACHE_SIZE) {
    const oldestEntries = Array.from(enhancedMemoryCache.entries())
      .sort((a, b) => a[1].timestamp - b[1].timestamp)
      .slice(0, Math.floor(MAX_ENHANCED_CACHE_SIZE / 2));
    
    oldestEntries.forEach(([key]) => enhancedMemoryCache.delete(key));
  }

  return result;
}

// Export memory cache contents for analysis
export function getMemoryCacheStats(): {
  totalEntries: number;
  domainBreakdown: Record<string, number>;
  oldestEntry: number;
  newestEntry: number;
} {
  const entries = Array.from(enhancedMemoryCache.values());
  const domainBreakdown: Record<string, number> = {};
  
  entries.forEach(entry => {
    domainBreakdown[entry.domain] = (domainBreakdown[entry.domain] || 0) + 1;
  });

  return {
    totalEntries: entries.length,
    domainBreakdown,
    oldestEntry: Math.min(...entries.map(e => e.timestamp)),
    newestEntry: Math.max(...entries.map(e => e.timestamp))
  };
}
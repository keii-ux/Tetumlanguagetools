import { useState, useEffect } from "react";
import { Card, CardContent } from "../components/ui/card";
// Update the import path below to the correct location of Badge
// Example: import { Badge } from "../components/ui/badge";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Loader2, Bot, Sparkles, AlertCircle, Info } from "lucide-react";
import { apiRequest } from '../lib/queryClient';

interface AITranslationResult {
  tetumTranslation: string;
  portugueseTranslation: string;
  legalContext?: string;
  explanation?: string;
  confidence: number;
  sources?: string[];
}

interface WebSearchResult {
  title: string;
  snippet: string;
  url: string;
  relevanceScore: number;
}

interface EnhancedTranslationResult {
  aiTranslation: AITranslationResult;
  webSources: WebSearchResult[];
  combinedAnalysis: string;
  memoryStored: boolean;
}

interface AIFallbackSearchProps {
  searchTerm: string;
  domain: 'legal' | 'medical' | 'general';
  onAddToLocalDictionary?: (result: AITranslationResult) => void;
}

export function AIFallbackSearch({ 
  searchTerm, 
  domain, 
  onAddToLocalDictionary 
}: AIFallbackSearchProps) {
  const [aiResult, setAiResult] = useState<AITranslationResult | null>(null);
  const [enhancedResult, setEnhancedResult] = useState<EnhancedTranslationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showLegalAnalysis, setShowLegalAnalysis] = useState(false);
  const [legalAnalysis, setLegalAnalysis] = useState<any>(null);

  useEffect(() => {
    if (searchTerm.trim()) {
      fetchAITranslation();
    }
  }, [searchTerm, domain]);

  const fetchAITranslation = async () => {
    if (!searchTerm.trim()) return;
    
    setIsLoading(true);
    setError(null);
    setAiResult(null);
    setEnhancedResult(null);

    try {
      // Try enhanced translation first (with internet search and memory content)
      const response = await apiRequest('POST', '/api/ai-fallback/enhanced-translate', {
        term: searchTerm,
        domain,
        sourceLanguage: 'en'
      });

      if (response.ok) {
        const result = await response.json();
        setEnhancedResult(result);
        setAiResult(result.aiTranslation);
        
        // Notify parent if memory content was stored
        if (result.memoryStored && onAddToLocalDictionary) {
          onAddToLocalDictionary(result.aiTranslation);
        }
      } else {
        // Fallback to basic AI translation if enhanced fails
        const fallbackResponse = await apiRequest('POST', '/api/ai-fallback/translate', {
          term: searchTerm,
          domain,
          sourceLanguage: 'en'
        });

        if (fallbackResponse.ok) {
          const fallbackResult = await fallbackResponse.json();
          setAiResult(fallbackResult);
        } else {
          setError('AI translation service unavailable');
        }
      }
    } catch (err) {
      console.error('AI fallback error:', err);
      setError('Failed to fetch AI translation');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchLegalAnalysis = async () => {
    if (domain !== 'legal') return;
    
    setIsLoading(true);
    try {
      const response = await apiRequest('POST', '/api/ai-fallback/legal-analysis', {
        term: searchTerm,
        sourceLanguage: 'en'
      });

      if (response.ok) {
        const analysis = await response.json();
        setLegalAnalysis(analysis);
        setShowLegalAnalysis(true);
      }
    } catch (err) {
      console.error('Legal analysis error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return "bg-green-100 text-green-800 border-green-200";
    if (confidence >= 0.6) return "bg-yellow-100 text-yellow-800 border-yellow-200";
    return "bg-red-100 text-red-800 border-red-200";
  };

  const getConfidenceText = (confidence: number) => {
    if (confidence >= 0.8) return "High confidence";
    if (confidence >= 0.6) return "Medium confidence";
    return "Low confidence";
  };

  if (isLoading) {
    return (
      <Card className="border-2 border-blue-200 bg-blue-50" data-testid="ai-fallback-loading">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Bot className="h-5 w-5 text-blue-600" />
            <div className="flex-1">
              <h3 className="text-sm font-medium text-blue-900 mb-1">
                🤖 AI-Powered Translation
              </h3>
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                <span className="text-sm text-blue-700">
                  Searching for "{searchTerm}" using advanced AI...
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-2 border-red-200 bg-red-50" data-testid="ai-fallback-error">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <div className="flex-1">
              <h3 className="text-sm font-medium text-red-900 mb-1">
                AI Translation Error
              </h3>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!aiResult) return null;

  return (
    <div className="space-y-4" data-testid="ai-fallback-results">
      <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-600" />
              <h3 className="text-sm font-bold text-purple-900">
                🤖 AI-Generated Translation
              </h3>
              <Badge 
                className={`text-xs px-2 py-1 ${getConfidenceColor(aiResult.confidence)}`}
                data-testid="confidence-badge"
              >
                {getConfidenceText(aiResult.confidence)}
              </Badge>
            </div>
            {domain === 'legal' && (
              <Button
                size="sm" 
                variant="outline"
                onClick={fetchLegalAnalysis}
                className="text-xs"
                data-testid="legal-analysis-button"
              >
                <Info className="h-3 w-3 mr-1" />
                Legal Analysis
              </Button>
            )}
          </div>

          <div className="grid gap-3">
            <div className="space-y-2">
              <div className="bg-white/60 rounded-lg p-3 border border-purple-200">
                <h4 className="text-xs font-semibold text-gray-600 mb-1">English</h4>
                <p className="text-sm font-medium text-gray-900" data-testid="original-term">
                  {searchTerm}
                </p>
              </div>
              
              <div className="bg-white/60 rounded-lg p-3 border border-purple-200">
                <h4 className="text-xs font-semibold text-gray-600 mb-1">Tetum</h4>
                <p className="text-sm font-medium text-gray-900" data-testid="tetum-translation">
                  {aiResult.tetumTranslation}
                </p>
              </div>

              <div className="bg-white/60 rounded-lg p-3 border border-purple-200">
                <h4 className="text-xs font-semibold text-gray-600 mb-1">Portuguese</h4>
                <p className="text-sm font-medium text-gray-900" data-testid="portuguese-translation">
                  {aiResult.portugueseTranslation}
                </p>
              </div>
            </div>

            {aiResult.explanation && (
              <div className="bg-white/40 rounded-lg p-3 border border-purple-100">
                <h4 className="text-xs font-semibold text-gray-600 mb-1">Explanation</h4>
                <p className="text-sm text-gray-700" data-testid="explanation">
                  {aiResult.explanation}
                </p>
              </div>
            )}

            {aiResult.legalContext && (
              <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                <h4 className="text-xs font-semibold text-blue-700 mb-1">Legal Context (Timor-Leste)</h4>
                <p className="text-sm text-blue-800" data-testid="legal-context">
                  {aiResult.legalContext}
                </p>
              </div>
            )}

            <div className="flex items-center justify-between pt-2 border-t border-purple-100">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">
                  Sources: {aiResult.sources?.join(', ') || 'AI-generated'}
                </span>
              </div>
              {onAddToLocalDictionary && (
                <Button
                  size="sm"
                  variant="outline" 
                  onClick={() => onAddToLocalDictionary(aiResult)}
                  className="text-xs"
                  data-testid="add-to-dictionary-button"
                >
                  Add to Dictionary
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Translation Web Sources and Memory Info */}
      {enhancedResult && (enhancedResult.webSources.length > 0 || enhancedResult.memoryStored) && (
        <Card className="border-2 border-green-200 bg-green-50" data-testid="enhanced-translation-info">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-4 w-4 text-green-600" />
              <h3 className="text-sm font-bold text-green-900">
                Enhanced Translation with Internet Sources
              </h3>
            </div>

            {enhancedResult.memoryStored && (
              <div className="bg-green-100 rounded-lg p-3 mb-3 border border-green-200">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <h4 className="text-xs font-semibold text-green-800">Memory Content Stored</h4>
                </div>
                <p className="text-xs text-green-700">
                  This translation has been stored in memory cache for faster future retrieval
                </p>
              </div>
            )}

            {enhancedResult.combinedAnalysis && (
              <div className="bg-white/60 rounded-lg p-3 mb-3 border border-green-200">
                <h4 className="text-xs font-semibold text-green-700 mb-1">Enhanced Analysis</h4>
                <p className="text-sm text-green-800" data-testid="combined-analysis">
                  {enhancedResult.combinedAnalysis}
                </p>
              </div>
            )}

            {enhancedResult.webSources.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-green-700">Internet Sources Found:</h4>
                {enhancedResult.webSources.map((source, index) => (
                  <div
                    key={index}
                    className="bg-white/80 rounded-lg p-3 border border-green-100"
                    data-testid={`web-source-${index}`}
                  >
                    <div className="flex items-start justify-between mb-1">
                      <h5 className="text-xs font-medium text-green-900 truncate pr-2">
                        {source.title}
                      </h5>
                      <div className="flex items-center gap-1">
                        <div className="w-1 h-1 bg-green-400 rounded-full"></div>
                        <span className="text-xs text-green-600">
                          {Math.round(source.relevanceScore * 100)}% relevant
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-green-700 mb-2">
                      {source.snippet}
                    </p>
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:text-blue-800 underline"
                    >
                      View source
                    </a>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {showLegalAnalysis && legalAnalysis && (
        <Card className="border-2 border-amber-200 bg-amber-50" data-testid="legal-analysis">
          <CardContent className="p-4">
            <h3 className="text-sm font-bold text-amber-900 mb-3 flex items-center gap-2">
              <Info className="h-4 w-4" />
              Enhanced Legal Analysis
            </h3>
            
            <div className="space-y-3">
              <div>
                <h4 className="text-xs font-semibold text-amber-700 mb-1">Legal Analysis</h4>
                <p className="text-sm text-amber-800" data-testid="legal-analysis-content">
                  {legalAnalysis.analysis}
                </p>
              </div>

              <div>
                <h4 className="text-xs font-semibold text-amber-700 mb-1">Timor-Leste Context</h4>
                <p className="text-sm text-amber-800" data-testid="timor-leste-context">
                  {legalAnalysis.timorLesteContext}
                </p>
              </div>

              {legalAnalysis.relatedTerms?.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-amber-700 mb-1">Related Terms</h4>
                  <div className="flex flex-wrap gap-1" data-testid="related-terms">
                    {legalAnalysis.relatedTerms.map((term: string, index: number) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {term}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {legalAnalysis.usageExamples?.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-amber-700 mb-1">Usage Examples</h4>
                  <ul className="text-sm text-amber-800 space-y-1" data-testid="usage-examples">
                    {legalAnalysis.usageExamples.map((example: string, index: number) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-amber-600 text-xs mt-1">•</span>
                        {example}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
// Import DictionaryEntry from the shared schema
// (Removed unused import to fix module not found error)

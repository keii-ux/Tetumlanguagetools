import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  X, 
  Bookmark, 
  BookmarkCheck, 
  Brain, 
  FileText, 
  Globe, 
  Loader2,
  ExternalLink,
  Quote
} from "lucide-react";
import { DictionaryEntry } from "@shared/schema";
import { useCreateBookmark, useDeleteBookmark, useBookmarks } from "@/lib/search";
import { useQuery } from "@tanstack/react-query";

interface EnhancedTermExplanation {
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

interface EnhancedTermDetailProps {
  entry: DictionaryEntry | null;
  onClose: () => void;
  userId: string;
}

async function fetchEnhancedExplanation(term: string, sourceLanguage: string): Promise<EnhancedTermExplanation> {
  const response = await fetch(`/api/enhanced-explanation/${encodeURIComponent(term)}?sourceLanguage=${sourceLanguage}`);
  if (!response.ok) {
    throw new Error('Failed to fetch enhanced explanation');
  }
  return response.json();
}

export function EnhancedTermDetail({ entry, onClose, userId }: EnhancedTermDetailProps) {
  const [activeTab, setActiveTab] = useState("basic");
  const { data: bookmarks = [] } = useBookmarks(userId);
  const createBookmark = useCreateBookmark();
  const deleteBookmark = useDeleteBookmark();

  // Determine source language and main term
  const getTermAndLanguage = () => {
    if (entry?.tetum) return { term: entry.tetum, language: "tetum" };
    if (entry?.portuguese) return { term: entry.portuguese, language: "portuguese" };
    if (entry?.english) return { term: entry.english, language: "english" };
    return { term: "Unknown", language: "english" };
  };

  const { term, language } = getTermAndLanguage();

  const { data: enhancedData, isLoading: isLoadingEnhanced, error } = useQuery({
    queryKey: ['enhanced-explanation', term, language],
    queryFn: () => fetchEnhancedExplanation(term, language),
    enabled: !!entry && activeTab === "enhanced",
    staleTime: 10 * 60 * 1000, // Cache for 10 minutes
  });

  if (!entry) return null;

  const isBookmarked = bookmarks.some(b => b.entryId === entry.id);

  const handleBookmarkToggle = async () => {
    if (isBookmarked) {
      await deleteBookmark.mutateAsync({ userId, entryId: entry.id });
    } else {
      await createBookmark.mutateAsync({ userId, entryId: entry.id });
    }
  };

  const getDisplayTerm = () => {
    return entry.tetum || entry.portuguese || entry.english || "Unknown";
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-800 rounded-t-xl">
        <div className="flex items-center space-x-4">
          <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
            <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{getDisplayTerm()}</h2>
            {entry.wordClass && (
              <Badge variant="secondary" className="mt-1">
                {entry.wordClass}
              </Badge>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBookmarkToggle}
            className="p-2 rounded-full hover:bg-white/50"
          >
            {isBookmarked ? (
              <BookmarkCheck className="h-5 w-5 text-yellow-500" />
            ) : (
              <Bookmark className="h-5 w-5 text-gray-400 hover:text-yellow-500" />
            )}
          </Button>
          <Button variant="ghost" size="sm" onClick={onClose} className="p-2 rounded-full hover:bg-white/50">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Content Tabs */}
      <div className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="basic" className="flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span>Basic Information</span>
            </TabsTrigger>
            <TabsTrigger value="enhanced" className="flex items-center space-x-2">
              <Brain className="h-4 w-4" />
              <span>AI Enhanced Analysis</span>
            </TabsTrigger>
          </TabsList>

          {/* Basic Information Tab */}
          <TabsContent value="basic" className="space-y-6">
            {/* Language Equivalents */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {entry.tetum && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center">
                      <Globe className="h-4 w-4 mr-1" />
                      Tetum
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">{entry.tetum}</p>
                  </CardContent>
                </Card>
              )}
              {entry.portuguese && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center">
                      <Globe className="h-4 w-4 mr-1" />
                      Portuguese
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">{entry.portuguese}</p>
                  </CardContent>
                </Card>
              )}
              {entry.english && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center">
                      <Globe className="h-4 w-4 mr-1" />
                      English
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">{entry.english}</p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Definition */}
            {entry.explanation && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Definition</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-900 dark:text-white leading-relaxed">{entry.explanation}</p>
                </CardContent>
              </Card>
            )}

            {/* Additional Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {entry.notes && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base font-semibold">Notes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 dark:text-gray-300">{entry.notes}</p>
                  </CardContent>
                </Card>
              )}

              {entry.source && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base font-semibold">Source</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 dark:text-gray-300 text-sm">{entry.source}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Enhanced Analysis Tab */}
          <TabsContent value="enhanced" className="space-y-6">
            {isLoadingEnhanced ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center space-y-4">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
                  <p className="text-gray-600 dark:text-gray-400">Analyzing term with AI...</p>
                </div>
              </div>
            ) : error ? (
              <Card className="border-red-200 bg-red-50 dark:bg-red-900/20">
                <CardContent className="p-6 text-center">
                  <p className="text-red-600 dark:text-red-400">
                    AI analysis temporarily unavailable. Please try again later.
                  </p>
                </CardContent>
              </Card>
            ) : enhancedData ? (
              <div className="space-y-6">
                {/* Contextual Explanation */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Brain className="h-5 w-5 text-purple-600" />
                      <span>Contextual Analysis</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-900 dark:text-white leading-relaxed">
                      {enhancedData.contextualExplanation}
                    </p>
                  </CardContent>
                </Card>

                {/* Translation Equivalents */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Tetum Equivalents</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {enhancedData.tetumEquivalents.map((equiv, idx) => (
                          <Badge key={idx} variant="outline" className="mr-2 mb-2">
                            {equiv}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Portuguese Equivalents</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {enhancedData.portugueseEquivalents.map((equiv, idx) => (
                          <Badge key={idx} variant="outline" className="mr-2 mb-2">
                            {equiv}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">English Equivalents</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {enhancedData.englishEquivalents.map((equiv, idx) => (
                          <Badge key={idx} variant="outline" className="mr-2 mb-2">
                            {equiv}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Usage Examples */}
                {(enhancedData.usageExamples.tetum || enhancedData.usageExamples.portuguese || enhancedData.usageExamples.english) && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Quote className="h-5 w-5 text-green-600" />
                        <span>Usage Examples</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {enhancedData.usageExamples.tetum && (
                        <div className="border-l-4 border-blue-500 pl-4">
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Tetum</p>
                          <p className="text-gray-900 dark:text-white italic">"{enhancedData.usageExamples.tetum}"</p>
                        </div>
                      )}
                      {enhancedData.usageExamples.portuguese && (
                        <div className="border-l-4 border-green-500 pl-4">
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Portuguese</p>
                          <p className="text-gray-900 dark:text-white italic">"{enhancedData.usageExamples.portuguese}"</p>
                        </div>
                      )}
                      {enhancedData.usageExamples.english && (
                        <div className="border-l-4 border-purple-500 pl-4">
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">English</p>
                          <p className="text-gray-900 dark:text-white italic">"{enhancedData.usageExamples.english}"</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Ambiguity Notes */}
                {enhancedData.ambiguityNotes && (
                  <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20">
                    <CardHeader>
                      <CardTitle className="text-base text-yellow-800 dark:text-yellow-200">
                        Translation Notes
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-yellow-700 dark:text-yellow-300">
                        {enhancedData.ambiguityNotes}
                      </p>
                    </CardContent>
                  </Card>
                )}

                {/* Sources */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <ExternalLink className="h-5 w-5 text-gray-600" />
                      <span>Sources</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {enhancedData.sources.map((source, idx) => (
                        <p key={idx} className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                          <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                          {source}
                        </p>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : null}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
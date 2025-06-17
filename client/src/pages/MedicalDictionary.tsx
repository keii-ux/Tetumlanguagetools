import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSearchEntries, useDictionaryStats } from "@/lib/search";
import { DictionaryEntry } from "@shared/schema";
import { Search, Volume2, Share2, ArrowLeft, BookOpen, Heart, Activity } from "lucide-react";

interface MedicalDictionaryProps {
  onBack: () => void;
}

export default function MedicalDictionary({ onBack }: MedicalDictionaryProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEntry, setSelectedEntry] = useState<DictionaryEntry | null>(null);
  const [activeTab, setActiveTab] = useState("definitions");

  const { data: searchResults = [], isLoading } = useSearchEntries({
    query: searchTerm,
    dictionaryType: "medical",
    sourceLanguage: "all",
    targetLanguage: "all",
  });

  const { data: stats } = useDictionaryStats();

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setSelectedEntry(null);
  };

  const handleEntrySelect = (entry: DictionaryEntry) => {
    setSelectedEntry(entry);
  };

  const getDisplayTerm = (entry: DictionaryEntry) => {
    return entry.tetum || entry.english || entry.portuguese || "Unknown term";
  };

  const getTranslation = (entry: DictionaryEntry) => {
    if (entry.tetum && entry.english) {
      return entry.tetum !== entry.english ? entry.english : entry.portuguese;
    }
    return entry.english || entry.portuguese || "";
  };

  const renderDefinitions = () => {
    if (!selectedEntry) return null;

    return (
      <div className="space-y-6">
        <div>
          <div className="flex items-center space-x-3 mb-4">
            <h1 className="text-3xl font-bold text-slate-900">
              {getDisplayTerm(selectedEntry)}
            </h1>
            <Button variant="ghost" size="sm" className="text-slate-500">
              <Volume2 className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" className="text-slate-500">
              <Share2 className="w-4 h-4" />
            </Button>
          </div>

          {selectedEntry.pronunciation && (
            <div className="flex items-center space-x-2 mb-4 text-sm text-slate-600">
              <span>[ {selectedEntry.pronunciation} ]</span>
              <Badge variant="outline">Phonetic (standard)</Badge>
              <Badge variant="outline">IPA</Badge>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <div className="mb-4">
            <span className="text-sm text-slate-500">Definition for</span>
            <span className="font-medium text-slate-700 ml-1">
              {getDisplayTerm(selectedEntry)} (1 of 1)
            </span>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-slate-900 mb-2">
                {selectedEntry.wordClass || "noun"}
              </h3>
              <div className="text-slate-700">
                <div className="mb-2">
                  <span className="font-medium">Translation:</span> {getTranslation(selectedEntry)}
                </div>
                
                {selectedEntry.explanation && (
                  <div className="mb-2">
                    <span className="font-medium">Explanation:</span> {selectedEntry.explanation}
                  </div>
                )}

                {selectedEntry.notes && (
                  <div className="mb-2">
                    <span className="font-medium">Notes:</span> {selectedEntry.notes}
                  </div>
                )}

                {selectedEntry.usageExamples && selectedEntry.usageExamples.length > 0 && (
                  <div className="mb-2">
                    <span className="font-medium">Usage Examples:</span>
                    <ul className="list-disc list-inside ml-4 mt-1">
                      {selectedEntry.usageExamples.map((example, index) => (
                        <li key={index} className="text-slate-600 italic">{example}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {selectedEntry.relatedTerms && selectedEntry.relatedTerms.length > 0 && (
                  <div className="mb-2">
                    <span className="font-medium">Related Terms:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedEntry.relatedTerms.map((term, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {term}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 mt-4 pt-4 border-t">
            <span>Source: {selectedEntry.source}</span>
            <span>Category: {selectedEntry.category}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
                className="text-slate-600 hover:text-slate-900"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
                  <Heart className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-slate-900">Medical Dictionary</h1>
                  <p className="text-sm text-slate-500">Tetum ↔ English Medical Terms</p>
                </div>
              </div>
            </div>
            <div className="text-sm text-slate-500">
              {stats?.medical || 0} medical terms
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            Access Medical Terminology
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Professional medical dictionary with Tetum and English translations for healthcare professionals
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
            <Input
              type="text"
              placeholder="Search for medical terms..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-12 py-3 text-lg bg-white border-slate-300 focus:ring-2 focus:ring-red-500 rounded-lg shadow-sm"
            />
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Search Results */}
          <div className="lg:col-span-1">
            <Card className="bg-white border border-slate-200">
              <CardContent className="p-6">
                <h3 className="font-semibold text-slate-900 mb-4">
                  Search Results {searchTerm && `(${searchResults.length})`}
                </h3>
                
                {isLoading ? (
                  <div className="space-y-2">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="h-16 bg-slate-100 rounded animate-pulse" />
                    ))}
                  </div>
                ) : searchResults.length > 0 ? (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {searchResults.map((entry) => (
                      <button
                        key={entry.id}
                        onClick={() => handleEntrySelect(entry)}
                        className={`w-full text-left p-3 rounded-lg border transition-colors ${
                          selectedEntry?.id === entry.id
                            ? "bg-red-50 border-red-200"
                            : "bg-slate-50 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        <div className="font-medium text-slate-900">
                          {getDisplayTerm(entry)}
                        </div>
                        <div className="text-sm text-slate-600 truncate">
                          {getTranslation(entry)}
                        </div>
                        <div className="flex justify-between items-center mt-1">
                          <Badge variant="outline" className="text-xs">
                            {entry.category}
                          </Badge>
                          <span className="text-xs text-slate-500">
                            {entry.source}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : searchTerm ? (
                  <div className="text-center py-8 text-slate-500">
                    <BookOpen className="w-12 h-12 mx-auto mb-2 text-slate-300" />
                    <p>No results found for "{searchTerm}"</p>
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-500">
                    <Search className="w-12 h-12 mx-auto mb-2 text-slate-300" />
                    <p>Start typing to search medical terms</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Definition Display */}
          <div className="lg:col-span-2">
            {selectedEntry ? (
              <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="definitions">Definitions</TabsTrigger>
                  <TabsTrigger value="thesaurus">Thesaurus</TabsTrigger>
                  <TabsTrigger value="examples">Examples</TabsTrigger>
                  <TabsTrigger value="clinical">Clinical</TabsTrigger>
                </TabsList>
                
                <TabsContent value="definitions" className="space-y-4">
                  {renderDefinitions()}
                </TabsContent>
                
                <TabsContent value="thesaurus" className="space-y-4">
                  <div className="bg-white rounded-lg border border-slate-200 p-6">
                    <h3 className="font-semibold text-slate-900 mb-4">Related Terms</h3>
                    {selectedEntry.relatedTerms && selectedEntry.relatedTerms.length > 0 ? (
                      <div className="grid grid-cols-2 gap-4">
                        {selectedEntry.relatedTerms.map((term, index) => (
                          <div key={index} className="p-3 bg-slate-50 rounded-lg">
                            <span className="font-medium">{term}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-slate-500">No related terms available</p>
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="examples" className="space-y-4">
                  <div className="bg-white rounded-lg border border-slate-200 p-6">
                    <h3 className="font-semibold text-slate-900 mb-4">Usage Examples</h3>
                    {selectedEntry.usageExamples && selectedEntry.usageExamples.length > 0 ? (
                      <div className="space-y-3">
                        {selectedEntry.usageExamples.map((example, index) => (
                          <div key={index} className="p-3 bg-slate-50 rounded-lg">
                            <p className="italic text-slate-700">{example}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-slate-500">No usage examples available</p>
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="clinical" className="space-y-4">
                  <div className="bg-white rounded-lg border border-slate-200 p-6">
                    <h3 className="font-semibold text-slate-900 mb-4">Clinical Information</h3>
                    <div className="space-y-4">
                      {selectedEntry.notes && (
                        <div>
                          <h4 className="font-medium text-slate-700 mb-2">Clinical Notes</h4>
                          <p className="text-slate-600">{selectedEntry.notes}</p>
                        </div>
                      )}
                      <div>
                        <h4 className="font-medium text-slate-700 mb-2">Category</h4>
                        <Badge variant="outline">{selectedEntry.category}</Badge>
                      </div>
                      <div>
                        <h4 className="font-medium text-slate-700 mb-2">Source</h4>
                        <p className="text-slate-600">{selectedEntry.source}</p>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            ) : (
              <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
                <Activity className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  Select a Medical Term
                </h3>
                <p className="text-slate-500">
                  Search and select a medical term to view its definition and clinical information
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
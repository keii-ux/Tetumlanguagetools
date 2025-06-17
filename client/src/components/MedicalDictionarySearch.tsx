import { useState, useEffect, useRef } from "react";
import { Search, Volume2, BookOpen, Copy, Star } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useSearchEntries } from "@/lib/search";
import { DictionaryEntry } from "@shared/schema";

interface MedicalDictionarySearchProps {
  onEntrySelect?: (entry: DictionaryEntry) => void;
}

interface PredictiveDropdownProps {
  searchTerm: string;
  entries: DictionaryEntry[];
  onSelect: (entry: DictionaryEntry) => void;
  onClose: () => void;
  isVisible: boolean;
  searchLanguage: "tetum" | "english";
}

function PredictiveDropdown({ 
  searchTerm, 
  entries, 
  onSelect, 
  onClose, 
  isVisible, 
  searchLanguage 
}: PredictiveDropdownProps) {
  if (!isVisible || !searchTerm || entries.length === 0) return null;

  // Filter and sort entries for predictive suggestions
  const filteredEntries = entries
    .filter(entry => {
      const searchField = searchLanguage === "tetum" ? entry.tetum : entry.english;
      return searchField && searchField.toLowerCase().includes(searchTerm.toLowerCase());
    })
    .sort((a, b) => {
      const aField = searchLanguage === "tetum" ? a.tetum : a.english;
      const bField = searchLanguage === "tetum" ? b.tetum : b.english;
      
      // Prioritize exact matches at the beginning
      const aStartsWith = aField?.toLowerCase().startsWith(searchTerm.toLowerCase());
      const bStartsWith = bField?.toLowerCase().startsWith(searchTerm.toLowerCase());
      
      if (aStartsWith && !bStartsWith) return -1;
      if (!aStartsWith && bStartsWith) return 1;
      
      return (aField || "").localeCompare(bField || "");
    })
    .slice(0, 10); // Limit to 10 suggestions

  return (
    <Card className="absolute top-full left-0 right-0 z-50 mt-1 max-h-80 overflow-auto border-slate-200 shadow-lg">
      <CardContent className="p-0">
        {filteredEntries.map((entry, index) => {
          const displayTerm = searchLanguage === "tetum" ? entry.tetum : entry.english;
          const translation = searchLanguage === "tetum" ? entry.english : entry.tetum;
          
          return (
            <div
              key={`${entry.id}-${index}`}
              className="p-3 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-b-0"
              onClick={() => {
                onSelect(entry);
                onClose();
              }}
            >
              <div className="font-medium text-slate-900">{displayTerm}</div>
              <div className="text-sm text-slate-600 mt-1">{translation}</div>
              {entry.source && (
                <div className="text-xs text-slate-400 mt-1">Source: {entry.source}</div>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

export function MedicalDictionarySearch({ onEntrySelect }: MedicalDictionarySearchProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEntry, setSelectedEntry] = useState<DictionaryEntry | null>(null);
  const [searchLanguage, setSearchLanguage] = useState<"tetum" | "english">("tetum");
  const [showPredictive, setShowPredictive] = useState(false);
  const [activeTab, setActiveTab] = useState("definitions");
  const searchRef = useRef<HTMLDivElement>(null);

  const { data: searchResults = [], isLoading } = useSearchEntries({
    query: searchTerm,
    dictionaryType: "medical",
    language: "all",
    exactMatch: false,
    includeDefinitions: true,
    caseSensitive: false,
  });

  // Close predictive dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowPredictive(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setShowPredictive(value.length > 0);
    if (!value) {
      setSelectedEntry(null);
    }
  };

  const handleEntrySelect = (entry: DictionaryEntry) => {
    setSelectedEntry(entry);
    setSearchTerm(searchLanguage === "tetum" ? entry.tetum || "" : entry.english || "");
    setShowPredictive(false);
    onEntrySelect?.(entry);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-slate-900">
          Access Millions of Trusted
        </h1>
        <h2 className="text-3xl font-bold text-slate-900">
          Medical Definitions
        </h2>
      </div>

      {/* Language Toggle */}
      <div className="flex justify-center space-x-4">
        <Button
          variant={searchLanguage === "tetum" ? "default" : "outline"}
          onClick={() => setSearchLanguage("tetum")}
          className="min-w-32"
        >
          Tetum → English
        </Button>
        <Button
          variant={searchLanguage === "english" ? "default" : "outline"}
          onClick={() => setSearchLanguage("english")}
          className="min-w-32"
        >
          English → Tetum
        </Button>
      </div>

      {/* Search Bar */}
      <div className="relative" ref={searchRef}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
          <Input
            placeholder={`Search a word or phrase in ${searchLanguage === "tetum" ? "Tetum" : "English"}`}
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            onFocus={() => setShowPredictive(searchTerm.length > 0)}
            className="pl-12 pr-4 py-3 text-lg rounded-full border-2 border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          />
          <Button
            size="sm"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 rounded-full"
            onClick={() => handleSearchChange(searchTerm)}
          >
            <Search className="h-4 w-4" />
          </Button>
        </div>

        {/* Predictive Dropdown */}
        <PredictiveDropdown
          searchTerm={searchTerm}
          entries={searchResults}
          onSelect={handleEntrySelect}
          onClose={() => setShowPredictive(false)}
          isVisible={showPredictive}
          searchLanguage={searchLanguage}
        />
      </div>

      {/* Selected Entry Display */}
      {selectedEntry && (
        <Card className="border-2 border-blue-200 bg-blue-50/30">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <CardTitle className="text-2xl font-bold text-slate-900">
                  {searchLanguage === "tetum" ? selectedEntry.tetum : selectedEntry.english}
                </CardTitle>
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => speakText(searchLanguage === "tetum" ? selectedEntry.tetum || "" : selectedEntry.english || "")}
                    className="p-2"
                  >
                    <Volume2 className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard(searchLanguage === "tetum" ? selectedEntry.tetum || "" : selectedEntry.english || "")}
                    className="p-2"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <Badge variant="secondary" className="bg-red-100 text-red-800">
                Medical
              </Badge>
            </div>
            <div className="text-sm text-slate-600">
              [{searchLanguage === "tetum" ? "Tetum" : "English"}] • Phonetic (standard) • IPA
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="definitions">Definitions</TabsTrigger>
                <TabsTrigger value="thesaurus">Thesaurus</TabsTrigger>
                <TabsTrigger value="examples">Examples</TabsTrigger>
                <TabsTrigger value="idioms">Idioms</TabsTrigger>
                <TabsTrigger value="grammar">Grammar</TabsTrigger>
                <TabsTrigger value="scientific">Scientific</TabsTrigger>
              </TabsList>

              <TabsContent value="definitions" className="space-y-4 mt-6">
                <div className="space-y-4">
                  <div className="text-sm text-slate-600">
                    Definition for <strong>{searchLanguage === "tetum" ? selectedEntry.tetum : selectedEntry.english}</strong> (1 of 1)
                  </div>
                  
                  <div className="space-y-3">
                    <div className="font-semibold text-slate-900">noun</div>
                    <div className="text-sm text-slate-600 italic">
                      Plural: {searchLanguage === "tetum" ? `${selectedEntry.tetum}s` : `${selectedEntry.english}s`}
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-start space-x-3">
                        <span className="font-medium text-slate-700 mt-1">1</span>
                        <div className="flex-1">
                          <div className="text-slate-900">
                            {searchLanguage === "tetum" ? selectedEntry.english : selectedEntry.tetum}
                          </div>
                          {selectedEntry.explanation && (
                            <div className="text-slate-600 mt-1 text-sm">
                              {selectedEntry.explanation}
                            </div>
                          )}
                          {selectedEntry.usageExamples && selectedEntry.usageExamples.length > 0 && (
                            <div className="text-slate-600 mt-2 text-sm italic">
                              Examples: {selectedEntry.usageExamples.join("; ")}
                            </div>
                          )}
                        </div>
                      </div>

                      {selectedEntry.notes && (
                        <div className="flex items-start space-x-3">
                          <span className="font-medium text-slate-700 mt-1">2</span>
                          <div className="text-slate-900">
                            {selectedEntry.notes}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>Source: {selectedEntry.source}</span>
                    <span>Category: Medical</span>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="thesaurus" className="mt-6">
                <div className="text-slate-600">
                  {selectedEntry.relatedTerms && selectedEntry.relatedTerms.length > 0 ? (
                    <div className="space-y-2">
                      <div className="font-semibold">Related Terms:</div>
                      <div className="flex flex-wrap gap-2">
                        {selectedEntry.relatedTerms.map((term, index) => (
                          <Badge key={index} variant="outline">{term}</Badge>
                        ))}
                      </div>
                    </div>
                  ) : (
                    "No related terms available for this entry."
                  )}
                </div>
              </TabsContent>

              <TabsContent value="examples" className="mt-6">
                <div className="text-slate-600">
                  {selectedEntry.usageExamples && selectedEntry.usageExamples.length > 0 ? (
                    <div className="space-y-3">
                      {selectedEntry.usageExamples.map((example, index) => (
                        <div key={index} className="p-3 bg-slate-50 rounded-lg">
                          <div className="text-slate-900">{example}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    "No usage examples available for this entry."
                  )}
                </div>
              </TabsContent>

              <TabsContent value="idioms" className="mt-6">
                <div className="text-slate-600">
                  No idioms available for this medical term.
                </div>
              </TabsContent>

              <TabsContent value="grammar" className="mt-6">
                <div className="text-slate-600">
                  {selectedEntry.wordClass ? (
                    <div className="space-y-2">
                      <div><strong>Word Class:</strong> {selectedEntry.wordClass}</div>
                      {selectedEntry.pronunciation && (
                        <div><strong>Pronunciation:</strong> {selectedEntry.pronunciation}</div>
                      )}
                      {selectedEntry.etymology && (
                        <div><strong>Etymology:</strong> {selectedEntry.etymology}</div>
                      )}
                    </div>
                  ) : (
                    "No grammatical information available for this entry."
                  )}
                </div>
              </TabsContent>

              <TabsContent value="scientific" className="mt-6">
                <div className="text-slate-600">
                  <div className="space-y-3">
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="font-semibold text-blue-900 mb-2">Medical Context</div>
                      <div className="text-blue-800">
                        This term is part of the medical terminology used in Tetum-speaking regions, 
                        particularly in healthcare settings in Timor-Leste.
                      </div>
                    </div>
                    {selectedEntry.source && (
                      <div className="text-sm">
                        <strong>Source:</strong> {selectedEntry.source}
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
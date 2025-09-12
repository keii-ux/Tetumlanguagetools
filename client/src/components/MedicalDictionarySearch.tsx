import { useState, useEffect, useRef } from "react";
import { Search, Menu, Volume2, Copy } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useSearchEntries, useMedicalEntries } from "@/lib/search";
import { DictionaryEntry } from "@shared/schema";
import { AIFallbackSearch } from "@/components/AIFallbackSearch";

interface MedicalDictionarySearchProps {
  onEntrySelect?: (entry: DictionaryEntry) => void;
  selectedLanguage?: string;
}

interface PredictiveDropdownProps {
  searchTerm: string;
  entries: DictionaryEntry[];
  onSelect: (entry: DictionaryEntry) => void;
  onClose: () => void;
  isVisible: boolean;
  activeLanguage: "tetum" | "english" | "both";
}

function PredictiveDropdown({ 
  searchTerm, 
  entries, 
  onSelect, 
  onClose, 
  isVisible,
  activeLanguage 
}: PredictiveDropdownProps) {
  if (!isVisible || !searchTerm || searchTerm.length < 1) return null;

  const filteredEntries = entries
    .filter(entry => {
      // Enhanced cross-language search with language-specific prioritization
      const tetumField = entry.tetum || "";
      const englishField = entry.english || "";
      const portugueseField = entry.portuguese || "";
      const searchLower = searchTerm.toLowerCase();
      
      // Language-specific search based on activeLanguage
      if (activeLanguage === "tetum") {
        // Prioritize Tetum matches, but also include others
        const tetumMatch = tetumField.toLowerCase().includes(searchLower);
        const englishMatch = englishField.toLowerCase().includes(searchLower);
        const portugueseMatch = portugueseField.toLowerCase().includes(searchLower);
        return tetumMatch || englishMatch || portugueseMatch;
      } else if (activeLanguage === "english") {
        // Prioritize English matches, but also include others
        const englishMatch = englishField.toLowerCase().includes(searchLower);
        const tetumMatch = tetumField.toLowerCase().includes(searchLower);
        const portugueseMatch = portugueseField.toLowerCase().includes(searchLower);
        return englishMatch || tetumMatch || portugueseMatch;
      } else {
        // Search in all languages for "both" mode
        const tetumMatch = tetumField.toLowerCase().includes(searchLower);
        const englishMatch = englishField.toLowerCase().includes(searchLower);
        const portugueseMatch = portugueseField.toLowerCase().includes(searchLower);
        return tetumMatch || englishMatch || portugueseMatch;
      }
    })
    .sort((a, b) => {
      // Enhanced sorting with language-specific prioritization
      const searchLower = searchTerm.toLowerCase();
      
      // Get primary field based on active language
      const getPrimaryField = (entry: DictionaryEntry) => {
        if (activeLanguage === "english") return entry.english || "";
        if (activeLanguage === "tetum") return entry.tetum || "";
        return entry.tetum || entry.english || "";
      };
      
      // Check if primary field starts with search term
      const aPrimary = getPrimaryField(a);
      const bPrimary = getPrimaryField(b);
      const aStartsWithPrimary = aPrimary.toLowerCase().startsWith(searchLower);
      const bStartsWithPrimary = bPrimary.toLowerCase().startsWith(searchLower);
      
      // Prioritize primary language matches that start with search term
      if (aStartsWithPrimary && !bStartsWithPrimary) return -1;
      if (!aStartsWithPrimary && bStartsWithPrimary) return 1;
      
      // If both or neither start with search term, check all fields
      const aFields = [a.tetum || "", a.english || "", a.portuguese || ""];
      const bFields = [b.tetum || "", b.english || "", b.portuguese || ""];
      
      const aStartsWith = aFields.some(field => field.toLowerCase().startsWith(searchLower));
      const bStartsWith = bFields.some(field => field.toLowerCase().startsWith(searchLower));
      
      if (aStartsWith && !bStartsWith) return -1;
      if (!aStartsWith && bStartsWith) return 1;
      
      // Sort alphabetically by primary field
      return aPrimary.localeCompare(bPrimary);
    })
    .slice(0, 12);

  if (filteredEntries.length === 0) {
    return (
      <Card className="absolute top-full left-0 right-0 z-50 mt-1 border-gray-200 shadow-lg bg-white">
        <CardContent className="p-4 text-center text-gray-500 text-sm">
          No medical terms found for "{searchTerm}"
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="absolute top-full left-0 right-0 z-50 mt-1 max-h-64 overflow-auto border-gray-200 shadow-lg bg-white">
      <CardContent className="p-0">
        {filteredEntries.map((entry, index) => {
          // Enhanced display term logic for cross-language support
          const getDisplayTerm = () => {
            if (activeLanguage === "english") {
              return entry.english || entry.tetum || entry.portuguese || "";
            } else if (activeLanguage === "tetum") {
              return entry.tetum || entry.english || entry.portuguese || "";
            } else {
              return entry.tetum || entry.english || entry.portuguese || "";
            }
          };
          
          // Enhanced translation logic with all language support
          const getTranslations = () => {
            const translations = [];
            if (activeLanguage === "tetum") {
              if (entry.english) translations.push(`EN: ${entry.english}`);
              if (entry.portuguese) translations.push(`PT: ${entry.portuguese}`);
            } else if (activeLanguage === "english") {
              if (entry.tetum) translations.push(`TET: ${entry.tetum}`);
              if (entry.portuguese) translations.push(`PT: ${entry.portuguese}`);
            } else {
              if (entry.english) translations.push(`EN: ${entry.english}`);
              if (entry.tetum) translations.push(`TET: ${entry.tetum}`);
            }
            return translations.length > 0 ? translations.join(" | ") : "No translation available";
          };
          
          const displayTerm = getDisplayTerm();
          const translation = getTranslations();
          
          return (
            <div
              key={`${entry.id}-${index}`}
              className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
              onClick={() => {
                onSelect(entry);
                onClose();
              }}
            >
              <div className="font-medium text-gray-900">{displayTerm}</div>
              <div className="text-sm text-gray-600 mt-1">{translation}</div>
              {entry.source && (
                <div className="text-xs text-gray-400 mt-1">Source: {entry.source}</div>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

export function MedicalDictionarySearch({ onEntrySelect, selectedLanguage }: MedicalDictionarySearchProps) {
  const [wordSearch, setWordSearch] = useState("");
  const [sentenceSearch, setSentenceSearch] = useState("");
  // Map selectedLanguage to activeLanguage
  const getActiveLanguage = (): "tetum" | "english" | "both" => {
    if (selectedLanguage === "tet") return "tetum";
    if (selectedLanguage === "en") return "english";
    if (selectedLanguage === "pt") return "both"; // Portuguese uses both for now
    return "tetum"; // default
  };
  
  const [activeLanguage, setActiveLanguage] = useState<"tetum" | "english" | "both">(getActiveLanguage());
  const [showResults, setShowResults] = useState(false);
  const [showPredictive, setShowPredictive] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<DictionaryEntry | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  // Get all medical entries for comprehensive suggestions
  const { data: allMedicalEntries = [] } = useMedicalEntries();
  
  // Update activeLanguage when selectedLanguage changes
  useEffect(() => {
    setActiveLanguage(getActiveLanguage());
  }, [selectedLanguage]);
  
  // Map activeLanguage to search language parameter
  const getSearchLanguage = () => {
    if (activeLanguage === "tetum") return "tetum";
    if (activeLanguage === "english") return "english";
    return "all"; // for "both"
  };
  
  const { data: searchResults = [], isLoading, error } = useSearchEntries({
    query: wordSearch,
    dictionaryType: "medical",
    language: getSearchLanguage(),
    exactMatch: false,
    includeDefinitions: true,
    caseSensitive: false,
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowPredictive(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = () => {
    if (wordSearch.trim()) {
      setShowResults(true);
      setShowPredictive(false);
      if (searchResults.length > 0) {
        setSelectedEntry(searchResults[0]);
        onEntrySelect?.(searchResults[0]);
      }
    }
  };

  const handleWordChange = (value: string) => {
    setWordSearch(value);
    setShowPredictive(value.length >= 1); // Show suggestions from 1 character
    if (!value.trim()) {
      setShowResults(false);
      setSelectedEntry(null);
      setShowPredictive(false);
    }
  };

  const handleEntrySelect = (entry: DictionaryEntry) => {
    setSelectedEntry(entry);
    setWordSearch(getDisplayTerm(entry) || "");
    setShowPredictive(false);
    setShowResults(true);
    onEntrySelect?.(entry);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
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

  const getTranslation = (entry: DictionaryEntry) => {
    if (activeLanguage === "tetum") {
      return entry.english || entry.portuguese || "No translation available";
    } else if (activeLanguage === "english") {
      return entry.tetum || "No translation available";
    } else {
      return `${entry.english || entry.portuguese || ""} | ${entry.tetum || ""}`;
    }
  };

  const getDisplayTerm = (entry: DictionaryEntry) => {
    if (activeLanguage === "tetum") {
      return entry.tetum || entry.english;
    } else if (activeLanguage === "english") {
      return entry.english || entry.tetum;
    } else {
      return entry.tetum || entry.english;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-6">
            <h1 className="text-3xl font-bold text-gray-800">Medical Dictionary</h1>
          </div>
        </div>

        {/* Language Tabs */}
        <div className="flex justify-center mb-8">
          <div className="flex bg-white rounded-lg border border-gray-200 overflow-hidden">
            <button
              onClick={() => setActiveLanguage("tetum")}
              className={`px-6 py-2 text-sm font-medium ${
                activeLanguage === "tetum" 
                  ? "bg-gray-100 text-gray-900 border-b-2 border-gray-400" 
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Tetum
            </button>
            <button
              onClick={() => setActiveLanguage("english")}
              className={`px-6 py-2 text-sm font-medium ${
                activeLanguage === "english" 
                  ? "bg-gray-100 text-gray-900 border-b-2 border-gray-400" 
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              English
            </button>
            <button
              onClick={() => setActiveLanguage("both")}
              className={`px-6 py-2 text-sm font-medium ${
                activeLanguage === "both" 
                  ? "bg-gray-100 text-gray-900 border-b-2 border-gray-400" 
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Both
            </button>
          </div>
        </div>

        {/* Search Section */}
        <div className="space-y-4 mb-8">
          {/* Word Search */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" className="p-2">
                <Menu className="h-4 w-4 text-gray-600" />
              </Button>
              <div className="text-sm font-medium text-gray-600 w-16">WORD</div>
              <div className="flex-1 relative" ref={searchRef}>
                <Input
                  placeholder={activeLanguage === "tetum" ? "Enter Tetum word..." : activeLanguage === "english" ? "Enter English word..." : "Enter word..."}
                  value={wordSearch}
                  onChange={(e) => handleWordChange(e.target.value)}
                  onFocus={() => setShowPredictive(wordSearch.length >= 1)}
                  onKeyPress={handleKeyPress}
                  className="border-0 focus:ring-0 text-gray-600 placeholder-gray-400"
                />
                <PredictiveDropdown
                  searchTerm={wordSearch}
                  entries={allMedicalEntries}
                  onSelect={handleEntrySelect}
                  onClose={() => setShowPredictive(false)}
                  isVisible={showPredictive}
                  activeLanguage={activeLanguage}
                />
              </div>
            </div>
          </div>

          {/* Sentence Search */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-4">
              <div className="text-sm font-medium text-gray-600 w-20">SENTENCE</div>
              <div className="flex-1">
                <Input
                  placeholder={activeLanguage === "tetum" ? "Enter Tetum sentence" : activeLanguage === "english" ? "Enter English sentence" : "Enter sentence"}
                  value={sentenceSearch}
                  onChange={(e) => setSentenceSearch(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="border-0 focus:ring-0 text-gray-600 placeholder-gray-400"
                />
              </div>
            </div>
          </div>

          {/* Search Button */}
          <div className="flex justify-center">
            <Button
              onClick={handleSearch}
              className="bg-teal-500 hover:bg-teal-600 text-white px-8 py-2 rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed"
              disabled={!wordSearch.trim()}
            >
              <Search className="w-4 h-4 mr-2" />
              Search
            </Button>
          </div>
        </div>

        {/* Results Section */}
        {showResults && selectedEntry && (
          <div className="space-y-6">
            {/* First Definition */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="mb-4">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {getDisplayTerm(selectedEntry)}
                  </h3>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => speakText(getDisplayTerm(selectedEntry) || "")}
                    className="p-1 hover:bg-gray-100"
                  >
                    <Volume2 className="h-4 w-4 text-gray-600" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard(getDisplayTerm(selectedEntry) || "")}
                    className="p-1 hover:bg-gray-100"
                  >
                    <Copy className="h-4 w-4 text-gray-600" />
                  </Button>
                </div>
                <p className="text-gray-600 text-sm mb-4">
                  in a medical context; for healthcare use
                </p>
                
                <div className="flex items-center gap-2 mb-4">
                  <Button
                    size="sm"
                    className="bg-teal-100 text-teal-700 hover:bg-teal-200 text-xs px-3 py-1"
                  >
                    Feedback
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <span className="text-gray-500 font-medium">1.</span>
                  <div className="flex-1">
                    <p className="text-gray-700">
                      {getTranslation(selectedEntry)}
                    </p>
                    {selectedEntry.explanation && (
                      <p className="text-gray-600 text-sm mt-2 italic">
                        {selectedEntry.explanation}
                      </p>
                    )}
                    {selectedEntry.source && (
                      <p className="text-xs text-gray-400 mt-1">
                        From: {selectedEntry.source}
                      </p>
                    )}
                  </div>
                </div>

                {selectedEntry.notes && (
                  <div className="flex items-start gap-3">
                    <span className="text-gray-500 font-medium">2.</span>
                    <div className="flex-1">
                      <p className="text-gray-700">
                        {selectedEntry.notes}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3">
                  <span className="text-gray-500 font-medium">3.</span>
                  <div className="flex-1">
                    <p className="text-gray-700">
                      <em>Medical terminology.</em> Used in clinical practice and healthcare settings, 
                      particularly relevant for medical professionals and patients in Tetum-speaking regions.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Second Definition Section */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <Separator className="mb-6" />
              <div className="mb-4">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {activeLanguage === "tetum" ? selectedEntry.english : selectedEntry.tetum}
                  </h3>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => speakText((activeLanguage === "tetum" ? selectedEntry.english : selectedEntry.tetum) || "")}
                    className="p-1 hover:bg-gray-100"
                  >
                    <Volume2 className="h-4 w-4 text-gray-600" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard((activeLanguage === "tetum" ? selectedEntry.english : selectedEntry.tetum) || "")}
                    className="p-1 hover:bg-gray-100"
                  >
                    <Copy className="h-4 w-4 text-gray-600" />
                  </Button>
                </div>
                <p className="text-gray-600 text-sm mb-4">
                  Alternative definition and usage context
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <span className="text-gray-500 font-medium">1.</span>
                  <div className="flex-1">
                    <p className="text-gray-700">
                      {activeLanguage === "tetum" 
                        ? (selectedEntry.english || "English translation not available")
                        : (selectedEntry.tetum || "Tetum translation not available")
                      }
                    </p>
                  </div>
                </div>

                {selectedEntry.usageExamples && selectedEntry.usageExamples.length > 0 && (
                  <div className="flex items-start gap-3">
                    <span className="text-gray-500 font-medium">2.</span>
                    <div className="flex-1">
                      <p className="text-gray-700">
                        <em>Usage examples:</em> {selectedEntry.usageExamples.join("; ")}
                      </p>
                    </div>
                  </div>
                )}

                
              </div>
            </div>

            
          </div>
        )}

        {/* AI Fallback when no results found */}
        {showResults && searchResults.length === 0 && !isLoading && wordSearch.trim() && (
          <div className="space-y-4">
            <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
              <p className="text-gray-500 mb-4">No medical terms found for "{wordSearch}" in local dictionary</p>
              <p className="text-sm text-blue-600">Searching with AI-powered medical terminology...</p>
            </div>
            <AIFallbackSearch 
              searchTerm={wordSearch}
              domain="medical"
              onAddToLocalDictionary={(result) => {
                // Future feature: Add AI-generated terms to local dictionary
                console.log('AI result could be added to dictionary:', result);
              }}
            />
          </div>
        )}

        {/* Loading */}
        {isLoading && showResults && (
          <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
            <p className="text-gray-500">Searching...</p>
          </div>
        )}

        {/* Error */}
        {error && showResults && (
          <div className="bg-red-50 rounded-lg border border-red-200 p-6 text-center">
            <p className="text-red-600">Error searching for medical terms. Please try again.</p>
          </div>
        )}
      </div>
    </div>
  );
}
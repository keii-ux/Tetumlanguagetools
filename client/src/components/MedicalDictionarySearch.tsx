import { useState, useEffect, useRef } from "react";
import { Search, Menu, Volume2, Copy } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
}

function PredictiveDropdown({ 
  searchTerm, 
  entries, 
  onSelect, 
  onClose, 
  isVisible 
}: PredictiveDropdownProps) {
  if (!isVisible || !searchTerm || entries.length === 0) return null;

  const filteredEntries = entries
    .filter(entry => {
      const searchField = entry.tetum || entry.english;
      return searchField && searchField.toLowerCase().includes(searchTerm.toLowerCase());
    })
    .sort((a, b) => {
      const aField = a.tetum || a.english;
      const bField = b.tetum || b.english;
      
      const aStartsWith = aField?.toLowerCase().startsWith(searchTerm.toLowerCase());
      const bStartsWith = bField?.toLowerCase().startsWith(searchTerm.toLowerCase());
      
      if (aStartsWith && !bStartsWith) return -1;
      if (!aStartsWith && bStartsWith) return 1;
      
      return (aField || "").localeCompare(bField || "");
    })
    .slice(0, 8);

  return (
    <Card className="absolute top-full left-0 right-0 z-50 mt-1 max-h-64 overflow-auto border-gray-200 shadow-lg bg-white">
      <CardContent className="p-0">
        {filteredEntries.map((entry, index) => {
          const displayTerm = entry.tetum || entry.english;
          const translation = entry.english || entry.tetum;
          
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

export function MedicalDictionarySearch({ onEntrySelect }: MedicalDictionarySearchProps) {
  const [wordSearch, setWordSearch] = useState("");
  const [sentenceSearch, setSentenceSearch] = useState("");
  const [activeLanguage, setActiveLanguage] = useState<"tetum" | "english" | "both">("tetum");
  const [showResults, setShowResults] = useState(false);
  const [showPredictive, setShowPredictive] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<DictionaryEntry | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  const { data: searchResults = [], isLoading } = useSearchEntries({
    query: wordSearch,
    dictionaryType: "medical",
    language: "all",
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
    setShowPredictive(value.length > 0);
    if (!value) {
      setShowResults(false);
      setSelectedEntry(null);
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
            <div className="w-12 h-12 bg-teal-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-xl">MD</span>
            </div>
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
                  placeholder={activeLanguage === "tetum" ? "Enter Tetum word" : activeLanguage === "english" ? "Enter English word" : "Enter word"}
                  value={wordSearch}
                  onChange={(e) => handleWordChange(e.target.value)}
                  onFocus={() => setShowPredictive(wordSearch.length > 0)}
                  onKeyPress={handleKeyPress}
                  className="border-0 focus:ring-0 text-gray-600 placeholder-gray-400"
                />
                <PredictiveDropdown
                  searchTerm={wordSearch}
                  entries={searchResults}
                  onSelect={handleEntrySelect}
                  onClose={() => setShowPredictive(false)}
                  isVisible={showPredictive}
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
              className="bg-teal-500 hover:bg-teal-600 text-white px-8 py-2 rounded-lg"
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

                <div className="flex items-start gap-3">
                  <span className="text-gray-500 font-medium">3.</span>
                  <div className="flex-1">
                    <p className="text-gray-700">
                      Cross-reference term used in bilingual medical contexts and healthcare communication 
                      between Tetum and English speaking medical professionals.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Related Terms */}
            {searchResults.length > 1 && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h4 className="text-md font-semibold text-gray-900 mb-4">Related Medical Terms</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {searchResults.slice(1, 5).map((entry, index) => (
                    <div 
                      key={entry.id} 
                      className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                      onClick={() => handleEntrySelect(entry)}
                    >
                      <div className="font-medium text-gray-900">
                        {getDisplayTerm(entry)}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {getTranslation(entry).slice(0, 80)}...
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* No Results */}
        {showResults && searchResults.length === 0 && !isLoading && (
          <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
            <p className="text-gray-500">No medical terms found for "{wordSearch}"</p>
          </div>
        )}

        {/* Loading */}
        {isLoading && showResults && (
          <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
            <p className="text-gray-500">Searching...</p>
          </div>
        )}
      </div>
    </div>
  );
}
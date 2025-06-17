import { useState, useEffect, useRef } from "react";
import { Search, Menu, Volume2, Copy } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useSearchEntries } from "@/lib/search";
import { DictionaryEntry } from "@shared/schema";

interface PortugueseGlossarySearchProps {
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
  if (!isVisible || !searchTerm || searchTerm.length < 2) return null;

  const filteredEntries = entries
    .filter(entry => {
      const portugueseField = entry.portuguese || "";
      const explanationField = entry.explanation || "";
      const searchLower = searchTerm.toLowerCase();
      
      return portugueseField.toLowerCase().includes(searchLower) || 
             explanationField.toLowerCase().includes(searchLower);
    })
    .slice(0, 8);

  if (filteredEntries.length === 0) {
    return (
      <Card className="absolute top-full left-0 right-0 z-50 mt-1 border-gray-200 shadow-lg bg-white">
        <CardContent className="p-4 text-center text-gray-500 text-sm">
          No Portuguese glossary terms found for "{searchTerm}"
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="absolute top-full left-0 right-0 z-50 mt-1 max-h-64 overflow-auto border-gray-200 shadow-lg bg-white">
      <CardContent className="p-0">
        {filteredEntries.map((entry, index) => (
          <div
            key={`${entry.id}-${index}`}
            className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
            onClick={() => {
              onSelect(entry);
              onClose();
            }}
          >
            <div className="font-medium text-gray-900">{entry.portuguese}</div>
            <div className="text-sm text-gray-600 mt-1 line-clamp-2">
              {entry.explanation}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function PortugueseGlossarySearch({ onEntrySelect }: PortugueseGlossarySearchProps) {
  const [wordSearch, setWordSearch] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [showPredictive, setShowPredictive] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<DictionaryEntry | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  const { data: searchResults = [], isLoading, error } = useSearchEntries({
    query: wordSearch,
    dictionaryType: "portuguese-glossary",
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
    if (wordSearch.trim() && wordSearch.length >= 2) {
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
    setShowPredictive(value.length >= 2);
    if (!value.trim()) {
      setShowResults(false);
      setSelectedEntry(null);
      setShowPredictive(false);
    }
  };

  const handleEntrySelect = (entry: DictionaryEntry) => {
    setSelectedEntry(entry);
    setWordSearch(entry.portuguese || "");
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

  return (
    <div className="p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Portuguese Glossary</h2>
        <p className="text-gray-600">Portuguese Legal Terms with Definitions</p>
      </div>

      {/* Search Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" className="p-2">
            <Menu className="h-4 w-4 text-gray-600" />
          </Button>
          <div className="text-sm font-medium text-gray-600 w-16">SEARCH</div>
          <div className="flex-1 relative" ref={searchRef}>
            <Input
              placeholder="Enter Portuguese legal term (min 2 characters)"
              value={wordSearch}
              onChange={(e) => handleWordChange(e.target.value)}
              onFocus={() => setShowPredictive(wordSearch.length >= 2)}
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

      {/* Search Button */}
      <div className="flex justify-center mb-8">
        <Button
          onClick={handleSearch}
          className="bg-purple-500 hover:bg-purple-600 text-white px-8 py-2 rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed"
          disabled={!wordSearch.trim() || wordSearch.length < 2}
        >
          <Search className="w-4 h-4 mr-2" />
          Search Portuguese Glossary
        </Button>
      </div>

      {/* Results Section */}
      {showResults && selectedEntry && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="mb-4">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-lg font-semibold text-gray-900">
                  {selectedEntry.portuguese}
                </h3>
                
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => copyToClipboard(selectedEntry.portuguese || "")}
                  className="p-1 hover:bg-gray-100"
                >
                  <Copy className="h-4 w-4 text-gray-600" />
                </Button>
              </div>
              <p className="text-gray-600 text-sm mb-4">Portuguese legal term with definition</p>
            </div>

            <div className="space-y-4">
              {/* Definition */}
              {selectedEntry.explanation && (
                <div className="bg-purple-50 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-purple-800 mb-2">Definition</h4>
                  <p className="text-gray-800 leading-relaxed">{selectedEntry.explanation}</p>
                </div>
              )}

              {/* Tetum Translation if available */}
              {selectedEntry.tetum && (
                <div className="flex items-start gap-3">
                  <span className="text-gray-500 font-medium min-w-[60px]">Tetum:</span>
                  <div className="flex-1">
                    <p className="text-gray-800">{selectedEntry.tetum}</p>
                  </div>
                </div>
              )}

              {/* English Translation if available */}
              {selectedEntry.english && (
                <div className="flex items-start gap-3">
                  <span className="text-gray-500 font-medium min-w-[60px]">English:</span>
                  <div className="flex-1">
                    <p className="text-gray-800">{selectedEntry.english}</p>
                  </div>
                </div>
              )}

              {/* Additional Information */}
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">
                  <strong>Legal Context:</strong> This Portuguese legal term is part of the 
                  comprehensive legal terminology used in Portuguese-speaking legal systems 
                  and Portuguese legal documentation.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* No Results */}
      {showResults && searchResults.length === 0 && !isLoading && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
          <p className="text-gray-500">No Portuguese glossary terms found for "{wordSearch}"</p>
        </div>
      )}

      {/* Loading */}
      {isLoading && showResults && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
          <p className="text-gray-500">Searching Portuguese glossary...</p>
        </div>
      )}

      {/* Error */}
      {error && showResults && (
        <div className="bg-red-50 rounded-lg border border-red-200 p-6 text-center">
          <p className="text-red-600">Error searching Portuguese glossary. Please try again.</p>
        </div>
      )}
    </div>
  );
}
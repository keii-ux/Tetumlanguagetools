import { useState, useEffect, useRef } from "react";
import { Search, Volume2, Copy, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSearchEntries } from "@/lib/search";
import { DictionaryEntry } from "@shared/schema";

interface LegalDictionarySearchProps {
  onEntrySelect?: (entry: DictionaryEntry) => void;
}

interface PredictiveDropdownProps {
  searchTerm: string;
  entries: DictionaryEntry[];
  onSelect: (entry: DictionaryEntry) => void;
  onClose: () => void;
  isVisible: boolean;
  activeLanguage: "tetum" | "portuguese" | "english" | "all";
}

function PredictiveDropdown({ 
  searchTerm, 
  entries, 
  onSelect, 
  onClose, 
  isVisible, 
  activeLanguage 
}: PredictiveDropdownProps) {
  if (!isVisible || !searchTerm || entries.length === 0) return null;

  return (
    <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto z-50">
      {entries.slice(0, 10).map((entry, index) => (
        <div
          key={entry.id}
          onClick={() => onSelect(entry)}
          className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
        >
          <div className="font-medium text-gray-900">
            {getDisplayTerm(entry, activeLanguage)}
          </div>
          <div className="text-sm text-gray-600">
            {getTranslation(entry, activeLanguage)}
          </div>
        </div>
      ))}
    </div>
  );
}

function getDisplayTerm(entry: DictionaryEntry, activeLanguage: string) {
  if (activeLanguage === "tetum" && entry.tetum) return entry.tetum;
  if (activeLanguage === "portuguese" && entry.portuguese) return entry.portuguese;
  if (activeLanguage === "english" && entry.english) return entry.english;
  return entry.tetum || entry.portuguese || entry.english || "";
}

function getTranslation(entry: DictionaryEntry, activeLanguage: string) {
  const translations = [];
  if (activeLanguage !== "tetum" && entry.tetum) translations.push(`Tetum: ${entry.tetum}`);
  if (activeLanguage !== "portuguese" && entry.portuguese) translations.push(`PT: ${entry.portuguese}`);
  if (activeLanguage !== "english" && entry.english) translations.push(`EN: ${entry.english}`);
  return translations.join(" | ");
}

export function LegalDictionarySearch({ onEntrySelect }: LegalDictionarySearchProps) {
  const [wordSearch, setWordSearch] = useState("");
  const [activeLanguage, setActiveLanguage] = useState<"tetum" | "portuguese" | "english" | "all">("tetum");
  const [showResults, setShowResults] = useState(false);
  const [showPredictive, setShowPredictive] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<DictionaryEntry | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  const { data: searchResults = [], isLoading, error } = useSearchEntries({
    query: wordSearch,
    dictionaryType: "legal",
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
    setWordSearch(getDisplayTerm(entry, activeLanguage) || "");
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
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Legal Dictionary</h2>
        <p className="text-gray-600">Tetum-English-Portuguese Legal Terminology</p>
      </div>

      {/* Language Tabs */}
      <div className="flex justify-center mb-8">
        <div className="flex bg-white rounded-lg border border-gray-200 overflow-hidden">
          {["tetum", "portuguese", "english", "all"].map((lang) => (
            <button
              key={lang}
              onClick={() => setActiveLanguage(lang as any)}
              className={`px-4 py-2 text-sm font-medium capitalize ${
                activeLanguage === lang 
                  ? "bg-blue-100 text-blue-900 border-b-2 border-blue-400" 
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {lang}
            </button>
          ))}
        </div>
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
              placeholder={`Enter legal term in ${activeLanguage === "all" ? "any language" : activeLanguage} (min 2 characters)`}
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
              activeLanguage={activeLanguage}
            />
          </div>
        </div>
      </div>

      {/* Search Button */}
      <div className="flex justify-center mb-8">
        <Button
          onClick={handleSearch}
          className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-2 rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed"
          disabled={!wordSearch.trim() || wordSearch.length < 2}
        >
          <Search className="w-4 h-4 mr-2" />
          Search Legal Terms
        </Button>
      </div>

      {/* Results Section */}
      {showResults && selectedEntry && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="mb-4">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-lg font-semibold text-gray-900">
                  {getDisplayTerm(selectedEntry, activeLanguage)}
                </h3>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => speakText(getDisplayTerm(selectedEntry, activeLanguage) || "")}
                  className="p-1 hover:bg-gray-100"
                >
                  <Volume2 className="h-4 w-4 text-gray-600" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => copyToClipboard(getDisplayTerm(selectedEntry, activeLanguage) || "")}
                  className="p-1 hover:bg-gray-100"
                >
                  <Copy className="h-4 w-4 text-gray-600" />
                </Button>
              </div>
              <p className="text-gray-600 text-sm mb-4">Legal terminology from constitutional and legal sources</p>
            </div>

            <div className="space-y-4">
              {/* Tetum */}
              {selectedEntry.tetum && (
                <div className="flex items-start gap-3">
                  <span className="text-gray-500 font-medium min-w-[60px]">Tetum:</span>
                  <div className="flex-1">
                    <p className="text-gray-800 font-medium">{selectedEntry.tetum}</p>
                  </div>
                </div>
              )}

              {/* Portuguese */}
              {selectedEntry.portuguese && (
                <div className="flex items-start gap-3">
                  <span className="text-gray-500 font-medium min-w-[60px]">PT:</span>
                  <div className="flex-1">
                    <p className="text-gray-800">{selectedEntry.portuguese}</p>
                  </div>
                </div>
              )}

              {/* English */}
              {selectedEntry.english && (
                <div className="flex items-start gap-3">
                  <span className="text-gray-500 font-medium min-w-[60px]">EN:</span>
                  <div className="flex-1">
                    <p className="text-gray-800">{selectedEntry.english}</p>
                  </div>
                </div>
              )}

              {/* Notes */}
              {selectedEntry.notes && (
                <div className="flex items-start gap-3">
                  <span className="text-gray-500 font-medium min-w-[60px]">Notes:</span>
                  <div className="flex-1">
                    <p className="text-gray-600 italic">{selectedEntry.notes}</p>
                  </div>
                </div>
              )}

              {/* Source */}
              {selectedEntry.source && (
                <div className="flex items-start gap-3">
                  <span className="text-gray-500 font-medium min-w-[60px]">Source:</span>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500">{selectedEntry.source}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* No Results */}
      {showResults && searchResults.length === 0 && !isLoading && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
          <p className="text-gray-500">No legal terms found for "{wordSearch}"</p>
        </div>
      )}

      {/* Loading */}
      {isLoading && showResults && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
          <p className="text-gray-500">Searching legal terms...</p>
        </div>
      )}

      {/* Error */}
      {error && showResults && (
        <div className="bg-red-50 rounded-lg border border-red-200 p-6 text-center">
          <p className="text-red-600">Error searching for legal terms. Please try again.</p>
        </div>
      )}
    </div>
  );
}
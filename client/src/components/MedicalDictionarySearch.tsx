import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useSearchEntries } from "@/lib/search";
import { DictionaryEntry } from "@shared/schema";

interface MedicalDictionarySearchProps {
  onEntrySelect?: (entry: DictionaryEntry) => void;
}

export function MedicalDictionarySearch({ onEntrySelect }: MedicalDictionarySearchProps) {
  const [wordSearch, setWordSearch] = useState("");
  const [sentenceSearch, setSentenceSearch] = useState("");
  const [activeLanguage, setActiveLanguage] = useState<"tetum" | "english" | "both">("tetum");
  const [showResults, setShowResults] = useState(false);

  const { data: searchResults = [], isLoading } = useSearchEntries({
    query: wordSearch,
    dictionaryType: "medical",
    language: "all",
    exactMatch: false,
    includeDefinitions: true,
    caseSensitive: false,
  });

  const handleSearch = () => {
    if (wordSearch.trim()) {
      setShowResults(true);
      if (searchResults.length > 0) {
        onEntrySelect?.(searchResults[0]);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
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
              <div className="text-sm font-medium text-gray-600 w-20">WORD</div>
              <div className="flex-1">
                <Input
                  placeholder={activeLanguage === "tetum" ? "Enter Tetum word" : activeLanguage === "english" ? "Enter English word" : "Enter word"}
                  value={wordSearch}
                  onChange={(e) => setWordSearch(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="border-0 focus:ring-0 text-gray-600 placeholder-gray-400"
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
        {showResults && searchResults.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {getDisplayTerm(searchResults[0])}
              </h3>
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
              {searchResults.slice(0, 3).map((entry, index) => (
                <div key={entry.id} className="flex items-start gap-3">
                  <span className="text-gray-500 font-medium">{index + 1}.</span>
                  <div className="flex-1">
                    <p className="text-gray-700">
                      {getTranslation(entry)}
                    </p>
                    {entry.source && (
                      <p className="text-xs text-gray-400 mt-1">
                        From: {entry.source}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
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
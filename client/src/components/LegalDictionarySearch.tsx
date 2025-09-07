import { useState, useEffect, useRef } from "react";
import { Search, X, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useSearchEntries, useLegalEntries } from "@/lib/search";
import type { DictionaryEntry } from "@shared/schema";

interface LegalDictionarySearchProps {
  onEntrySelect?: (entry: DictionaryEntry) => void;
  selectedLanguage?: string;
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
        const tetumMatch = tetumField.toLowerCase().includes(searchLower);
        const englishMatch = englishField.toLowerCase().includes(searchLower);
        const portugueseMatch = portugueseField.toLowerCase().includes(searchLower);
        return tetumMatch || englishMatch || portugueseMatch;
      } else if (activeLanguage === "portuguese") {
        const portugueseMatch = portugueseField.toLowerCase().includes(searchLower);
        const tetumMatch = tetumField.toLowerCase().includes(searchLower);
        const englishMatch = englishField.toLowerCase().includes(searchLower);
        return portugueseMatch || tetumMatch || englishMatch;
      } else if (activeLanguage === "english") {
        const englishMatch = englishField.toLowerCase().includes(searchLower);
        const tetumMatch = tetumField.toLowerCase().includes(searchLower);
        const portugueseMatch = portugueseField.toLowerCase().includes(searchLower);
        return englishMatch || tetumMatch || portugueseMatch;
      } else {
        // Search in all languages for "all" mode
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
        if (activeLanguage === "portuguese") return entry.portuguese || "";
        return entry.tetum || entry.english || entry.portuguese || "";
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
      <Card className="absolute top-full left-0 right-0 z-50 mt-1 border shadow-lg bg-white dark:bg-gray-800">
        <CardContent className="p-3">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No results found for "{searchTerm}"
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="absolute top-full left-0 right-0 z-50 mt-1 border shadow-lg bg-white dark:bg-gray-800 max-h-80 overflow-y-auto">
      <CardContent className="p-0">
        {filteredEntries.map((entry, index) => (
          <div
            key={`${entry.id}-${index}`}
            className={`p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 ${
              index !== filteredEntries.length - 1 ? 'border-b border-gray-100 dark:border-gray-700' : ''
            }`}
            onClick={() => {
              onSelect(entry);
              onClose();
            }}
          >
            <div className="font-medium text-blue-600 dark:text-blue-400 text-sm">
              {getDisplayTerm(entry, activeLanguage)}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-300 mt-1">
              {getTranslation(entry, activeLanguage)}
            </div>
            {entry.source && (
              <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                Source: {entry.source}
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function getDisplayTerm(entry: DictionaryEntry, activeLanguage: string) {
  // Enhanced display term logic for cross-language support
  if (activeLanguage === "tetum") {
    return entry.tetum || entry.portuguese || entry.english || "No term";
  } else if (activeLanguage === "portuguese") {
    return entry.portuguese || entry.tetum || entry.english || "No term";
  } else if (activeLanguage === "english") {
    return entry.english || entry.tetum || entry.portuguese || "No term";
  } else {
    return entry.tetum || entry.portuguese || entry.english || "No term";
  }
}

function getTranslation(entry: DictionaryEntry, activeLanguage: string) {
  // Enhanced translation logic with all language support
  const translations = [];
  if (activeLanguage === "tetum") {
    if (entry.portuguese) translations.push(`PT: ${entry.portuguese}`);
    if (entry.english) translations.push(`EN: ${entry.english}`);
  } else if (activeLanguage === "portuguese") {
    if (entry.tetum) translations.push(`TET: ${entry.tetum}`);
    if (entry.english) translations.push(`EN: ${entry.english}`);
  } else if (activeLanguage === "english") {
    if (entry.tetum) translations.push(`TET: ${entry.tetum}`);
    if (entry.portuguese) translations.push(`PT: ${entry.portuguese}`);
  } else {
    // For "all" mode, show all available translations
    if (entry.tetum) translations.push(`TET: ${entry.tetum}`);
    if (entry.portuguese) translations.push(`PT: ${entry.portuguese}`);
    if (entry.english) translations.push(`EN: ${entry.english}`);
  }
  return translations.length > 0 ? translations.join(" | ") : "No translation available";
}

export function LegalDictionarySearch({ onEntrySelect, selectedLanguage }: LegalDictionarySearchProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<DictionaryEntry | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  
  // Map selectedLanguage to activeLanguage
  const getActiveLanguage = (): "tetum" | "portuguese" | "english" | "all" => {
    if (selectedLanguage === "tet") return "tetum";
    if (selectedLanguage === "en") return "english";
    if (selectedLanguage === "pt") return "portuguese";
    return "all"; // default
  };
  
  const [activeLanguage, setActiveLanguage] = useState<"tetum" | "portuguese" | "english" | "all">(getActiveLanguage());
  
  // Update activeLanguage when selectedLanguage changes
  useEffect(() => {
    setActiveLanguage(getActiveLanguage());
  }, [selectedLanguage]);

  // Get all legal entries for comprehensive suggestions
  const { data: entries = [] } = useLegalEntries();
  
  // Map activeLanguage to search language parameter
  const getSearchLanguage = () => {
    if (activeLanguage === "tetum") return "tetum";
    if (activeLanguage === "portuguese") return "portuguese";
    if (activeLanguage === "english") return "english";
    return "all"; // for "all"
  };
  
  const { data: searchResults = [], isLoading, error } = useSearchEntries({
    query: searchTerm,
    dictionaryType: "legal",
    language: getSearchLanguage(),
    exactMatch: false,
    includeDefinitions: true,
    caseSensitive: false,
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleEntrySelect = (entry: DictionaryEntry) => {
    setSelectedEntry(entry);
    setSearchTerm(getDisplayTerm(entry, activeLanguage));
    setShowDropdown(false);
    setShowResults(true);
    onEntrySelect?.(entry);
  };

  const handleSearch = () => {
    if (searchTerm.trim()) {
      setShowDropdown(false);
      setShowResults(true);
      if (searchResults.length > 0) {
        setSelectedEntry(searchResults[0]);
        onEntrySelect?.(searchResults[0]);
      }
    }
  };

  const handleInputChange = (value: string) => {
    setSearchTerm(value);
    setShowDropdown(value.length >= 1); // Show suggestions from 1 character
  };

  const clearSearch = () => {
    setSearchTerm("");
    setShowDropdown(false);
    setShowResults(false);
    setSelectedEntry(null);
  };
  
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };


  const getEntryTranslation = (entry: DictionaryEntry) => {
    if (activeLanguage === "tetum") {
      return entry.portuguese || entry.english || "No translation available";
    } else if (activeLanguage === "portuguese") {
      return entry.tetum || entry.english || "No translation available";
    } else if (activeLanguage === "english") {
      return entry.tetum || entry.portuguese || "No translation available";
    } else {
      return `${entry.portuguese || ""} | ${entry.tetum || ""} | ${entry.english || ""}`;
    }
  };

  const getEntryDisplayTerm = (entry: DictionaryEntry) => {
    if (activeLanguage === "tetum") {
      return entry.tetum || entry.portuguese || entry.english;
    } else if (activeLanguage === "portuguese") {
      return entry.portuguese || entry.tetum || entry.english;
    } else if (activeLanguage === "english") {
      return entry.english || entry.tetum || entry.portuguese;
    } else {
      return entry.tetum || entry.portuguese || entry.english;
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Legal Terminology</h2>
      </div>
      <div className="flex gap-2 justify-center">
        <Select value={activeLanguage} onValueChange={(value: "tetum" | "portuguese" | "english" | "all") => setActiveLanguage(value)}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Languages</SelectItem>
            <SelectItem value="tetum">Tetum</SelectItem>
            <SelectItem value="portuguese">Portuguese</SelectItem>
            <SelectItem value="english">English</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div ref={searchRef} className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="text"
            placeholder={activeLanguage === "tetum" ? "Search Tetum legal terms..." : activeLanguage === "portuguese" ? "Search Portuguese legal terms..." : activeLanguage === "english" ? "Search English legal terms..." : "Search legal terms..."}
            value={searchTerm}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSearch();
              }
            }}
            onFocus={() => setShowDropdown(searchTerm.length >= 1)}
            className="pl-10 pr-12 py-3 text-lg border-2 focus:border-blue-500 dark:focus:border-blue-400"
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearSearch}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        <PredictiveDropdown
          searchTerm={searchTerm}
          entries={entries}
          onSelect={handleEntrySelect}
          onClose={() => setShowDropdown(false)}
          isVisible={showDropdown}
          activeLanguage={activeLanguage}
        />
      </div>
      <div className="flex gap-2 justify-center">
        <Button 
          onClick={handleSearch}
          disabled={!searchTerm.trim() || isLoading}
          className="px-8"
        >
          {isLoading ? "Searching..." : "Search"}
        </Button>
      </div>
      {/* Results Section */}
      {showResults && selectedEntry && (
        <div className="space-y-6">
          {/* Main Entry Display */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="mb-4">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-lg font-semibold text-gray-900">
                  {getEntryDisplayTerm(selectedEntry)}
                </h3>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => copyToClipboard(getEntryDisplayTerm(selectedEntry) || "")}
                  className="p-1 hover:bg-gray-100"
                >
                  <Copy className="h-4 w-4 text-gray-600" />
                </Button>
              </div>
              <p className="text-gray-600 text-sm mb-4">
                Legal terminology from Timor-Leste legal documents
              </p>
              
              <div className="flex items-center gap-2 mb-4">
                <Button
                  size="sm"
                  className="bg-blue-100 text-blue-700 hover:bg-blue-200 text-xs px-3 py-1"
                >
                  Legal Term
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <span className="text-gray-500 font-medium">1.</span>
                <div className="flex-1">
                  <p className="text-gray-700">
                    {getEntryTranslation(selectedEntry)}
                  </p>
                  {selectedEntry.explanation && (
                    <p className="text-gray-600 text-sm mt-2 italic">
                      {selectedEntry.explanation}
                    </p>
                  )}
                  {selectedEntry.source && (
                    <p className="text-xs text-gray-400 mt-1">
                      Source: {selectedEntry.source}
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
                    <em>Legal terminology.</em> Used in legal contexts and official documents 
                    of the Democratic Republic of Timor-Leste, including constitutional, civil, and penal law.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Translation Section */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <Separator className="mb-6" />
            <div className="mb-4">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-lg font-semibold text-gray-900">
                  {activeLanguage === "tetum" ? selectedEntry.portuguese || selectedEntry.english :
                   activeLanguage === "portuguese" ? selectedEntry.tetum || selectedEntry.english :
                   activeLanguage === "english" ? selectedEntry.tetum || selectedEntry.portuguese :
                   selectedEntry.portuguese || selectedEntry.english}
                </h3>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    const altTerm = activeLanguage === "tetum" ? selectedEntry.portuguese || selectedEntry.english :
                                   activeLanguage === "portuguese" ? selectedEntry.tetum || selectedEntry.english :
                                   activeLanguage === "english" ? selectedEntry.tetum || selectedEntry.portuguese :
                                   selectedEntry.portuguese || selectedEntry.english;
                    copyToClipboard(altTerm || "");
                  }}
                  className="p-1 hover:bg-gray-100"
                >
                  <Copy className="h-4 w-4 text-gray-600" />
                </Button>
              </div>
              <p className="text-gray-600 text-sm mb-4">
                Alternative language definition and context
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <span className="text-gray-500 font-medium">1.</span>
                <div className="flex-1">
                  <p className="text-gray-700">
                    {activeLanguage === "tetum" 
                      ? (selectedEntry.portuguese || selectedEntry.english || "Translation not available")
                      : activeLanguage === "portuguese"
                      ? (selectedEntry.tetum || selectedEntry.english || "Translation not available")
                      : activeLanguage === "english"
                      ? (selectedEntry.tetum || selectedEntry.portuguese || "Translation not available")
                      : (selectedEntry.tetum || selectedEntry.portuguese || "Translation not available")}
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
                    Cross-reference term used in multilingual legal contexts and jurisprudence 
                    across Tetum, Portuguese, and English legal systems in Timor-Leste.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* No Results */}
      {showResults && searchResults.length === 0 && !isLoading && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
          <p className="text-gray-500">No legal terms found for "{searchTerm}"</p>
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
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
          About Tetum Legal Dictionary
        </h3>
        <p className="text-sm text-blue-800 dark:text-blue-200">
          This dictionary contains comprehensive legal terminology in Tetum, Portuguese, and English. Only authentic sources were used, adjusting to INL standard.
        </p>
      </div>
    </div>
  );
}
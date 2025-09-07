import { useState, useEffect, useRef } from "react";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import type { DictionaryEntry } from "@shared/schema";

interface TetumGlossarySearchProps {
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
  if (!isVisible || !searchTerm || entries.length === 0) {
    return null;
  }

  const filteredEntries = entries
    .filter(entry => 
      entry.tetum?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.explanation?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .slice(0, 8);

  if (filteredEntries.length === 0) {
    return (
      <Card className="absolute top-full left-0 right-0 z-50 mt-1 border shadow-lg bg-white dark:bg-gray-800">
        <CardContent className="p-3">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            La hetan rezultadu ba "{searchTerm}"
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
            key={entry.id}
            className={`p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 ${
              index !== filteredEntries.length - 1 ? 'border-b border-gray-100 dark:border-gray-700' : ''
            }`}
            onClick={() => onSelect(entry)}
          >
            <div className="font-medium text-blue-600 dark:text-blue-400 text-sm">
              {entry.tetum}
            </div>
            {entry.explanation && (
              <div className="text-xs text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">
                {entry.explanation.length > 100 
                  ? `${entry.explanation.substring(0, 100)}...`
                  : entry.explanation
                }
              </div>
            )}
            <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              {entry.source}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function TetumGlossarySearch({ onEntrySelect }: TetumGlossarySearchProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [entries, setEntries] = useState<DictionaryEntry[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<DictionaryEntry | null>(null);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Load Tetum glossary entries
  useEffect(() => {
    const loadEntries = async () => {
      try {
        const response = await fetch("/api/tetum-glossary/entries");
        if (response.ok) {
          const data = await response.json();
          setEntries(data);
        }
      } catch (error) {
        console.error("Failed to load Tetum glossary entries:", error);
      }
    };

    loadEntries();
  }, []);

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
    setSearchTerm(entry.tetum || "");
    setShowDropdown(false);
    setSelectedEntry(entry);
    setShowResults(true);
    onEntrySelect?.(entry);
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;

    setIsLoading(true);
    try {
      const queryParams = new URLSearchParams({
        query: searchTerm,
        dictionaryType: "tetum-glossary"
      });
      const response = await fetch(`/api/tetum-glossary/search?${queryParams}`);
      if (response.ok) {
        const results = await response.json();
        if (results.length > 0) {
          setSelectedEntry(results[0]);
          setShowResults(true);
          onEntrySelect?.(results[0]);
        }
      }
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (value: string) => {
    setSearchTerm(value);
    setShowDropdown(value.length > 0);
  };

  const clearSearch = () => {
    setSearchTerm("");
    setShowDropdown(false);
    setShowResults(false);
    setSelectedEntry(null);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Glosáriu Legál Tetum
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          Buka termu legál ho esplikasaun iha lian Tetum
        </p>
      </div>

      <div ref={searchRef} className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="text"
            placeholder="Hakerek termu legál iha ne'e..."
            value={searchTerm}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSearch();
              }
            }}
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
        />
      </div>

      <div className="flex gap-2 justify-center">
        <Button 
          onClick={handleSearch}
          disabled={!searchTerm.trim() || isLoading}
          className="px-8"
        >
          {isLoading ? "Buka hela..." : "Buka"}
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
                  {selectedEntry.tetum}
                </h3>
              </div>
              <p className="text-gray-600 text-sm mb-4">
                Termu legál husi dokumentu ofisiál Timor-Leste nian
              </p>
              
              <div className="flex items-center gap-2 mb-4">
                <button className="bg-green-100 text-green-700 hover:bg-green-200 text-xs px-3 py-1 rounded">
                  Termu Tetum
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <span className="text-gray-500 font-medium">1.</span>
                <div className="flex-1">
                  <p className="text-gray-700">
                    {selectedEntry.explanation || "Esplikasaun la iha"}
                  </p>
                  {selectedEntry.source && (
                    <p className="text-xs text-gray-400 mt-1">
                      Fonte: {selectedEntry.source}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="text-gray-500 font-medium">2.</span>
                <div className="flex-1">
                  <p className="text-gray-700">
                    <em>Terminolojia legál.</em> Uza iha kontestu legál no dokumentu ofisiál 
                    República Demokrátika Timor-Leste nian, inklui lei konstituisionál, sivíl, no penál.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* No Results */}
      {showResults && !selectedEntry && !isLoading && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
          <p className="text-gray-500">La hetan termu legál ba "{searchTerm}"</p>
        </div>
      )}

      {/* Loading */}
      {isLoading && showResults && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
          <p className="text-gray-500">Buka termu legál...</p>
        </div>
      )}

      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
          Kona-ba Glosáriu Legál Tetum
        </h3>
        <p className="text-sm text-blue-800 dark:text-blue-200">
          Glosáriu ne'e inklui termu legál importante sira ho esplikasaun detalladu iha lian Tetum. 
          Nia inklui termu husi Constituisaun RDTL, Kódigu Sivíl, Kódigu Penál, no dokumentu legál seluk.
        </p>
      </div>
    </div>
  );
}
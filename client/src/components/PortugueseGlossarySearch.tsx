import { useState, useEffect, useRef } from "react";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import type { DictionaryEntry } from "@shared/schema";

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
  if (!isVisible || !searchTerm || entries.length === 0) {
    return null;
  }

  const filteredEntries = entries
    .filter(entry => 
      entry.portuguese?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.explanation?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .slice(0, 8);

  if (filteredEntries.length === 0) {
    return (
      <Card className="absolute top-full left-0 right-0 z-50 mt-1 border shadow-lg bg-white dark:bg-gray-800">
        <CardContent className="p-3">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Nenhum resultado encontrado para "{searchTerm}"
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
              {entry.portuguese}
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

export function PortugueseGlossarySearch({ onEntrySelect }: PortugueseGlossarySearchProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [entries, setEntries] = useState<DictionaryEntry[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Load Portuguese glossary entries
  useEffect(() => {
    const loadEntries = async () => {
      try {
        const response = await fetch("/api/portuguese-glossary/entries");
        if (response.ok) {
          const data = await response.json();
          setEntries(data);
        }
      } catch (error) {
        console.error("Failed to load Portuguese glossary entries:", error);
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
    setSearchTerm(entry.portuguese || "");
    setShowDropdown(false);
    onEntrySelect?.(entry);
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;

    setIsLoading(true);
    try {
      const queryParams = new URLSearchParams({
        query: searchTerm,
        dictionaryType: "portuguese-glossary"
      });
      const response = await fetch(`/api/portuguese-glossary/search?${queryParams}`);
      if (response.ok) {
        const results = await response.json();
        if (results.length > 0 && onEntrySelect) {
          onEntrySelect(results[0]);
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
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Glossário Jurídico Português
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          Pesquise termos jurídicos com definições em português
        </p>
      </div>

      <div ref={searchRef} className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="text"
            placeholder="Digite o termo jurídico aqui..."
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
          {isLoading ? "Pesquisando..." : "Pesquisar"}
        </Button>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
          Sobre o Glossário Jurídico Português
        </h3>
        <p className="text-sm text-blue-800 dark:text-blue-200">
          Este glossário contém termos jurídicos importantes com definições claras em português. 
          Inclui terminologia do direito civil, penal, constitucional, administrativo e outras áreas do direito.
        </p>
      </div>
    </div>
  );
}
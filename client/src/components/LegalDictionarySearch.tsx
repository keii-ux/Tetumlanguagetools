import { useState, useEffect, useRef } from "react";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { DictionaryEntry } from "@shared/schema";

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
  if (!isVisible || !searchTerm || entries.length === 0) {
    return null;
  }

  const filteredEntries = entries
    .filter(entry => {
      const searchLower = searchTerm.toLowerCase();
      if (activeLanguage === "tetum") {
        return entry.tetum?.toLowerCase().includes(searchLower);
      } else if (activeLanguage === "portuguese") {
        return entry.portuguese?.toLowerCase().includes(searchLower);
      } else if (activeLanguage === "english") {
        return entry.english?.toLowerCase().includes(searchLower);
      } else {
        return entry.tetum?.toLowerCase().includes(searchLower) ||
               entry.portuguese?.toLowerCase().includes(searchLower) ||
               entry.english?.toLowerCase().includes(searchLower);
      }
    })
    .slice(0, 8);

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
            key={entry.id}
            className={`p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 ${
              index !== filteredEntries.length - 1 ? 'border-b border-gray-100 dark:border-gray-700' : ''
            }`}
            onClick={() => onSelect(entry)}
          >
            <div className="font-medium text-blue-600 dark:text-blue-400 text-sm">
              {getDisplayTerm(entry, activeLanguage)}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-300 mt-1">
              {getTranslation(entry, activeLanguage)}
            </div>
            <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              {entry.source}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function getDisplayTerm(entry: DictionaryEntry, activeLanguage: string) {
  if (activeLanguage === "tetum" && entry.tetum) return entry.tetum;
  if (activeLanguage === "portuguese" && entry.portuguese) return entry.portuguese;
  if (activeLanguage === "english" && entry.english) return entry.english;
  return entry.tetum || entry.portuguese || entry.english || "No term";
}

function getTranslation(entry: DictionaryEntry, activeLanguage: string) {
  const translations = [];
  if (activeLanguage !== "tetum" && entry.tetum) translations.push(`TET: ${entry.tetum}`);
  if (activeLanguage !== "portuguese" && entry.portuguese) translations.push(`PT: ${entry.portuguese}`);
  if (activeLanguage !== "english" && entry.english) translations.push(`EN: ${entry.english}`);
  return translations.join(" | ");
}

export function LegalDictionarySearch({ onEntrySelect }: LegalDictionarySearchProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [entries, setEntries] = useState<DictionaryEntry[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeLanguage, setActiveLanguage] = useState<"tetum" | "portuguese" | "english" | "all">("all");
  const searchRef = useRef<HTMLDivElement>(null);

  // Load legal dictionary entries
  useEffect(() => {
    const loadEntries = async () => {
      try {
        const response = await fetch("/api/legal/entries");
        if (response.ok) {
          const data = await response.json();
          setEntries(data);
        }
      } catch (error) {
        console.error("Failed to load legal entries:", error);
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
    setSearchTerm(getDisplayTerm(entry, activeLanguage));
    setShowDropdown(false);
    onEntrySelect?.(entry);
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/legal/search?q=${encodeURIComponent(searchTerm)}`);
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
          Legal Technical Dictionary
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          Search trilingual legal terminology (Tetum, Portuguese, English)
        </p>
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
            placeholder="Search legal terms..."
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

      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
          About Legal Technical Dictionary
        </h3>
        <p className="text-sm text-blue-800 dark:text-blue-200">
          This dictionary contains comprehensive legal terminology with translations in Tetum, Portuguese, and English. 
          Includes terms from the Constitution of RDTL, Civil Code, Penal Code, and other legal documents.
        </p>
      </div>
    </div>
  );
}
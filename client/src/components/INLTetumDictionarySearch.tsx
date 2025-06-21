import { useState, useEffect, useRef } from "react";
import { Search, X, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { DictionaryEntry } from "../../../shared/schema";

interface INLTetumDictionarySearchProps {
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

  return (
    <div className="absolute top-full left-0 right-0 z-50 mt-2 max-h-96 overflow-y-auto bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
      {entries.slice(0, 8).map((entry, index) => (
        <div
          key={entry.id || index}
          className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-100 dark:border-gray-600 last:border-b-0 first:rounded-t-xl last:rounded-b-xl"
          onClick={() => onSelect(entry)}
        >
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
                {entry.tetum}
              </h3>
              {entry.wordClass && (
                <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full">
                  {entry.wordClass}
                </span>
              )}
            </div>
            {entry.explanation && (
              <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                {entry.explanation}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export function INLTetumDictionarySearch({ onEntrySelect }: INLTetumDictionarySearchProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [entries, setEntries] = useState<DictionaryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

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
    setShowDropdown(false);
    setSearchTerm("");
    onEntrySelect?.(entry);
  };

  const searchEntries = async (query: string) => {
    if (!query.trim()) {
      setEntries([]);
      setShowDropdown(false);
      return;
    }

    setIsLoading(true);
    try {
      const queryParams = new URLSearchParams({
        query: query,
        dictionaryType: "inl-tetum"
      });
      const response = await fetch(`/api/inl-tetum/search?${queryParams}`);
      if (response.ok) {
        const results = await response.json();
        setEntries(results);
        setShowDropdown(true);
      }
    } catch (error) {
      console.error("Search error:", error);
      setEntries([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      searchEntries(searchTerm);
    }, 300);

    return () => clearTimeout(delayedSearch);
  }, [searchTerm]);

  const clearSearch = () => {
    setSearchTerm("");
    setEntries([]);
    setShowDropdown(false);
  };

  return (
    <div className="w-full space-y-4">
      <div ref={searchRef} className="relative">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            type="text"
            placeholder="Search Tetum words..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-12 pr-12 h-14 text-lg border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 rounded-full"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>

        {isLoading && (
          <div className="absolute top-full left-0 right-0 z-50 mt-2">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 text-center">
              <div className="animate-spin w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Searching...</p>
            </div>
          </div>
        )}

        <PredictiveDropdown
          searchTerm={searchTerm}
          entries={entries}
          onSelect={handleEntrySelect}
          onClose={() => setShowDropdown(false)}
          isVisible={showDropdown}
        />
      </div>

      {searchTerm && entries.length === 0 && !isLoading && (
        <Card>
          <CardContent className="p-6 text-center">
            <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <h3 className="text-lg font-medium text-foreground mb-2">No results found</h3>
            <p className="text-muted-foreground">
              Try searching with different terms or check your spelling.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
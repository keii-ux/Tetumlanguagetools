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
    <Card className="absolute top-full left-0 right-0 z-50 mt-1 max-h-96 overflow-y-auto border shadow-lg">
      <CardContent className="p-0">
        {entries.slice(0, 10).map((entry, index) => (
          <div
            key={entry.id || index}
            className="p-3 hover:bg-muted cursor-pointer border-b last:border-b-0"
            onClick={() => onSelect(entry)}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="font-medium text-foreground truncate">
                  {entry.tetum}
                </div>
                {entry.wordClass && (
                  <Badge variant="secondary" className="text-xs mt-1">
                    {entry.wordClass}
                  </Badge>
                )}
                {entry.explanation && (
                  <div className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {entry.explanation}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
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
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2 text-2xl font-bold text-foreground">
          <BookOpen className="w-8 h-8 text-blue-600" />
          <span>INL Tetum Dictionary</span>
        </div>
        <p className="text-muted-foreground">
          Search the comprehensive INL Tetum dictionary
        </p>
      </div>

      <div ref={searchRef} className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            type="text"
            placeholder="Search for Tetum words..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-10 h-12 text-lg"
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearSearch}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>

        {isLoading && (
          <div className="absolute top-full left-0 right-0 z-50 mt-1">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
                <p className="text-sm text-muted-foreground mt-2">Searching...</p>
              </CardContent>
            </Card>
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
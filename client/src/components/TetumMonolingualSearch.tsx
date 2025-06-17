import { useState, useRef, useEffect } from "react";
import { Search, Loader2, BookOpen, Volume2, Info } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSearchEntries } from "@/lib/search";
import { DictionaryEntry } from "@shared/schema";

interface TetumMonolingualSearchProps {
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

  return (
    <Card className="absolute top-full left-0 right-0 z-50 mt-1 max-h-80 overflow-y-auto border shadow-lg">
      <CardContent className="p-0">
        {entries.slice(0, 8).map((entry, index) => (
          <div
            key={entry.id}
            className="p-3 hover:bg-slate-50 cursor-pointer border-b last:border-b-0"
            onClick={() => onSelect(entry)}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="font-medium text-slate-900">
                  {entry.tetum}
                </div>
                {entry.explanation && (
                  <div className="text-sm text-slate-600 mt-1 line-clamp-2">
                    {entry.explanation}
                  </div>
                )}
                {entry.wordClass && (
                  <Badge variant="outline" className="mt-1 text-xs">
                    {entry.wordClass}
                  </Badge>
                )}
              </div>
              <div className="text-xs text-slate-500 ml-2">
                {entry.source}
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function TetumMonolingualSearch({ onEntrySelect }: TetumMonolingualSearchProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchMode, setSearchMode] = useState<"starts-with" | "contains">("starts-with");
  const searchRef = useRef<HTMLDivElement>(null);

  const { data: entries = [], isLoading } = useSearchEntries({
    query: searchTerm,
    dictionaryType: "tetum-monolingual",
    language: "tetum",
    exactMatch: false,
    includeDefinitions: true,
    caseSensitive: false,
  });

  const filteredEntries = entries.filter(entry => {
    if (!searchTerm) return false;
    const term = entry.tetum?.toLowerCase() || "";
    const search = searchTerm.toLowerCase();
    
    if (searchMode === "starts-with") {
      return term.startsWith(search);
    } else {
      return term.includes(search);
    }
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
    setShowDropdown(false);
    onEntrySelect?.(entry);
  };

  const handleSearch = () => {
    if (searchTerm.trim()) {
      setShowDropdown(true);
    }
  };

  const handleInputChange = (value: string) => {
    setSearchTerm(value);
    setShowDropdown(value.length > 0);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          <BookOpen className="w-6 h-6 text-orange-600" />
          <h1 className="text-2xl font-bold text-slate-900">Tetum Monolingual Dictionary</h1>
        </div>
        <p className="text-slate-600">
          Comprehensive Tetum definitions and explanations in Tetum language
        </p>
      </div>

      {/* Search Modes */}
      <Tabs value={searchMode} onValueChange={(value) => setSearchMode(value as "starts-with" | "contains")}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="starts-with">Starts with Letter</TabsTrigger>
          <TabsTrigger value="contains">Contains Text</TabsTrigger>
        </TabsList>

        <TabsContent value="starts-with" className="space-y-4">
          <div className="text-center">
            <p className="text-sm text-slate-600 mb-4">
              Search for Tetum words that start with specific letters
            </p>
          </div>
        </TabsContent>

        <TabsContent value="contains" className="space-y-4">
          <div className="text-center">
            <p className="text-sm text-slate-600 mb-4">
              Search for Tetum words containing specific text
            </p>
          </div>
        </TabsContent>
      </Tabs>

      {/* Search Interface */}
      <div ref={searchRef} className="relative">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <Input
              placeholder={
                searchMode === "starts-with" 
                  ? "Enter letter(s) to find Tetum words starting with..."
                  : "Enter text to search within Tetum words..."
              }
              value={searchTerm}
              onChange={(e) => handleInputChange(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="pl-10"
            />
            {isLoading && (
              <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin text-slate-400" />
            )}
          </div>
          <Button onClick={handleSearch} disabled={!searchTerm.trim() || isLoading}>
            Search
          </Button>
        </div>

        <PredictiveDropdown
          searchTerm={searchTerm}
          entries={filteredEntries}
          onSelect={handleEntrySelect}
          onClose={() => setShowDropdown(false)}
          isVisible={showDropdown}
        />
      </div>

      {/* Search Results Summary */}
      {searchTerm && (
        <div className="flex items-center justify-between text-sm text-slate-600">
          <span>
            {filteredEntries.length} Tetum word{filteredEntries.length !== 1 ? 's' : ''} found
          </span>
          {searchMode === "starts-with" && (
            <span>Starting with: "{searchTerm}"</span>
          )}
        </div>
      )}

      {/* Quick Start Guide */}
      <Card className="bg-orange-50 border-orange-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-orange-600 mt-0.5" />
            <div className="space-y-2">
              <h3 className="font-semibold text-orange-900">How to use</h3>
              <ul className="text-sm text-orange-800 space-y-1">
                <li>• <strong>Starts with:</strong> Type a letter to find all Tetum words beginning with that letter</li>
                <li>• <strong>Contains:</strong> Type any text to search within Tetum words</li>
                <li>• Click on any result to view detailed definition and usage</li>
                <li>• All definitions and explanations are provided in Tetum language</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
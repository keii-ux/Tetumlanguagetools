import { useState, useRef, useEffect } from "react";
import { Search, Loader2, BookOpen, Globe } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSearchEntries } from "@/lib/search";
import { DictionaryEntry } from "@shared/schema";

interface TetumMultilingualSearchProps {
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
            <div className="space-y-2">
              <div className="font-medium text-slate-900">
                {entry.tetum}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                {entry.portuguese && (
                  <div className="bg-blue-50 p-2 rounded">
                    <span className="text-xs font-semibold text-blue-700">PT:</span>
                    <span className="text-blue-800 ml-1">{entry.portuguese}</span>
                  </div>
                )}
                {entry.english && (
                  <div className="bg-green-50 p-2 rounded">
                    <span className="text-xs font-semibold text-green-700">EN:</span>
                    <span className="text-green-800 ml-1">{entry.english}</span>
                  </div>
                )}
                {entry.explanation && (
                  <div className="bg-orange-50 p-2 rounded">
                    <span className="text-xs font-semibold text-orange-700">Definition:</span>
                    <span className="text-orange-800 ml-1">{entry.explanation.substring(0, 50)}...</span>
                  </div>
                )}
              </div>
              {entry.wordClass && (
                <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
                  {entry.wordClass}
                </Badge>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function TetumMultilingualSearch({ onEntrySelect }: TetumMultilingualSearchProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchMode, setSearchMode] = useState<"all" | "legal" | "general">("all");
  const searchRef = useRef<HTMLDivElement>(null);

  const { data: entries = [], isLoading } = useSearchEntries({
    query: searchTerm,
    dictionaryType: searchMode,
    language: "all",
    exactMatch: false,
    includeDefinitions: true,
    caseSensitive: false,
  });

  const filteredEntries = entries.filter(entry => {
    if (!searchTerm) return false;
    const search = searchTerm.toLowerCase();
    
    return (entry.tetum?.toLowerCase() || "").includes(search) || 
           (entry.portuguese?.toLowerCase() || "").includes(search) ||
           (entry.english?.toLowerCase() || "").includes(search) ||
           (entry.explanation?.toLowerCase() || "").includes(search);
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
          <Globe className="w-6 h-6 text-purple-600" />
          <h1 className="text-2xl font-bold text-slate-900">Multilingual Tetum Dictionary</h1>
        </div>
        <p className="text-slate-600">
          Search across Tetum, Portuguese, and English with comprehensive translations
        </p>
      </div>

      {/* Dictionary Type Selection */}
      <Tabs value={searchMode} onValueChange={(value) => setSearchMode(value as "all" | "legal" | "general")}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">All Dictionaries</TabsTrigger>
          <TabsTrigger value="legal">Legal Terms</TabsTrigger>
          <TabsTrigger value="general">General Terms</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <div className="text-center">
            <p className="text-sm text-slate-600 mb-4">
              Search across all dictionary types for comprehensive results
            </p>
          </div>
        </TabsContent>

        <TabsContent value="legal" className="space-y-4">
          <div className="text-center">
            <p className="text-sm text-slate-600 mb-4">
              Focus on legal terminology and jurisprudence
            </p>
          </div>
        </TabsContent>

        <TabsContent value="general" className="space-y-4">
          <div className="text-center">
            <p className="text-sm text-slate-600 mb-4">
              Search general vocabulary and everyday terms
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
              placeholder="Search in Tetum, Portuguese, English, or definitions..."
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
            Found {filteredEntries.length} multilingual entries
          </span>
          <span>Dictionary: {searchMode}</span>
        </div>
      )}

      {/* Language Guide */}
      <Card className="bg-purple-50 border-purple-200">
        <CardContent className="p-4">
          <div className="text-center space-y-2">
            <h3 className="font-semibold text-purple-900">Multilingual Search Tips</h3>
            <p className="text-sm text-purple-800">
              This search covers all available languages and provides comprehensive cross-references
              between Tetum, Portuguese, English, and contextual definitions.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
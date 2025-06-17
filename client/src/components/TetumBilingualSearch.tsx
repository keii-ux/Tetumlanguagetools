import { useState, useRef, useEffect } from "react";
import { Search, Loader2, BookOpen, Globe } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSearchEntries } from "@/lib/search";
import { DictionaryEntry } from "@shared/schema";

interface TetumBilingualSearchProps {
  onEntrySelect?: (entry: DictionaryEntry) => void;
}

interface PredictiveDropdownProps {
  searchTerm: string;
  entries: DictionaryEntry[];
  onSelect: (entry: DictionaryEntry) => void;
  onClose: () => void;
  isVisible: boolean;
  activeLanguage: "tetum" | "english" | "both";
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

  const getDisplayTerm = (entry: DictionaryEntry) => {
    if (activeLanguage === "tetum") return entry.tetum || "";
    if (activeLanguage === "english") return entry.english || "";
    return entry.tetum || entry.english || "";
  };

  const getTranslation = (entry: DictionaryEntry) => {
    if (activeLanguage === "tetum") return entry.english || "";
    if (activeLanguage === "english") return entry.tetum || "";
    return entry.english || entry.tetum || "";
  };

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
                  {getDisplayTerm(entry)}
                </div>
                {getTranslation(entry) && (
                  <div className="text-sm text-slate-600 mt-1">
                    {getTranslation(entry)}
                  </div>
                )}
                {entry.wordClass && (
                  <Badge variant="outline" className="mt-1 text-xs bg-blue-50 text-blue-700 border-blue-200">
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

export function TetumBilingualSearch({ onEntrySelect }: TetumBilingualSearchProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeLanguage, setActiveLanguage] = useState<"tetum" | "english" | "both">("tetum");
  const searchRef = useRef<HTMLDivElement>(null);

  const { data: entries = [], isLoading } = useSearchEntries({
    query: searchTerm,
    dictionaryType: "medical",
    language: activeLanguage === "both" ? "all" : activeLanguage,
    exactMatch: false,
    includeDefinitions: true,
    caseSensitive: false,
  });

  const filteredEntries = entries.filter(entry => {
    if (!searchTerm) return false;
    const search = searchTerm.toLowerCase();
    
    if (activeLanguage === "tetum") {
      return (entry.tetum?.toLowerCase() || "").includes(search);
    } else if (activeLanguage === "english") {
      return (entry.english?.toLowerCase() || "").includes(search);
    } else {
      return (entry.tetum?.toLowerCase() || "").includes(search) || 
             (entry.english?.toLowerCase() || "").includes(search);
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
          <Globe className="w-6 h-6 text-blue-600" />
          <h1 className="text-2xl font-bold text-slate-900">Tetum-English Dictionary</h1>
        </div>
        <p className="text-slate-600">
          Bilingual dictionary with Tetum and English translations
        </p>
      </div>

      {/* Language Selection */}
      <Tabs value={activeLanguage} onValueChange={(value) => setActiveLanguage(value as "tetum" | "english" | "both")}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="tetum">Search Tetum</TabsTrigger>
          <TabsTrigger value="english">Search English</TabsTrigger>
          <TabsTrigger value="both">Search Both</TabsTrigger>
        </TabsList>

        <TabsContent value="tetum" className="space-y-4">
          <div className="text-center">
            <p className="text-sm text-slate-600 mb-4">
              Search for Tetum words to find their English translations
            </p>
          </div>
        </TabsContent>

        <TabsContent value="english" className="space-y-4">
          <div className="text-center">
            <p className="text-sm text-slate-600 mb-4">
              Search for English words to find their Tetum equivalents
            </p>
          </div>
        </TabsContent>

        <TabsContent value="both" className="space-y-4">
          <div className="text-center">
            <p className="text-sm text-slate-600 mb-4">
              Search in both Tetum and English simultaneously
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
                activeLanguage === "tetum" 
                  ? "Search Tetum words..."
                  : activeLanguage === "english"
                  ? "Search English words..."
                  : "Search in both languages..."
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
          activeLanguage={activeLanguage}
        />
      </div>

      {/* Search Results Summary */}
      {searchTerm && (
        <div className="flex items-center justify-between text-sm text-slate-600">
          <span>
            Found {filteredEntries.length} entries
          </span>
          <span>Language: {activeLanguage}</span>
        </div>
      )}
    </div>
  );
}
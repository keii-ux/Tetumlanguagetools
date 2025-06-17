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
  currentLanguage?: "tetum" | "english" | "portuguese";
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
                  <Badge variant="outline" className="mt-1 text-xs bg-orange-50 text-orange-700 border-orange-200">
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

const searchContent = {
  tetum: {
    startsWith: "Hahu ho Leta",
    contains: "Iha Liafuan",
    searchDescription: "Buka liafuan Tetum ne'ebé hahu ho letra ka liafuan espesífiku",
    placeholder: "Hakerek leta atu buka liafuan Tetum sira ne'ebé hahu ho...",
    resultsFound: "Hetan",
    resultsLabel: "liafuan Tetum",
    startsWithLabel: "ne'ebé hahu ho"
  },
  english: {
    startsWith: "Starts with Letter",
    contains: "Contains Word", 
    searchDescription: "Search for Tetum words that start with a letter or contain specific words",
    placeholder: "Type a letter to find Tetum words that start with...",
    resultsFound: "Found",
    resultsLabel: "Tetum words",
    startsWithLabel: "starting with"
  },
  portuguese: {
    startsWith: "Começa com Letra",
    contains: "Contém Palavra",
    searchDescription: "Procurar palavras Tetum que começam com uma letra ou contêm palavras específicas", 
    placeholder: "Digite uma letra para encontrar palavras Tetum que começam com...",
    resultsFound: "Encontrado",
    resultsLabel: "palavras Tetum",
    startsWithLabel: "começando com"
  }
};

export function TetumMonolingualSearch({ onEntrySelect, currentLanguage = "tetum" }: TetumMonolingualSearchProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchMode, setSearchMode] = useState<"starts-with" | "contains">("starts-with");
  const searchRef = useRef<HTMLDivElement>(null);
  const content = searchContent[currentLanguage];

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
      return term.includes(search) || (entry.explanation?.toLowerCase() || "").includes(search);
    }
  }).sort((a, b) => {
    // Sort by relevance: exact matches first, then starts-with, then contains
    const aWord = a.tetum?.toLowerCase() || "";
    const bWord = b.tetum?.toLowerCase() || "";
    const search = searchTerm.toLowerCase();
    
    if (aWord === search && bWord !== search) return -1;
    if (bWord === search && aWord !== search) return 1;
    if (aWord.startsWith(search) && !bWord.startsWith(search)) return -1;
    if (bWord.startsWith(search) && !aWord.startsWith(search)) return 1;
    
    return aWord.localeCompare(bWord);
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
          <h1 className="text-2xl font-bold text-slate-900">
            {currentLanguage === "tetum" ? "Disionáriu Tetum (INL)" :
             currentLanguage === "english" ? "Tetum Dictionary (INL)" :
             "Dicionário Tetum (INL)"}
          </h1>
        </div>
        <p className="text-slate-600">
          {currentLanguage === "tetum" ? "Disionáriu kompletu ho definisaun Tetum nian iha lian Tetum rasik" :
           currentLanguage === "english" ? "Complete dictionary with Tetum definitions in Tetum language" :
           "Dicionário completo com definições Tetum na língua Tetum"}
        </p>
      </div>
      {/* Search Modes */}
      <Tabs value={searchMode} onValueChange={(value) => setSearchMode(value as "starts-with" | "contains")}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="starts-with">{content.startsWith}</TabsTrigger>
          <TabsTrigger value="contains">{content.contains}</TabsTrigger>
        </TabsList>

        <TabsContent value="starts-with" className="space-y-4">
          <div className="text-center">
            <p className="text-sm text-slate-600 mb-4">
              {content.searchDescription}
            </p>
          </div>
        </TabsContent>

        <TabsContent value="contains" className="space-y-4">
          <div className="text-center">
            <p className="text-sm text-slate-600 mb-4">
              {content.searchDescription}
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
              placeholder={content.placeholder}
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
            Buka
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
            Hetan {filteredEntries.length} liafuan Tetum
          </span>
          {searchMode === "starts-with" && (
            <span>Ne'ebé hahu ho: "{searchTerm}"</span>
          )}
        </div>
      )}
    </div>
  );
}
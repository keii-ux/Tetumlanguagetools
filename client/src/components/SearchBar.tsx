import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Search, Settings } from "lucide-react";
import { SearchQuery } from "@shared/schema";
import { DICTIONARY_TYPES, LANGUAGES } from "@/lib/dictionaries";

interface SearchBarProps {
  onSearch: (query: SearchQuery) => void;
  initialQuery?: SearchQuery;
}

export function SearchBar({ onSearch, initialQuery }: SearchBarProps) {
  const [tetumSearchTerm, setTetumSearchTerm] = useState(initialQuery?.language === "tetum" ? initialQuery?.query || "" : "");
  const [englishSearchTerm, setEnglishSearchTerm] = useState(initialQuery?.language === "english" ? initialQuery?.query || "" : "");
  const [advancedQuery, setAdvancedQuery] = useState<SearchQuery>(
    initialQuery || {
      query: "",
      dictionaryType: "medical",
      language: "all",
      exactMatch: false,
      includeDefinitions: true,
      caseSensitive: false,
    }
  );
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  // Handle Tetum search
  const handleTetumSearch = (value: string) => {
    setTetumSearchTerm(value);
    setEnglishSearchTerm(""); // Clear other search
    const searchQuery: SearchQuery = {
      query: value,
      language: "tetum",
      dictionaryType: "medical",
      exactMatch: advancedQuery.exactMatch,
      includeDefinitions: advancedQuery.includeDefinitions,
      caseSensitive: advancedQuery.caseSensitive,
    };
    console.log("Tetum search query:", searchQuery);
    onSearch(searchQuery);
  };

  // Handle English search
  const handleEnglishSearch = (value: string) => {
    setEnglishSearchTerm(value);
    setTetumSearchTerm(""); // Clear other search
    const searchQuery: SearchQuery = {
      query: value,
      language: "english",
      dictionaryType: "medical",
      exactMatch: advancedQuery.exactMatch,
      includeDefinitions: advancedQuery.includeDefinitions,
      caseSensitive: advancedQuery.caseSensitive,
    };
    console.log("English search query:", searchQuery);
    onSearch(searchQuery);
  };

  // Handle advanced search
  const handleAdvancedSearch = () => {
    const currentQuery = tetumSearchTerm || englishSearchTerm;
    const currentLanguage = tetumSearchTerm ? "tetum" : englishSearchTerm ? "english" : "all";
    onSearch({
      ...advancedQuery,
      query: currentQuery,
      language: currentLanguage,
    });
    setIsAdvancedOpen(false);
  };

  // Clear search
  const handleClear = () => {
    setTetumSearchTerm("");
    setEnglishSearchTerm("");
    setAdvancedQuery({
      query: "",
      dictionaryType: "medical",
      language: "all",
      exactMatch: false,
      includeDefinitions: true,
      caseSensitive: false,
    });
    onSearch({
      query: "",
      dictionaryType: "medical",
      language: "all",
      exactMatch: false,
      includeDefinitions: true,
      caseSensitive: false,
    });
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        document.getElementById("tetum-search")?.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Trigger search on mount to show medical terms by default
  useEffect(() => {
    onSearch(advancedQuery);
  }, []);

  return (
    <div className="flex-1 max-w-4xl mx-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Tetum Search */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-blue-400" />
          </div>
          <Input
            id="tetum-search"
            type="text"
            placeholder="Search Tetum terms..."
            value={tetumSearchTerm}
            onChange={(e) => handleTetumSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && tetumSearchTerm && handleTetumSearch(tetumSearchTerm)}
            className="block w-full pl-10 pr-20 py-3 border border-blue-200 rounded-lg bg-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
          />
          <Button
            onClick={() => tetumSearchTerm && handleTetumSearch(tetumSearchTerm)}
            size="sm"
            className="absolute right-12 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0 bg-blue-500 hover:bg-blue-600 text-white rounded-md"
          >
            <Search className="h-3 w-3" />
          </Button>
          
        </div>

        {/* English Search */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-blue-400" />
          </div>
          <Input
            id="english-search"
            type="text"
            placeholder="Search English terms..."
            value={englishSearchTerm}
            onChange={(e) => handleEnglishSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && englishSearchTerm && handleEnglishSearch(englishSearchTerm)}
            className="block w-full pl-10 pr-20 py-3 border border-blue-200 rounded-lg bg-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
          />
          <Button
            onClick={() => englishSearchTerm && handleEnglishSearch(englishSearchTerm)}
            size="sm"
            className="absolute right-12 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0 bg-blue-500 hover:bg-blue-600 text-white rounded-md"
          >
            <Search className="h-3 w-3" />
          </Button>
          
        </div>
      </div>
      
      {/* Advanced Search Dialog */}
      <div className="mt-2 flex justify-center">
        <Dialog open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm" className="text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50">
              <Settings className="h-3 w-3 mr-1" />
              Advanced Search
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Advanced Search Options</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Dictionary Type</Label>
                  <Select
                    value={advancedQuery.dictionaryType}
                    onValueChange={(value) =>
                      setAdvancedQuery({
                        ...advancedQuery,
                        dictionaryType: value as any,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(DICTIONARY_TYPES).map(([key, value]) => (
                        <SelectItem key={key} value={key}>
                          {value}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Language</Label>
                  <Select
                    value={advancedQuery.language}
                    onValueChange={(value) =>
                      setAdvancedQuery({
                        ...advancedQuery,
                        language: value as any,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(LANGUAGES).map(([key, value]) => (
                        <SelectItem key={key} value={key}>
                          {value}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="exact-match"
                    checked={advancedQuery.exactMatch}
                    onCheckedChange={(checked) =>
                      setAdvancedQuery({
                        ...advancedQuery,
                        exactMatch: checked as boolean,
                      })
                    }
                  />
                  <Label htmlFor="exact-match">Exact match only</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="include-definitions"
                    checked={advancedQuery.includeDefinitions}
                    onCheckedChange={(checked) =>
                      setAdvancedQuery({
                        ...advancedQuery,
                        includeDefinitions: checked as boolean,
                      })
                    }
                  />
                  <Label htmlFor="include-definitions">Search in definitions</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="case-sensitive"
                    checked={advancedQuery.caseSensitive}
                    onCheckedChange={(checked) =>
                      setAdvancedQuery({
                        ...advancedQuery,
                        caseSensitive: checked as boolean,
                      })
                    }
                  />
                  <Label htmlFor="case-sensitive">Case sensitive</Label>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <Button variant="outline" onClick={handleClear}>
                  Clear All
                </Button>
                <Button onClick={handleAdvancedSearch}>
                  Apply Search
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
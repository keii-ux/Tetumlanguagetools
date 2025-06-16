import { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Search, Settings } from "lucide-react";
import { SearchQuery, DictionaryEntry } from "@shared/schema";
import { DICTIONARY_TYPES, LANGUAGES } from "@/lib/dictionaries";

interface SearchBarProps {
  onSearch: (query: SearchQuery) => void;
  initialQuery?: SearchQuery;
  searchResults?: DictionaryEntry[];
  isLoading?: boolean;
  onEntrySelect?: (entry: DictionaryEntry) => void;
}

export function SearchBar({ onSearch, initialQuery, searchResults = [], isLoading = false, onEntrySelect }: SearchBarProps) {
  const [tetumSearchTerm, setTetumSearchTerm] = useState(initialQuery?.language === "tetum" ? initialQuery?.query || "" : "");
  const [englishSearchTerm, setEnglishSearchTerm] = useState(initialQuery?.language === "english" ? initialQuery?.query || "" : "");
  const [advancedQuery, setAdvancedQuery] = useState<SearchQuery>(
    initialQuery || {
      query: "",
      dictionaryType: "medical" as const,
      language: "all" as const,
      exactMatch: false,
      includeDefinitions: true,
      caseSensitive: false,
    }
  );
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [showTetumDropdown, setShowTetumDropdown] = useState(false);
  const [showEnglishDropdown, setShowEnglishDropdown] = useState(false);
  const [activeTerm, setActiveTerm] = useState("");
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

  // Debounced search function
  const debouncedSearch = useCallback((searchQuery: SearchQuery) => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    
    const timeout = setTimeout(() => {
      console.log("Executing search:", searchQuery);
      onSearch(searchQuery);
    }, 300); // 300ms debounce
    
    setSearchTimeout(timeout);
  }, [onSearch, searchTimeout]);

  // Handle Tetum search
  const handleTetumSearch = (value: string) => {
    setTetumSearchTerm(value);
    setEnglishSearchTerm(""); // Clear other search
    setActiveTerm(value);
    setShowTetumDropdown(value.length > 0);
    setShowEnglishDropdown(false);
    
    const searchQuery: SearchQuery = {
      query: value,
      language: "tetum" as const,
      dictionaryType: "medical" as const,
      exactMatch: advancedQuery.exactMatch,
      includeDefinitions: advancedQuery.includeDefinitions,
      caseSensitive: advancedQuery.caseSensitive,
    };
    
    // Only search if there's a query or it's empty (to show default results)
    if (value.trim() || value === "") {
      debouncedSearch(searchQuery);
    }
  };

  // Handle English search
  const handleEnglishSearch = (value: string) => {
    setEnglishSearchTerm(value);
    setTetumSearchTerm(""); // Clear other search
    setActiveTerm(value);
    setShowEnglishDropdown(value.length > 0);
    setShowTetumDropdown(false);
    
    const searchQuery: SearchQuery = {
      query: value,
      language: "english" as const,
      dictionaryType: "medical" as const,
      exactMatch: advancedQuery.exactMatch,
      includeDefinitions: advancedQuery.includeDefinitions,
      caseSensitive: advancedQuery.caseSensitive,
    };
    
    // Only search if there's a query or it's empty (to show default results)
    if (value.trim() || value === "") {
      debouncedSearch(searchQuery);
    }
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
    const clearQuery: SearchQuery = {
      query: "",
      dictionaryType: "medical" as const,
      language: "all" as const,
      exactMatch: false,
      includeDefinitions: true,
      caseSensitive: false,
    };
    setAdvancedQuery(clearQuery);
    onSearch(clearQuery);
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
    const initialQuery: SearchQuery = {
      query: "",
      dictionaryType: "medical" as const,
      language: "all" as const,
      exactMatch: false,
      includeDefinitions: true,
      caseSensitive: false,
    };
    // Use timeout to avoid immediate search on mount
    const timeout = setTimeout(() => {
      onSearch(initialQuery);
    }, 100);
    
    return () => clearTimeout(timeout);
  }, [onSearch]);

  // Cleanup search timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchTimeout]);

  // Handle entry selection from dropdown
  const handleEntrySelect = (entry: DictionaryEntry) => {
    const term = entry.tetum || entry.english || "";
    if (showTetumDropdown) {
      setTetumSearchTerm(term);
    } else if (showEnglishDropdown) {
      setEnglishSearchTerm(term);
    }
    setShowTetumDropdown(false);
    setShowEnglishDropdown(false);
    if (onEntrySelect) {
      onEntrySelect(entry);
    }
  };

  // Filter results based on active search
  const getFilteredResults = () => {
    if (!activeTerm || activeTerm.length === 0) return [];
    // Use the search results passed as props from the parent component
    // These are already filtered by the backend based on the search query
    return (searchResults || []).slice(0, 10); // Limit to 10 results for dropdown performance
  };

  // Get display term for entry
  const getDisplayTerm = (entry: DictionaryEntry) => {
    return entry.tetum || entry.english || entry.portuguese || "Unknown";
  };

  // Get definition text for entry
  const getDefinitionText = (entry: DictionaryEntry) => {
    if (entry.english && entry.tetum) {
      return showTetumDropdown ? entry.english : entry.tetum;
    }
    return entry.explanation || entry.english || entry.tetum || entry.portuguese || "";
  };

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
            className="block w-full pl-10 pr-10 py-3 border border-blue-200 rounded-lg bg-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
          />
          <Button
            onClick={() => tetumSearchTerm && handleTetumSearch(tetumSearchTerm)}
            size="sm"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0 bg-blue-500 hover:bg-blue-600 text-white rounded-md"
          >
            <Search className="h-3 w-3" />
          </Button>
          
          {/* Tetum Predictive Dropdown */}
          {showTetumDropdown && getFilteredResults().length > 0 && (
            <div className="absolute top-full left-0 right-0 z-50 bg-white border border-blue-200 rounded-lg shadow-lg mt-1 max-h-60 overflow-y-auto">
              {isLoading ? (
                <div className="p-3 text-center text-gray-500">
                  <div className="animate-pulse">Searching...</div>
                </div>
              ) : (
                getFilteredResults().map((entry) => (
                  <div
                    key={entry.id}
                    onClick={() => handleEntrySelect(entry)}
                    className="p-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                  >
                    <div className="font-semibold text-blue-900 text-sm">
                      {getDisplayTerm(entry)}
                    </div>
                    <div className="text-xs text-gray-600 mt-1 line-clamp-1">
                      {getDefinitionText(entry)}
                    </div>
                    <div className="text-xs text-blue-600 mt-1">
                      {entry.source} • {entry.category}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
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
            className="block w-full pl-10 pr-10 py-3 border border-blue-200 rounded-lg bg-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
          />
          <Button
            onClick={() => englishSearchTerm && handleEnglishSearch(englishSearchTerm)}
            size="sm"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0 bg-blue-500 hover:bg-blue-600 text-white rounded-md"
          >
            <Search className="h-3 w-3" />
          </Button>
          
          {/* English Predictive Dropdown */}
          {showEnglishDropdown && getFilteredResults().length > 0 && (
            <div className="absolute top-full left-0 right-0 z-50 bg-white border border-blue-200 rounded-lg shadow-lg mt-1 max-h-60 overflow-y-auto">
              {isLoading ? (
                <div className="p-3 text-center text-gray-500">
                  <div className="animate-pulse">Searching...</div>
                </div>
              ) : (
                getFilteredResults().map((entry) => (
                  <div
                    key={entry.id}
                    onClick={() => handleEntrySelect(entry)}
                    className="p-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                  >
                    <div className="font-semibold text-blue-900 text-sm">
                      {getDisplayTerm(entry)}
                    </div>
                    <div className="text-xs text-gray-600 mt-1 line-clamp-1">
                      {getDefinitionText(entry)}
                    </div>
                    <div className="text-xs text-blue-600 mt-1">
                      {entry.source} • {entry.category}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Advanced Search Dialog */}
      <div className="mt-2 flex justify-center">
        <Dialog open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm" className="text-xs hover:text-blue-700 hover:bg-blue-50 text-[#0f0f0f]">
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
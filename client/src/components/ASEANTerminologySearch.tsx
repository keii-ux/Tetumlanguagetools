import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Globe, Languages, Zap, Loader2 } from "lucide-react";
import { useSearchEntries } from "@/lib/search";
import { DictionaryEntry, SearchQuery } from "@shared/schema";
import { buildSearchQuery } from "@/lib/dictionaries";
import { useToast } from "@/hooks/use-toast";

interface ASEANTerminologySearchProps {
  onEntrySelect: (entry: DictionaryEntry) => void;
}

export function ASEANTerminologySearch({ onEntrySelect }: ASEANTerminologySearchProps) {
  const [unifiedInput, setUnifiedInput] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("all");
  const [fromLanguage, setFromLanguage] = useState("en");
  const [toLanguage, setToLanguage] = useState("tet");
  const [translationResult, setTranslationResult] = useState("");
  const [isTranslating, setIsTranslating] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [dropdownSuggestions, setDropdownSuggestions] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const searchQuery: SearchQuery = buildSearchQuery({
    query: unifiedInput,
    dictionaryType: "asean",
    language: selectedLanguage === "all" ? "all" : selectedLanguage as any
  });

  const { data: searchResults = [], isLoading } = useSearchEntries(searchQuery);

  // Get all ASEAN entries for dropdown suggestions (only when needed)
  const allAseanQuery: SearchQuery = buildSearchQuery({
    query: unifiedInput.trim().length > 0 ? "" : "DISABLE_SEARCH",
    dictionaryType: "asean", 
    language: "all"
  });
  const { data: allAseanEntries = [] } = useSearchEntries(allAseanQuery);

  // Extract unique abbreviations from ASEAN entries
  const getAbbreviationsFromEntries = (entries: DictionaryEntry[]): string[] => {
    const abbreviations = entries
      .filter(entry => entry.dictionaryType === "asean")
      .map(entry => entry.english?.split(':')[0]?.trim())
      .filter(abbr => abbr && abbr.length > 0)
      .filter((abbr, index, arr) => arr.indexOf(abbr) === index) // Remove duplicates
      .sort();
    
    return abbreviations as string[];
  };

  const handleUnifiedInput = (value: string) => {
    setUnifiedInput(value);
    
    // Generate dropdown suggestions
    if (value.trim().length > 0) {
      const allAbbreviations = getAbbreviationsFromEntries(allAseanEntries);
      const suggestions = allAbbreviations
        .filter(abbr => abbr.toLowerCase().startsWith(value.toLowerCase()))
        .slice(0, 10); // Limit to 10 suggestions
      
      setDropdownSuggestions(suggestions);
      setShowDropdown(suggestions.length > 0);
    } else {
      setShowDropdown(false);
      setDropdownSuggestions([]);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setUnifiedInput(suggestion);
    setShowDropdown(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleTranslate = async () => {
    if (!unifiedInput.trim()) {
      toast({
        title: "Translation Error",
        description: "Please enter text to translate",
        variant: "destructive"
      });
      return;
    }

    setIsTranslating(true);
    setTranslationResult("");

    try {
      const response = await fetch("/api/asean/translate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          text: unifiedInput,
          fromLanguage,
          toLanguage
        })
      });

      if (!response.ok) {
        throw new Error("Translation failed");
      }

      const data = await response.json();
      setTranslationResult(data.translation || "Translation not available");
      
      toast({
        title: "Translation Complete",
        description: "AI translation generated successfully"
      });
    } catch (error) {
      console.error("Translation error:", error);
      toast({
        title: "Translation Failed",
        description: "Unable to translate text. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsTranslating(false);
    }
  };

  // Show results when user has typed something - improved search logic
  const filteredResults = unifiedInput.trim().length > 0 
    ? searchResults.filter(entry => 
        entry.dictionaryType === "asean" && (
          // Search in English terms
          entry.english?.toLowerCase().includes(unifiedInput.toLowerCase()) ||
          // Search in Tetum translations
          entry.tetum?.toLowerCase().includes(unifiedInput.toLowerCase()) ||
          // Search in explanations and notes
          entry.explanation?.toLowerCase().includes(unifiedInput.toLowerCase()) ||
          entry.notes?.toLowerCase().includes(unifiedInput.toLowerCase()) ||
          // Search in sources for better context
          entry.source?.toLowerCase().includes(unifiedInput.toLowerCase())
        )
      ).sort((a, b) => {
        // Prioritize exact matches, then starts-with matches
        const aExact = a.english?.toLowerCase() === unifiedInput.toLowerCase() ||
                      a.tetum?.toLowerCase() === unifiedInput.toLowerCase();
        const bExact = b.english?.toLowerCase() === unifiedInput.toLowerCase() ||
                      b.tetum?.toLowerCase() === unifiedInput.toLowerCase();
        
        if (aExact && !bExact) return -1;
        if (!aExact && bExact) return 1;
        
        const aStartsWith = a.english?.toLowerCase().startsWith(unifiedInput.toLowerCase()) ||
                           a.tetum?.toLowerCase().startsWith(unifiedInput.toLowerCase());
        const bStartsWith = b.english?.toLowerCase().startsWith(unifiedInput.toLowerCase()) ||
                           b.tetum?.toLowerCase().startsWith(unifiedInput.toLowerCase());
        
        if (aStartsWith && !bStartsWith) return -1;
        if (!aStartsWith && bStartsWith) return 1;
        
        return 0;
      })
    : [];

  return (
    <div className="space-y-6">
      {/* Unified Search & Translation Interface */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Globe className="h-5 w-5 text-green-600" />
                <h2 className="text-lg font-semibold">ASEAN Terminology & AI Translation</h2>
              </div>
            </div>

            {/* Unified Search Bar with Translation Controls */}
            <div className="space-y-4">
              <div className="flex space-x-2">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    ref={inputRef}
                    type="text"
                    placeholder="Search ASEAN terms or enter text to translate..."
                    value={unifiedInput}
                    onChange={(e) => handleUnifiedInput(e.target.value)}
                    onFocus={() => {
                      if (unifiedInput.trim().length > 0 && dropdownSuggestions.length > 0) {
                        setShowDropdown(true);
                      }
                    }}
                    className="pl-10 w-full"
                  />
                  
                  {/* Dropdown Suggestions */}
                  {showDropdown && dropdownSuggestions.length > 0 && (
                    <div
                      ref={dropdownRef}
                      className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-60 overflow-y-auto mt-1"
                    >
                      {dropdownSuggestions.map((suggestion, index) => (
                        <div
                          key={suggestion + index}
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="px-3 py-2 hover:bg-green-50 cursor-pointer flex items-center space-x-2 border-b border-gray-100 last:border-b-0"
                        >
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline" className="text-xs bg-green-50 text-green-700">
                              {suggestion}
                            </Badge>
                            <span className="text-sm text-gray-600">
                              {(() => {
                                const entry = allAseanEntries.find(e => e.english?.startsWith(suggestion + ':'));
                                const explanation = entry?.explanation || 'ASEAN Terminology';
                                return explanation.length > 50 ? explanation.substring(0, 50) + '...' : explanation;
                              })()}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <Select value={fromLanguage} onValueChange={setFromLanguage}>
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">EN</SelectItem>
                    <SelectItem value="tet">TET</SelectItem>
                    <SelectItem value="pt">PT</SelectItem>
                  </SelectContent>
                </Select>
                <Languages className="h-4 w-4 text-gray-400 mt-3" />
                <Select value={toLanguage} onValueChange={setToLanguage}>
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">EN</SelectItem>
                    <SelectItem value="tet">TET</SelectItem>
                    <SelectItem value="pt">PT</SelectItem>
                  </SelectContent>
                </Select>
                <Button 
                  onClick={handleTranslate} 
                  disabled={isTranslating || !unifiedInput.trim()}
                  className="bg-blue-600 hover:bg-blue-700"
                  size="sm"
                >
                  {isTranslating ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Zap className="h-4 w-4" />
                  )}
                </Button>
              </div>

              {/* Translation Result */}
              {(translationResult || isTranslating) && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Zap className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-800">AI Translation Result</span>
                  </div>
                  {isTranslating ? (
                    <div className="flex items-center space-x-2 text-blue-600">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm">Translating...</span>
                    </div>
                  ) : (
                    <p className="text-blue-700 text-sm">{translationResult}</p>
                  )}
                </div>
              )}

              {/* Language Filter */}
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Filter results:</span>
                <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                  <SelectTrigger className="w-36">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Languages</SelectItem>
                    <SelectItem value="english">English</SelectItem>
                    <SelectItem value="tetum">Tetum</SelectItem>
                    <SelectItem value="portuguese">Portuguese</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search Results */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Search Results</h3>
            <Badge variant="outline">
              {filteredResults.length} terms found
            </Badge>
          </div>
          
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
              <span className="ml-2 text-gray-500">Searching...</span>
            </div>
          ) : unifiedInput && filteredResults.length > 0 ? (
            <div className="space-y-3">
              {filteredResults.map((entry, index) => (
                <div
                  key={`${entry.id}-${index}`}
                  onClick={() => onEntrySelect(entry)}
                  className="p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 cursor-pointer transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="space-y-2">
                        {/* English Term */}
                        <h4 className="font-medium text-gray-900">
                          {entry.english || entry.explanation || "Unknown Term"}
                        </h4>
                        
                        {/* Tetum Translation */}
                        {entry.tetum && (
                          <p className="text-sm text-green-700 font-medium">
                            <span className="text-xs text-gray-500 uppercase tracking-wide">Tetum:</span> {entry.tetum}
                          </p>
                        )}
                        
                        {/* Word Class / Notes */}
                        {entry.notes && (
                          <p className="text-xs text-blue-600">
                            {entry.notes}
                          </p>
                        )}
                        
                        {/* Source Link */}
                        {entry.source && entry.source.startsWith('http') && (
                          <a 
                            href={entry.source} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-xs text-blue-500 hover:text-blue-700 underline"
                            onClick={(e) => e.stopPropagation()}
                          >
                            View Source →
                          </a>
                        )}
                        
                        {/* Content Type and Source Distinction */}
                        <div className="flex items-center gap-2 mt-2">
                          {entry.source?.includes('ASEAN-Abbreviations-List.pdf') || entry.source?.includes('verified') ? (
                            <Badge variant="outline" className="bg-green-50 border-green-200 text-green-700 text-xs">
                              📄 Verified Content
                            </Badge>
                          ) : entry.source?.includes('Gemini') || entry.source?.includes('AI') || entry.source?.includes('Google API') ? (
                            <Badge variant="outline" className="bg-blue-50 border-blue-200 text-blue-700 text-xs">
                              🤖 AI-Enhanced
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-gray-50 border-gray-200 text-gray-700 text-xs">
                              📚 Reference
                            </Badge>
                          )}
                          
                          {/* Source info */}
                          {entry.source && !entry.source.startsWith('http') && (
                            <span className="text-xs text-gray-500">
                              {entry.source.includes('ASEAN-Abbreviations-List.pdf') ? 
                                'Official ASEAN Document' : 
                                entry.source.includes('Gemini') || entry.source.includes('AI') ? 
                                'AI-Generated Translation' : 
                                entry.source
                              }
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <Badge variant="secondary" className="ml-4 bg-green-100 text-green-700">
                      ASEAN
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : unifiedInput ? (
            <div className="text-center py-8">
              <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No ASEAN terms found for "{unifiedInput}"</p>
              <p className="text-sm text-gray-400 mt-2">
                Try searching for ASEAN abbreviations like "ASEAN", "AFTA", "AEC", etc.
              </p>
            </div>
          ) : (
            <div className="text-center py-8">
              <Globe className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Enter a search term to find ASEAN terminology</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
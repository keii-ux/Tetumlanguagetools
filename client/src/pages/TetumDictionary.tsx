import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Search, 
  ChevronDown,
  Home,
  Globe,
  BookOpen,
  Volume2,
  Filter
} from "lucide-react";
import { useLocation, Link } from "wouter";
import { useSearchEntries, useDictionaryStats } from "@/lib/search";
import { SearchQuery, DictionaryEntry } from "@shared/schema";
import { buildSearchQuery } from "@/lib/dictionaries";

const DEFAULT_USER_ID = "demo-user";

const LANGUAGE_OPTIONS = [
  { code: "en", label: "English", flag: "🇺🇸" },
  { code: "pt", label: "Português", flag: "🇵🇹" },
  { code: "tet", label: "Tetum", flag: "🇹🇱" },
];

const WORD_CLASS_COLORS: { [key: string]: string } = {
  "Substantivu": "bg-blue-100 text-blue-800",
  "Verbu": "bg-green-100 text-green-800",
  "Adjetivu": "bg-yellow-100 text-yellow-800",
  "Adverbu": "bg-purple-100 text-purple-800",
  "Pronome": "bg-red-100 text-red-800",
  "Prepozisaun": "bg-gray-100 text-gray-800",
  "Konjunsaun": "bg-indigo-100 text-indigo-800",
  "Intersaun": "bg-pink-100 text-pink-800",
};

export default function TetumDictionary() {
  const [selectedLanguage, setSelectedLanguage] = useState("tet");
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEntry, setSelectedEntry] = useState<DictionaryEntry | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [wordClassFilter, setWordClassFilter] = useState("all");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchPerformed, setSearchPerformed] = useState(false);
  
  const [query, setQuery] = useState<SearchQuery>(buildSearchQuery({
    query: "",
    dictionaryType: "general",
    language: "all",
  }));
  
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { data: stats } = useDictionaryStats();
  const { data: searchResults = [], isLoading } = useSearchEntries(query);

  const results = Array.isArray(searchResults) ? searchResults : [];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchInputRef.current && !searchInputRef.current.contains(event.target as Node)) {
        setShowLanguageDropdown(false);
        setShowSuggestions(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = () => {
    setQuery(prev => buildSearchQuery({
      ...prev,
      query: searchQuery,
    }));
    setSearchPerformed(true);
    setShowSuggestions(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setShowSuggestions(value.length > 0);
    setSearchPerformed(false);
    
    // Update query for predictive search
    if (value.length > 0) {
      setQuery(prev => buildSearchQuery({
        ...prev,
        query: value,
      }));
    }
  };

  const handleSuggestionSelect = (entry: DictionaryEntry) => {
    setSearchQuery(getDisplayTerm(entry));
    setSelectedEntry(entry);
    setShowSuggestions(false);
    setSearchPerformed(true);
  };

  const getDisplayTerm = (entry: DictionaryEntry) => {
    const term = entry.tetum || entry.portuguese || entry.english || "Unknown";
    // Remove trailing comma from INL dictionary terms
    return term.replace(/,$/, '');
  };

  const getDefinitionText = (entry: DictionaryEntry) => {
    return entry.explanation || entry.portuguese || entry.english || "No definition available";
  };

  const uniqueWordClasses = Array.from(new Set(results.map(entry => entry.wordClass).filter((wordClass): wordClass is string => Boolean(wordClass))));
  const filteredResults = wordClassFilter === "all" 
    ? results 
    : results.filter(entry => entry.wordClass === wordClassFilter);

  const getWordClassColor = (wordClass: string) => {
    return WORD_CLASS_COLORS[wordClass] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-orange-100">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <Link href="/">
                <div className="flex items-center space-x-2 cursor-pointer hover:opacity-80 transition-opacity">
                  <Home className="h-8 w-8 text-orange-600" />
                  <span className="text-xl font-bold text-gray-900">LianTek Pro Tools</span>
                </div>
              </Link>
            </div>

            <div className="relative">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
                className="flex items-center space-x-2 text-[#050505] hover:text-orange-700 border-orange-200 bg-orange-50"
              >
                <span>{LANGUAGE_OPTIONS.find(lang => lang.code === selectedLanguage)?.flag}</span>
                <span className="hidden sm:inline">{LANGUAGE_OPTIONS.find(lang => lang.code === selectedLanguage)?.label}</span>
                <ChevronDown className="w-4 h-4" />
              </Button>
              
              {showLanguageDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                  <div className="py-1">
                    {LANGUAGE_OPTIONS.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          setSelectedLanguage(lang.code);
                          setShowLanguageDropdown(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center space-x-3 ${
                          selectedLanguage === lang.code ? "bg-orange-50 text-orange-600" : "text-gray-700"
                        }`}
                      >
                        <span>{lang.flag}</span>
                        <span>{lang.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 py-8">
        {/* Title */}
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold mb-4 text-[#141414]">🌍 Tetum Dictionary (INL)</h1>
          <p className="max-w-3xl mx-auto font-normal text-base leading-relaxed px-4 text-[#000000]">
            General Tetum dictionary from Instituto Nacional de Linguística with comprehensive word definitions and classifications.
          </p>
          <div className="flex justify-center items-center space-x-4 mt-4 text-sm text-gray-600">
            <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full">
              {stats?.general || 0} Tetum Words
            </span>
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
              INL Standard
            </span>
            <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full">
              With Word Classes
            </span>
          </div>
        </div>

        {/* Search Section */}
        <div className="bg-white rounded-xl shadow-lg border border-orange-200 p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Buka liafuan Tetun nian..."
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="pl-10 h-12 text-lg border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                />
              </div>
              
              {/* Predictive Search Dropdown */}
              {showSuggestions && results.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {results.slice(0, 8).map((entry, index) => (
                    <div
                      key={entry.id}
                      onClick={() => handleSuggestionSelect(entry)}
                      className="px-4 py-3 hover:bg-orange-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="font-medium text-orange-900">
                            {getDisplayTerm(entry)}
                          </div>
                          {entry.wordClass && (
                            <div className="text-xs text-gray-500 mt-1">
                              {entry.wordClass}
                            </div>
                          )}
                        </div>
                        <div className="text-xs text-gray-400 ml-2">
                          INL
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={handleSearch}
                className="h-12 px-6 bg-orange-600 hover:bg-orange-700"
                disabled={isLoading}
              >
                <Search className="h-5 w-5 mr-2" />
                Buka
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="h-12 px-4 border-gray-300"
              >
                <Filter className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex flex-wrap gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Word Class / Klase Liafuan</label>
                  <select
                    value={wordClassFilter}
                    onChange={(e) => setWordClassFilter(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                  >
                    <option value="all">All Classes / Hotu-hotu</option>
                    {uniqueWordClasses.map(wordClass => (
                      <option key={wordClass} value={wordClass || ""}>{wordClass}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Selected Entry Detail */}
        {selectedEntry && (
          <Card className="mb-8 border-orange-200">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-2xl text-orange-900 mb-2">
                    {getDisplayTerm(selectedEntry)}
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    {selectedEntry.wordClass && (
                      <Badge className={`text-xs ${getWordClassColor(selectedEntry.wordClass)}`}>
                        {selectedEntry.wordClass}
                      </Badge>
                    )}
                    <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700 border-orange-200">
                      INL Dictionary
                    </Badge>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-orange-600 hover:bg-orange-50"
                  >
                    <Volume2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedEntry(null)}
                    className="text-gray-600 hover:bg-gray-50"
                  >
                    ✕
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <span className="font-medium text-gray-600">Definisaun / Definition:</span>
                  <p className="text-gray-700 leading-relaxed mt-2 text-lg">
                    {getDefinitionText(selectedEntry)}
                  </p>
                </div>

                {selectedEntry.notes && (
                  <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                    <span className="font-medium">Notes:</span>
                    <div className="mt-1">{selectedEntry.notes}</div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Search Results (only show when search performed and no selected entry) */}
        {searchPerformed && !selectedEntry && (
          filteredResults.length > 0 ? (
            <div className="grid gap-4">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Rezultadu buka ({filteredResults.length} {filteredResults.length === 1 ? 'liafuan' : 'liafuan sira'})
              </h2>
              {filteredResults.map((entry: DictionaryEntry) => (
                <Card key={entry.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelectedEntry(entry)}>
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-lg text-orange-900 mb-2">
                          {getDisplayTerm(entry)}
                        </CardTitle>
                        <div className="flex items-center space-x-2">
                          {entry.wordClass && (
                            <Badge className={`text-xs ${getWordClassColor(entry.wordClass)}`}>
                              {entry.wordClass}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 leading-relaxed text-sm line-clamp-2">
                      {getDefinitionText(entry)}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Globe className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">La hetan liafuan</h3>
              <p className="text-gray-500">Kuda buka liafuan seluk ka verifika soletrasaun.</p>
            </div>
          )
        )}

        {/* Welcome message when no search performed */}
        {!searchPerformed && !selectedEntry && (
          <div className="text-center py-12">
            <BookOpen className="h-16 w-16 text-orange-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">Hahu buka liafuan Tetun</h3>
            <p className="text-gray-500">Hakerek liafuan ida atu buka nia definisaun no signifikadu.</p>
          </div>
        )}

        {isLoading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
            <p className="text-gray-500 mt-4">Buka iha disionáriu Tetun...</p>
          </div>
        )}
      </div>
    </div>
  );
}
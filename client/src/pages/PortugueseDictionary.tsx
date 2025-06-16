import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Search, 
  ChevronDown,
  Home,
  BookOpen,
  ArrowRightLeft,
  Volume2
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

export default function PortugueseDictionary() {
  const [selectedLanguage, setSelectedLanguage] = useState("pt");
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEntry, setSelectedEntry] = useState<DictionaryEntry | null>(null);
  const [translationDirection, setTranslationDirection] = useState<"pt-en" | "en-pt">("pt-en");
  
  const [query, setQuery] = useState<SearchQuery>(buildSearchQuery({
    query: "",
    dictionaryType: "legal", // Portuguese dictionary is part of legal glossary
    language: "all",
  }));
  
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { data: stats } = useDictionaryStats();
  const { data: searchResults = [], isLoading } = useSearchEntries(query);

  const results = Array.isArray(searchResults) ? searchResults.filter(entry => entry.portuguese) : [];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchInputRef.current && !searchInputRef.current.contains(event.target as Node)) {
        setShowLanguageDropdown(false);
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
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const getDisplayTerm = (entry: DictionaryEntry) => {
    return entry.portuguese || entry.tetum || entry.english || "Unknown";
  };

  const getDefinitionText = (entry: DictionaryEntry) => {
    return entry.explanation || entry.english || "No definition available";
  };

  const toggleTranslationDirection = () => {
    setTranslationDirection(prev => prev === "pt-en" ? "en-pt" : "pt-en");
    setSearchQuery("");
  };

  const getPlaceholder = () => {
    return translationDirection === "pt-en" 
      ? "Digite um termo em Português..." 
      : "Enter an English term...";
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-green-100">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <Link href="/">
                <div className="flex items-center space-x-2 cursor-pointer hover:opacity-80 transition-opacity">
                  <Home className="h-8 w-8 text-green-600" />
                  <span className="text-xl font-bold text-gray-900">LianTek Pro Tools</span>
                </div>
              </Link>
            </div>

            <div className="relative">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
                className="flex items-center space-x-2 text-[#050505] hover:text-green-700 border-green-200 bg-green-50"
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
                          selectedLanguage === lang.code ? "bg-green-50 text-green-600" : "text-gray-700"
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
          <h1 className="text-3xl md:text-4xl font-bold mb-4 text-[#141414]">📚 Portuguese-English Dictionary</h1>
          <p className="max-w-3xl mx-auto font-normal text-base leading-relaxed px-4 text-[#000000]">
            Comprehensive Portuguese legal dictionary with detailed explanations and terminology.
          </p>
          <div className="flex justify-center items-center space-x-4 mt-4 text-sm text-gray-600">
            <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full">
              Portuguese Legal Terms
            </span>
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
              Professional Reference
            </span>
          </div>
        </div>

        {/* Translation Direction Selector */}
        <div className="flex justify-center mb-6">
          <div className="bg-white rounded-xl shadow-md border border-green-200 p-2 flex items-center">
            <Button
              variant={translationDirection === "pt-en" ? "default" : "ghost"}
              size="sm"
              onClick={() => setTranslationDirection("pt-en")}
              className={translationDirection === "pt-en" ? "bg-green-600 hover:bg-green-700" : "hover:bg-green-50"}
            >
              🇵🇹 Português → English
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTranslationDirection}
              className="mx-2 hover:bg-green-50"
            >
              <ArrowRightLeft className="h-4 w-4" />
            </Button>
            <Button
              variant={translationDirection === "en-pt" ? "default" : "ghost"}
              size="sm"
              onClick={() => setTranslationDirection("en-pt")}
              className={translationDirection === "en-pt" ? "bg-green-600 hover:bg-green-700" : "hover:bg-green-50"}
            >
              English → 🇵🇹 Português
            </Button>
          </div>
        </div>

        {/* Search Section */}
        <div className="bg-white rounded-xl shadow-lg border border-green-200 p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  ref={searchInputRef}
                  type="text"
                  placeholder={getPlaceholder()}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="pl-10 h-12 text-lg border-gray-300 focus:border-green-500 focus:ring-green-500"
                />
              </div>
            </div>
            <Button 
              onClick={handleSearch}
              className="h-12 px-6 bg-green-600 hover:bg-green-700"
              disabled={isLoading}
            >
              <Search className="h-5 w-5 mr-2" />
              Search
            </Button>
          </div>
        </div>

        {/* Results */}
        {results.length > 0 ? (
          <div className="grid gap-4">
            {results.map((entry: DictionaryEntry) => (
              <Card key={entry.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-lg text-green-900 mb-2">
                        {getDisplayTerm(entry)}
                      </CardTitle>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                          Portuguese
                        </Badge>
                        {entry.source && (
                          <Badge variant="secondary" className="text-xs">
                            {entry.source}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="ml-4 text-green-600 hover:bg-green-50"
                    >
                      <Volume2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <span className="font-medium text-gray-600">Definition:</span>
                      <p className="text-gray-700 leading-relaxed mt-1">
                        {getDefinitionText(entry)}
                      </p>
                    </div>
                    
                    {entry.portuguese && entry.tetum && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm bg-gray-50 p-3 rounded-lg">
                        <div>
                          <span className="font-medium text-gray-600">Português:</span>
                          <div className="text-gray-800 mt-1">{entry.portuguese}</div>
                        </div>
                        <div>
                          <span className="font-medium text-gray-600">Tetum:</span>
                          <div className="text-gray-800 mt-1">{entry.tetum}</div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : searchQuery && !isLoading ? (
          <div className="text-center py-12">
            <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No Portuguese terms found</h3>
            <p className="text-gray-500">Try different search terms or check your spelling.</p>
          </div>
        ) : !searchQuery ? (
          <div className="text-center py-12">
            <BookOpen className="h-16 w-16 text-green-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">Start exploring Portuguese dictionary</h3>
            <p className="text-gray-500">Enter a Portuguese term to find definitions and translations.</p>
          </div>
        ) : null}

        {isLoading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="text-gray-500 mt-4">Searching Portuguese dictionary...</p>
          </div>
        )}
      </div>
    </div>
  );
}
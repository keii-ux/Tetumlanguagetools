import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Search, 
  ChevronDown,
  Home,
  Scale,
  BookOpen,
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

export default function LegalGlossary() {
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEntry, setSelectedEntry] = useState<DictionaryEntry | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [sourceFilter, setSourceFilter] = useState("all");
  
  const [query, setQuery] = useState<SearchQuery>(buildSearchQuery({
    query: "",
    dictionaryType: "legal",
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
    return entry.tetum || entry.portuguese || entry.english || "Unknown";
  };

  const getDefinitionText = (entry: DictionaryEntry) => {
    return entry.explanation || entry.portuguese || entry.english || "No definition available";
  };

  const uniqueSources = Array.from(new Set(results.map(entry => entry.source).filter((source): source is string => Boolean(source))));
  const filteredResults = sourceFilter === "all" 
    ? results 
    : results.filter(entry => entry.source === sourceFilter);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-blue-100">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <Link href="/">
                <div className="flex items-center space-x-2 cursor-pointer hover:opacity-80 transition-opacity">
                  <Home className="h-8 w-8 text-blue-600" />
                  <span className="text-xl font-bold text-gray-900">LianTek Pro Tools</span>
                </div>
              </Link>
            </div>

            <div className="relative">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
                className="flex items-center space-x-2 text-[#050505] hover:text-blue-700 border-blue-200 bg-blue-50"
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
                          selectedLanguage === lang.code ? "bg-blue-50 text-blue-600" : "text-gray-700"
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
          <h1 className="text-3xl md:text-4xl font-bold mb-4 text-[#141414]">⚖️ Legal Glossary</h1>
          <p className="max-w-3xl mx-auto font-normal text-base leading-relaxed px-4 text-[#000000]">
            Comprehensive legal terminology in Tetum with Portuguese equivalents for professionals working in legal contexts.
          </p>
          <div className="flex justify-center items-center space-x-4 mt-4 text-sm text-gray-600">
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
              {stats?.legal || 0} Legal Terms
            </span>
            <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full">
              Tetum ↔ Portuguese
            </span>
          </div>
        </div>

        {/* Search Section */}
        <div className="bg-white rounded-xl shadow-lg border border-blue-200 p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search legal terms in Tetum or Portuguese..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="pl-10 h-12 text-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={handleSearch}
                className="h-12 px-6 bg-blue-600 hover:bg-blue-700"
                disabled={isLoading}
              >
                <Search className="h-5 w-5 mr-2" />
                Search
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Source</label>
                  <select
                    value={sourceFilter}
                    onChange={(e) => setSourceFilter(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                  >
                    <option value="all">All Sources</option>
                    {uniqueSources.map(source => (
                      <option key={source} value={source || ""}>{source}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Results */}
        {filteredResults.length > 0 ? (
          <div className="grid gap-4">
            {filteredResults.map((entry: DictionaryEntry) => (
              <Card key={entry.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg text-blue-900">
                        {getDisplayTerm(entry)}
                      </CardTitle>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {entry.source}
                        </Badge>
                        {entry.wordClass && (
                          <Badge variant="secondary" className="text-xs">
                            {entry.wordClass}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed">
                    {getDefinitionText(entry)}
                  </p>
                  {entry.tetum && entry.portuguese && (
                    <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="font-medium text-gray-600">Tetum:</span>
                        <span className="ml-2 text-gray-800">{entry.tetum}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Português:</span>
                        <span className="ml-2 text-gray-800">{entry.portuguese}</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : searchQuery && !isLoading ? (
          <div className="text-center py-12">
            <Scale className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No legal terms found</h3>
            <p className="text-gray-500">Try adjusting your search terms or filters.</p>
          </div>
        ) : !searchQuery ? (
          <div className="text-center py-12">
            <BookOpen className="h-16 w-16 text-blue-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">Start exploring legal terminology</h3>
            <p className="text-gray-500">Enter a search term to find legal definitions and translations.</p>
          </div>
        ) : null}

        {isLoading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-500 mt-4">Searching legal glossary...</p>
          </div>
        )}
      </div>
    </div>
  );
}
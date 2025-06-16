import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  ChevronDown,
  Volume2,
  Share2,
  Menu
} from "lucide-react";
import { useSearchEntries, useDictionaryStats } from "@/lib/search";
import { SearchQuery, DictionaryEntry } from "@shared/schema";
import { buildSearchQuery } from "@/lib/dictionaries";
import { SearchBar } from "@/components/SearchBar";
import { GeneralHealthVocabulary } from "@/components/GeneralHealthVocabulary";

const DEFAULT_USER_ID = "demo-user";

// Language options for website interface
const LANGUAGE_OPTIONS = [
  { code: "en", label: "English", flag: "🇺🇸" },
  { code: "pt", label: "Português", flag: "🇵🇹" },
  { code: "tet", label: "Tetum", flag: "🇹🇱" },
];

const TAB_OPTIONS = [
  { key: "definitions", label: "Definitions" },
  { key: "thesaurus", label: "Thesaurus" },
  { key: "examples", label: "Examples" },
  { key: "idioms", label: "Idioms" },
  { key: "grammar", label: "Grammar" },
  { key: "scientific", label: "Scientific" },
];

export default function Dictionary() {
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<DictionaryEntry | null>(null);
  const [activeTab, setActiveTab] = useState("definitions");
  const [currentDefinition, setCurrentDefinition] = useState(1);
  const [query, setQuery] = useState<SearchQuery>(buildSearchQuery({
    query: "",
    dictionaryType: "medical",
    language: "all",
  }));
  
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  const { data: stats } = useDictionaryStats();
  
  const { data: searchResults = [], isLoading } = useSearchEntries(query);
  
  // Get suggestions for predictive search
  const suggestions = searchResults.slice(0, 6);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchInputRef.current && !searchInputRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
      setShowLanguageDropdown(false);
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setShowSuggestions(value.length > 0);
    if (value.length === 0) {
      setSelectedEntry(null);
    }
  };

  const handleSearchQueryChange = (newQuery: SearchQuery) => {
    setQuery(newQuery);
    setSearchQuery(newQuery.query || "");
    if ((newQuery.query || "").length === 0) {
      setSelectedEntry(null);
    }
  };
  
  const handleSuggestionClick = (entry: DictionaryEntry) => {
    setSearchQuery(getDisplayTerm(entry));
    setSelectedEntry(entry);
    setShowSuggestions(false);
    setCurrentDefinition(1);
  };
  
  const getDisplayTerm = (entry: DictionaryEntry) => {
    return entry.tetum || entry.portuguese || entry.english || "Unknown";
  };
  
  const handleSearch = () => {
    if (searchResults.length > 0) {
      setSelectedEntry(searchResults[0]);
      setShowSuggestions(false);
      setCurrentDefinition(1);
    }
  };
  
  const getDefinitionText = (entry: DictionaryEntry) => {
    return entry.explanation || entry.portuguese || entry.english || "No definition available";
  };
  
  const getPhonetic = (entry: DictionaryEntry) => {
    // Generate a simple phonetic representation
    const term = getDisplayTerm(entry);
    return term.toLowerCase().replace(/[aeiou]/g, (match) => {
      const phoneticMap: { [key: string]: string } = {
        'a': 'ə',
        'e': 'ɛ',
        'i': 'ɪ',
        'o': 'ɔ',
        'u': 'ʊ'
      };
      return phoneticMap[match] || match;
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-blue-100">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <img 
                src="/liantek-logo.png" 
                alt="LianTek" 
                className="h-10 w-auto object-contain"
              />
            </div>

            {/* Language Selector */}
            <div className="relative">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
                className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 border-blue-200 bg-blue-50"
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
          <h1 className="text-3xl md:text-4xl font-bold mb-4 text-[#141414]">Medical Dictionary</h1>
          <p className="max-w-3xl mx-auto font-normal text-base leading-relaxed px-4 text-[#000000]">Comprehensive medical terminology in Tetum and English for professionals from academic checked literature, according to the INL standard.</p>
        </div>

        

        

        {/* Search Section */}
        <div className="rounded-xl shadow-lg p-6 bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 pl-[24px] pr-[24px] mt-[59px] mb-[59px] pt-[47px] pb-[47px]">
          <SearchBar onSearch={handleSearchQueryChange} initialQuery={query} />
        </div>

        {/* Results Section */}
        {selectedEntry && (
          <div className="bg-white rounded-xl shadow-lg p-6 border border-blue-100">
            {/* Word Header */}
            <div className="flex items-center space-x-4 mb-6">
              <h2 className="text-3xl font-bold text-gray-900">{getDisplayTerm(selectedEntry)}</h2>
              <Button variant="ghost" size="sm" className="text-blue-500 hover:text-blue-700 hover:bg-blue-50">
                <Volume2 className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="sm" className="text-blue-500 hover:text-blue-700 hover:bg-blue-50">
                <Share2 className="w-5 h-5" />
              </Button>
            </div>

            {/* Pronunciation */}
            <div className="flex items-center space-x-4 mb-6">
              <span className="text-gray-600">[ {getPhonetic(selectedEntry)} ]</span>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                <span className="text-sm text-gray-600">Phonetic (standard)</span>
                <div className="w-3 h-3 bg-gray-400 rounded-full ml-4"></div>
                <span className="text-sm text-gray-600">IPA</span>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex space-x-1 mb-6 border-b border-gray-200">
              {TAB_OPTIONS.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                    activeTab === tab.key
                      ? "bg-blue-50 text-blue-600 border-b-2 border-blue-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Definition Content */}
            {activeTab === "definitions" && (
              <div className="space-y-6">
                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-gray-600">
                      Definition for <strong>{getDisplayTerm(selectedEntry)}</strong> ({currentDefinition} of 2)
                    </span>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <span className="text-lg font-semibold text-gray-900">noun</span>
                      <div className="text-sm text-gray-600 mb-3">
                        Plural <em>{getDisplayTerm(selectedEntry)}s</em>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-start space-x-3">
                        <span className="text-blue-600 font-semibold mt-1">1</span>
                        <div>
                          <p className="text-gray-900">{getDefinitionText(selectedEntry)}</p>
                          {selectedEntry.portuguese && (
                            <p className="text-gray-600 italic mt-1">Portuguese: {selectedEntry.portuguese}</p>
                          )}
                          {selectedEntry.english && selectedEntry.english !== getDefinitionText(selectedEntry) && (
                            <p className="text-gray-600 italic mt-1">English: {selectedEntry.english}</p>
                          )}
                        </div>
                      </div>
                      
                      {selectedEntry.dictionaryType === "medical" && (
                        <div className="flex items-start space-x-3">
                          <span className="text-blue-600 font-semibold mt-1">2</span>
                          <div>
                            <p className="text-gray-900">Medical terminology context</p>
                            <p className="text-gray-600 italic mt-1">Used in healthcare and medical settings</p>
                          </div>
                        </div>
                      )}
                      
                      {selectedEntry.notes && (
                        <div className="flex items-start space-x-3">
                          <span className="text-blue-600 font-semibold mt-1">3</span>
                          <div>
                            <p className="text-gray-900">{selectedEntry.notes}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Additional Definition */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-gray-600">
                      Definition for <strong>{getDisplayTerm(selectedEntry)}</strong> (2 of 2)
                    </span>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">{getDisplayTerm(selectedEntry)}</h3>
                      <div className="flex items-center space-x-4 mb-4">
                        <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700">
                          <Volume2 className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700">
                          <Share2 className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="flex items-center space-x-4 mb-4">
                        <span className="text-gray-600">[ {getPhonetic(selectedEntry)} ]</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                          <span className="text-sm text-gray-600">Phonetic (standard)</span>
                          <div className="w-3 h-3 bg-gray-400 rounded-full ml-4"></div>
                          <span className="text-sm text-gray-600">IPA</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Other tab contents */}
            {activeTab !== "definitions" && (
              <div className="py-8 text-center text-gray-500">
                <p>Content for {TAB_OPTIONS.find(tab => tab.key === activeTab)?.label} tab</p>
                <p className="text-sm mt-2">This section would contain {activeTab} related to "{getDisplayTerm(selectedEntry)}"</p>
              </div>
            )}
          </div>
        )}
        
        {/* General Health Vocabulary Section */}
        {!selectedEntry && (
          <div className="mb-12">
            <GeneralHealthVocabulary />
          </div>
        )}

        
        
        {/* No Results */}
        {!selectedEntry && searchQuery.length > 0 && !isLoading && searchResults.length === 0 && (
          <div className="text-center py-12">
            <div className="bg-white rounded-2xl shadow-lg p-12">
              <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No results found</h3>
              <p className="text-gray-600">
                No matches found for "{searchQuery}". Try a different search term.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
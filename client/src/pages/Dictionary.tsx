import { useState } from "react";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { 
  Search, 
  Scale, 
  Stethoscope, 
  Book, 
  Globe, 
  BookOpen,
  Languages,
  FileText,
  Bookmark,
  History,
  Settings,
  ChevronRight,
  Menu,
  X,
  ChevronDown
} from "lucide-react";
import { useSearchEntries, useAddSearchHistory, useAllEntries, useDictionaryStats } from "@/lib/search";
import { SearchQuery, DictionaryEntry } from "@shared/schema";
import { buildSearchQuery } from "@/lib/dictionaries";
import { TermDetail } from "@/components/TermDetail";
import { BookmarkPanel } from "@/components/BookmarkPanel";

const DEFAULT_USER_ID = "demo-user";

// Language options for website interface
const LANGUAGE_OPTIONS = [
  { code: "en", label: "English", flag: "🇺🇸" },
  { code: "pt", label: "Português", flag: "🇵🇹" },
  { code: "tet", label: "Tetum", flag: "🇹🇱" },
];

const NAVIGATION_ITEMS = [
  {
    icon: Languages,
    label: "Multilingual Translator",
    active: false,
  },
  {
    icon: FileText,
    label: "Synonym Finder", 
    active: false,
  },
  {
    icon: BookOpen,
    label: "Etymology Dictionary",
    active: false,
  },
  {
    icon: Book,
    label: "Unified Grammar",
    active: false,
  },
  {
    icon: Globe,
    label: "Language Variants",
    active: false,
  },
  {
    icon: FileText,
    label: "Idioms & Proverbs",
    active: false,
  },
  {
    icon: Settings,
    label: "Pro Tools",
    active: true,
  },
];

const TOOL_CARDS = [
  {
    id: "medical",
    title: "Tetum Medical Dictionary",
    category: "Healthcare",
    description: "Tetum medical terminology with Portuguese and English translations. AI-powered for more content",
    icon: Stethoscope,
    color: "bg-red-500",
    bgColor: "bg-red-50",
    iconColor: "text-red-500",
  },
  {
    id: "legal", 
    title: "Tetum Legal Dictionary",
    category: "Legal",
    description: "Legal terminology in Tetum with Portuguese and English equivalents. AI-powered for extra information",
    icon: Scale,
    color: "bg-blue-500", 
    bgColor: "bg-blue-50",
    iconColor: "text-blue-500",
  },

  {
    id: "asean",
    title: "ASEAN-related Terminology", 
    category: "International",
    description: "ASEAN-related English abbreviations and terminology, translated into Tetum and Portuguese. AI-powered for more content",
    icon: Globe,
    color: "bg-green-500",
    bgColor: "bg-green-50", 
    iconColor: "text-green-500",
  },
  {
    id: "inl-tetum",
    title: "Tetum Monolingual Dictionary",
    category: "Reference", 
    description: "Dictionary of the Tetum Language (INL), accessible digitally, with almost 10,000 entries, as in the original, spellchecked according to the INL standards",
    icon: Languages,
    color: "bg-purple-500",
    bgColor: "bg-purple-50",
    iconColor: "text-purple-500",
  },
];

export default function Dictionary() {
  const [searchQuery, setSearchQuery] = useState<SearchQuery>(buildSearchQuery({}));
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [selectedEntry, setSelectedEntry] = useState<DictionaryEntry | null>(null);
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [globalSearch, setGlobalSearch] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [currentView, setCurrentView] = useState<'home' | 'medical' | 'legal' | 'asean' | 'inl-tetum'>('home');
  
  const { data: stats } = useDictionaryStats();
  const { data: searchResults = [], isLoading: searchLoading } = useSearchEntries(searchQuery);
  const { data: allEntries = [], isLoading: allLoading } = useAllEntries();
  const addSearchHistory = useAddSearchHistory();

  const handleToolSelect = (toolId: string) => {
    if (toolId === "legal") {
      setCurrentView('legal');
    } else if (toolId === "asean") {
      // Navigate to ASEAN terminology module
      window.location.href = "/asean-terminology";
      return;
    } else {
      setSelectedTool(toolId);
      const newQuery = buildSearchQuery({ 
        dictionaryType: toolId as any,
        query: globalSearch || ""
      });
      setSearchQuery(newQuery);
    }
  };

  const handleGlobalSearch = (query: string) => {
    setGlobalSearch(query);
    if (query.trim()) {
      const searchObj = buildSearchQuery({ 
        query: query,
        dictionaryType: selectedTool as any || "all"
      });
      setSearchQuery(searchObj);
      
      addSearchHistory.mutate({
        userId: DEFAULT_USER_ID,
        query: query,
      });
    }
  };

  const getToolStats = (toolId: string) => {
    if (!stats) return 0;
    return stats[toolId as keyof typeof stats] || 0;
  };

  const displayResults = searchQuery.query || selectedTool ? searchResults : allEntries;
  const isLoading = searchQuery.query || selectedTool ? searchLoading : allLoading;

  // Medical dictionary now uses separate routing
  // Users access it via the "Advanced Medical Dictionary" button

  if (selectedTool) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header for Results View */}
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  onClick={() => setSelectedTool(null)}
                  className="text-green-600 hover:text-green-700"
                >
                  ← Back to Tools
                </Button>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">
                    {TOOL_CARDS.find(t => t.id === selectedTool)?.title}
                  </h1>
                  <p className="text-sm text-gray-600">
                    {displayResults.length} entries {globalSearch && `for "${globalSearch}"`}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowBookmarks(true)}
                >
                  <Bookmark className="w-4 h-4 mr-2" />
                  Bookmarks
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowHistory(true)}
                >
                  <History className="w-4 h-4 mr-2" />
                  History
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Search Results Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex gap-8">
            <div className="flex-1">
              {/* Search Bar */}
              <div className="relative mb-8">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search in this dictionary..."
                  value={globalSearch}
                  onChange={(e) => handleGlobalSearch(e.target.value)}
                  className="pl-12 py-3 text-base border-gray-300 focus:border-green-500 focus:ring-green-500 rounded-lg"
                />
              </div>

              {/* Results List */}
              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <Card key={i} className="p-6">
                      <div className="animate-pulse">
                        <div className="h-5 bg-gray-200 rounded w-1/3 mb-3"></div>
                        <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : displayResults.length === 0 ? (
                <Card className="p-12 text-center">
                  <div className="text-gray-500">
                    <p className="text-lg font-medium mb-2">No results found</p>
                    <p className="text-sm">Try adjusting your search terms.</p>
                  </div>
                </Card>
              ) : (
                <div className="space-y-4">
                  {displayResults.map((entry) => (
                    <Card 
                      key={entry.id}
                      className="p-6 hover:shadow-lg transition-shadow cursor-pointer border hover:border-green-200"
                      onClick={() => setSelectedEntry(entry)}
                    >
                      <div>
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {entry.tetum || entry.portuguese || entry.english || "Unknown"}
                          </h3>
                          <Badge variant="secondary" className="text-xs">
                            {entry.category || entry.dictionaryType}
                          </Badge>
                        </div>
                        
                        <div className="space-y-2 mb-3">
                          {entry.portuguese && (
                            <div className="flex">
                              <span className="text-xs font-medium text-gray-500 w-12">PT:</span>
                              <span className="text-gray-700">{entry.portuguese}</span>
                            </div>
                          )}
                          {entry.english && (
                            <div className="flex">
                              <span className="text-xs font-medium text-gray-500 w-12">EN:</span>
                              <span className="text-gray-700">{entry.english}</span>
                            </div>
                          )}
                        </div>
                        
                        {entry.explanation && (
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {entry.explanation}
                          </p>
                        )}
                        
                        <div className="flex justify-between items-center mt-3 text-xs text-gray-500">
                          <span>Source: {entry.source}</span>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Term Detail Panel */}
            {selectedEntry && (
              <TermDetail
                entry={selectedEntry}
                onClose={() => setSelectedEntry(null)}
                userId={DEFAULT_USER_ID}
              />
            )}
          </div>
        </div>

        {/* Dialogs */}
        <Dialog open={showBookmarks} onOpenChange={setShowBookmarks}>
          <DialogContent className="p-0 max-w-md">
            <BookmarkPanel
              userId={DEFAULT_USER_ID}
              onClose={() => setShowBookmarks(false)}
              onEntrySelect={(entry) => {
                setSelectedEntry(entry);
                setShowBookmarks(false);
              }}
            />
          </DialogContent>
        </Dialog>

        <Dialog open={showHistory} onOpenChange={setShowHistory}>
          <DialogContent className="max-w-md">
            <div className="p-6">
              <h2 className="text-lg font-semibold mb-4">Search History</h2>
              <p className="text-sm text-gray-500">
                Your recent searches will appear here.
              </p>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <img 
                src="/liantek-logo.png" 
                alt="LianTek" 
                className="h-14 w-auto object-contain"
              />
            </div>

            {/* Language Selector */}
            <div className="relative">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
                className="flex items-center space-x-2 text-gray-600 hover:text-green-600 border-gray-300"
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
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div>
              <div className="inline-flex items-center px-4 py-2 rounded-full text-sm bg-blue-800/50 text-blue-100 mb-8">
                <Settings className="w-4 h-4 mr-2" />
                Professional Tools
              </div>
              
              <h1 className="text-4xl lg:text-6xl font-bold mb-6 leading-tight">
                Technical
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-400">
                  {" "}Tetum Glossaries{" "}
                </span>
                & Dictionaries
              </h1>
              
              <p className="text-xl text-blue-100 mb-10 leading-relaxed max-w-lg">Terminology glossaries, dictionaries and tools for language experts and professionals working with Tetum, Portuguese, and English in technical areas.</p>

              

              {/* Stats */}
              <div className="flex items-center space-x-8 text-blue-100">
                <div>
                  <div className="text-2xl font-bold text-white">{stats?.total || 0}</div>
                  <div className="text-sm">Total Terms</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">4</div>
                  <div className="text-sm">Dictionaries</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">3</div>
                  <div className="text-sm">Languages</div>
                </div>
              </div>
            </div>

            {/* Right Illustration/Card */}
            <div className="lg:flex justify-center">
              <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20 max-w-md">
                <div className="flex items-center space-x-3 mb-8">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-blue-500 rounded-xl flex items-center justify-center">
                    <Languages className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">All-in-one multilingual language tools</h3>
                    <p className="text-blue-100 text-sm">Professional Terminology</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                    <span className="text-sm font-medium">Tetum ↔ Portuguese ↔ English</span>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                    <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                    <span className="text-sm font-medium">Legal & Medical Terminology</span>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                    <div className="w-3 h-3 bg-purple-400 rounded-full"></div>
                    <span className="text-sm font-medium">Professional Reference Resources</span>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                    <div className="w-3 h-3 bg-orange-400 rounded-full"></div>
                    <span className="text-sm font-medium">ASEAN Professional Glossary</span>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                    <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                    <span className="text-sm font-medium">AI-Powered Language Resources</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Main Content Section */}
      <section className="py-20 bg-[#f5f6ff]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Professional Language Toolkit</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Access specialized dictionaries and glossaries designed for professional use across multiple languages and domains.
            </p>
          </div>

          {/* Tool Cards Grid */}
          <div className="grid md:grid-cols-2 xl:grid-cols-2 gap-8">
            {TOOL_CARDS.map((tool) => {
              const Icon = tool.icon;
              const termCount = getToolStats(tool.id);
              
              return (
                <div 
                  key={tool.id}
                  className={`group p-8 hover:shadow-2xl transition-all duration-300 cursor-pointer border-2 hover:border-green-200 ${tool.bgColor} rounded-lg text-[14px] font-normal pl-[30px] pr-[30px]`}
                  onClick={() => handleToolSelect(tool.id)}
                >
                  <div className="p-0">
                    <div className="flex items-start space-x-6">
                      <div className={`w-16 h-16 ${tool.bgColor} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                        <Icon className={`w-8 h-8 ${tool.iconColor}`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <h3 className="text-xl font-bold text-gray-900 group-hover:text-green-600 transition-colors">
                            {tool.title}
                          </h3>
                        </div>
                        <p className="text-gray-600 mb-6 text-[19px]">
                          {tool.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="text-2xl font-bold text-green-600">
                              {termCount.toLocaleString()}
                            </span>
                            <span className="text-gray-500">Verified Terms</span>
                          </div>
                          <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-green-500 group-hover:translate-x-1 transition-all" />
                        </div>
                        
                        {/* Special buttons for advanced modules */}
                        {tool.id === "medical" && (
                          <div className="mt-4 pt-4 border-t border-gray-100 flex justify-center">
                            <Link href="/medical-dictionary">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="text-xs bg-red-100 border-red-200 text-red-700 hover:bg-red-200"
                                onClick={(e) => {
                                  e.stopPropagation();
                                }}
                              >
                                <BookOpen className="w-3 h-3 mr-2" />
                                Advanced Search
                              </Button>
                            </Link>
                          </div>
                        )}
                        
                        {tool.id === "legal" && (
                          <div className="mt-4 pt-4 border-t border-gray-100 flex justify-center">
                            <Link href="/legal-dictionary">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="text-xs bg-blue-100 border-blue-200 text-blue-700 hover:bg-blue-200"
                                onClick={(e) => {
                                  e.stopPropagation();
                                }}
                              >
                                <BookOpen className="w-3 h-3 mr-2" />
                                Advanced Search
                              </Button>
                            </Link>
                          </div>
                        )}



                        {tool.id === "asean" && (
                          <div className="mt-4 pt-4 border-t border-gray-100 flex justify-center">
                            <Link href="/asean-terminology">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="text-xs bg-green-100 border-green-200 text-green-700 hover:bg-green-200"
                                onClick={(e) => {
                                  e.stopPropagation();
                                }}
                              >
                                <Globe className="w-3 h-3 mr-2" />
                                Advanced Search
                              </Button>
                            </Link>
                          </div>
                        )}

                        {tool.id === "inl-tetum" && (
                          <div className="mt-4 pt-4 border-t border-gray-100 flex justify-center">
                            <Link href="/inl-tetum-dictionary">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="text-xs bg-purple-100 border-purple-200 text-purple-700 hover:bg-purple-200"
                                onClick={(e) => {
                                  e.stopPropagation();
                                }}
                              >
                                <BookOpen className="w-3 h-3 mr-2" />
                                Advanced Search
                              </Button>
                            </Link>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
      {/* Dialogs */}
      <Dialog open={showBookmarks} onOpenChange={setShowBookmarks}>
        <DialogContent className="p-0 max-w-md">
          <BookmarkPanel
            userId={DEFAULT_USER_ID}
            onClose={() => setShowBookmarks(false)}
            onEntrySelect={(entry) => {
              setSelectedEntry(entry);
              setShowBookmarks(false);
            }}
          />
        </DialogContent>
      </Dialog>
      <Dialog open={showHistory} onOpenChange={setShowHistory}>
        <DialogContent className="max-w-md">
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-4">Search History</h2>
            <p className="text-sm text-gray-500">
              Your recent searches will appear here.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
import { useState } from "react";
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
  ChevronRight
} from "lucide-react";
import { useSearchEntries, useAddSearchHistory, useAllEntries, useDictionaryStats } from "@/lib/search";
import { SearchQuery, DictionaryEntry } from "@shared/schema";
import { buildSearchQuery } from "@/lib/dictionaries";
import { TermDetail } from "@/components/TermDetail";
import { BookmarkPanel } from "@/components/BookmarkPanel";
// Using placeholder since asset imports need proper configuration
const logoPath = "/logo.png";

const DEFAULT_USER_ID = "demo-user";

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
    label: "Idioms, Proverbs & Expressions",
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
    title: "Medical Glossary",
    category: "Healthcare",
    description: "Comprehensive Tetum medical terminology with Portuguese and English translations",
    icon: Stethoscope,
    color: "bg-red-500",
    bgColor: "bg-red-50",
    iconColor: "text-red-500",
  },
  {
    id: "legal", 
    title: "Legal Glossary",
    category: "Legal",
    description: "Legal terminology in Tetum with Portuguese and English equivalents",
    icon: Scale,
    color: "bg-blue-500", 
    bgColor: "bg-blue-50",
    iconColor: "text-blue-500",
  },
  {
    id: "general",
    title: "Portuguese-English Dictionary", 
    category: "Translation",
    description: "Comprehensive dictionary with translations between Portuguese and English",
    icon: Book,
    color: "bg-green-500",
    bgColor: "bg-green-50", 
    iconColor: "text-green-500",
  },
  {
    id: "asean",
    title: "Tetum Dictionary (INL)",
    category: "Reference", 
    description: "Instituto Nacional de Linguística Tetum dictionary with comprehensive entries",
    icon: Globe,
    color: "bg-orange-500",
    bgColor: "bg-orange-50",
    iconColor: "text-orange-500",
  },
];

export default function Dictionary() {
  const [searchQuery, setSearchQuery] = useState<SearchQuery>(buildSearchQuery({}));
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [selectedEntry, setSelectedEntry] = useState<DictionaryEntry | null>(null);
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [globalSearch, setGlobalSearch] = useState("");
  
  const { data: stats } = useDictionaryStats();
  const { data: searchResults = [], isLoading: searchLoading } = useSearchEntries(searchQuery);
  const { data: allEntries = [], isLoading: allLoading } = useAllEntries();
  const addSearchHistory = useAddSearchHistory();

  const handleToolSelect = (toolId: string) => {
    setSelectedTool(toolId);
    const newQuery = { ...searchQuery, dictionaryType: toolId as any };
    setSearchQuery(newQuery);
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

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Left Sidebar */}
      <div className="w-64 bg-white border-r border-slate-200 flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center space-x-3">
            <img src={logoPath} alt="LianTek" className="w-8 h-8" />
            <span className="text-lg font-semibold text-slate-900">LianTek</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <div className="space-y-2">
            {NAVIGATION_ITEMS.map((item, index) => {
              const Icon = item.icon;
              return (
                <button
                  key={index}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                    item.active 
                      ? "bg-blue-600 text-white" 
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{item.label}</span>
                </button>
              );
            })}
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 px-8 py-6">
          <div className="max-w-6xl mx-auto">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-slate-900 mb-2">Pro Tools</h1>
              <p className="text-lg text-slate-600">Professional Technical Glossaries & Language Resources</p>
              <p className="text-sm text-slate-500 mt-2">
                Specialized terminology and tools for healthcare, legal, educational, and linguistic professionals working with Tetum, Portuguese, and English.
              </p>
            </div>

            {/* Global Search */}
            <div className="relative max-w-2xl">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
              <Input
                type="text"
                placeholder="Search across all dictionaries..."
                value={globalSearch}
                onChange={(e) => handleGlobalSearch(e.target.value)}
                className="pl-10 py-3 text-base border-slate-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 px-8 py-6">
          <div className="max-w-6xl mx-auto">
            {!selectedTool ? (
              /* Tool Cards Grid */
              <div className="grid md:grid-cols-2 gap-6">
                {TOOL_CARDS.map((tool) => {
                  const Icon = tool.icon;
                  const termCount = getToolStats(tool.id);
                  
                  return (
                    <Card 
                      key={tool.id}
                      className="p-6 hover:shadow-lg transition-all cursor-pointer border-2 hover:border-blue-200"
                      onClick={() => handleToolSelect(tool.id)}
                    >
                      <CardContent className="p-0">
                        <div className="flex items-start space-x-4">
                          <div className={`w-12 h-12 ${tool.bgColor} rounded-lg flex items-center justify-center`}>
                            <Icon className={`w-6 h-6 ${tool.iconColor}`} />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="text-lg font-semibold text-slate-900">{tool.title}</h3>
                              <Badge variant="secondary" className="text-xs">
                                {tool.category}
                              </Badge>
                            </div>
                            <p className="text-sm text-slate-600 mb-3">
                              {tool.description}
                            </p>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-slate-500">
                                {termCount.toLocaleString()} terms
                              </span>
                              <ChevronRight className="w-4 h-4 text-slate-400" />
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              /* Search Results */
              <div className="flex gap-6">
                <div className="flex-1">
                  {/* Results Header */}
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <Button
                        variant="ghost"
                        onClick={() => setSelectedTool(null)}
                        className="mb-2 text-blue-600 hover:text-blue-700"
                      >
                        ← Back to Tools
                      </Button>
                      <h2 className="text-2xl font-bold text-slate-900">
                        {TOOL_CARDS.find(t => t.id === selectedTool)?.title}
                      </h2>
                      <p className="text-slate-600">
                        {displayResults.length} entries {globalSearch && `for "${globalSearch}"`}
                      </p>
                    </div>
                    <div className="flex space-x-2">
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

                  {/* Results List */}
                  {isLoading ? (
                    <div className="space-y-4">
                      {[...Array(5)].map((_, i) => (
                        <Card key={i} className="p-6">
                          <div className="animate-pulse">
                            <div className="h-5 bg-slate-200 rounded w-1/3 mb-3"></div>
                            <div className="h-4 bg-slate-200 rounded w-2/3 mb-2"></div>
                            <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  ) : displayResults.length === 0 ? (
                    <Card className="p-12 text-center">
                      <div className="text-slate-500">
                        <p className="text-lg font-medium mb-2">No results found</p>
                        <p className="text-sm">Try adjusting your search terms.</p>
                      </div>
                    </Card>
                  ) : (
                    <div className="space-y-4">
                      {displayResults.map((entry) => (
                        <Card 
                          key={entry.id}
                          className="p-6 hover:shadow-md transition-shadow cursor-pointer"
                          onClick={() => setSelectedEntry(entry)}
                        >
                          <div>
                            <div className="flex items-start justify-between mb-3">
                              <h3 className="text-lg font-semibold text-slate-900">
                                {entry.tetum || entry.portuguese || entry.english || "Unknown"}
                              </h3>
                              <Badge variant="secondary" className="text-xs">
                                {entry.category || entry.dictionaryType}
                              </Badge>
                            </div>
                            
                            <div className="space-y-2 mb-3">
                              {entry.portuguese && (
                                <div className="flex">
                                  <span className="text-xs font-medium text-slate-500 w-12">PT:</span>
                                  <span className="text-slate-700">{entry.portuguese}</span>
                                </div>
                              )}
                              {entry.english && (
                                <div className="flex">
                                  <span className="text-xs font-medium text-slate-500 w-12">EN:</span>
                                  <span className="text-slate-700">{entry.english}</span>
                                </div>
                              )}
                            </div>
                            
                            {entry.explanation && (
                              <p className="text-sm text-slate-600 line-clamp-2">
                                {entry.explanation}
                              </p>
                            )}
                            
                            <div className="flex justify-between items-center mt-3 text-xs text-slate-500">
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
            )}
          </div>
        </div>
      </div>

      {/* Bookmarks Dialog */}
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

      {/* Search History Dialog */}
      <Dialog open={showHistory} onOpenChange={setShowHistory}>
        <DialogContent className="max-w-md">
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-4">Search History</h2>
            <p className="text-sm text-slate-500">
              Your recent searches will appear here.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

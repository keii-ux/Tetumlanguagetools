import { useState, useEffect } from "react";
import { SearchBar } from "@/components/SearchBar";
import { DictionarySelector } from "@/components/DictionarySelector";
import { SearchResults } from "@/components/SearchResults";
import { TermDetail } from "@/components/TermDetail";
import { BookmarkPanel } from "@/components/BookmarkPanel";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Bookmark, History, Settings } from "lucide-react";
import { useSearchEntries, useAddSearchHistory, useAllEntries } from "@/lib/search";
import { SearchQuery, DictionaryEntry } from "@shared/schema";
import { buildSearchQuery } from "@/lib/dictionaries";

const DEFAULT_USER_ID = "demo-user"; // In a real app, this would come from authentication

export default function Dictionary() {
  const [searchQuery, setSearchQuery] = useState<SearchQuery>(buildSearchQuery({}));
  const [selectedEntry, setSelectedEntry] = useState<DictionaryEntry | null>(null);
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [languageFilter, setLanguageFilter] = useState(["tetum", "portuguese", "english"]);

  // Search entries based on current query
  const { data: searchResults = [], isLoading: searchLoading } = useSearchEntries(searchQuery);
  
  // Get all entries when no search query
  const { data: allEntries = [], isLoading: allLoading } = useAllEntries();
  
  const addSearchHistory = useAddSearchHistory();

  // Determine which results to show
  const displayResults = searchQuery.query || searchQuery.dictionaryType !== "all" 
    ? searchResults 
    : allEntries;
  
  const isLoading = searchQuery.query || searchQuery.dictionaryType !== "all" 
    ? searchLoading 
    : allLoading;

  // Handle search
  const handleSearch = (query: SearchQuery) => {
    setSearchQuery(query);
    
    // Add to search history if there's a query
    if (query.query && query.query.trim()) {
      addSearchHistory.mutate({
        userId: DEFAULT_USER_ID,
        query: query.query,
      });
    }
  };

  // Handle dictionary type selection
  const handleDictionarySelect = (type: string) => {
    const newQuery = { ...searchQuery, dictionaryType: type as any };
    setSearchQuery(newQuery);
  };

  // Handle language filter toggle
  const handleLanguageToggle = (language: string) => {
    const newFilter = languageFilter.includes(language)
      ? languageFilter.filter(l => l !== language)
      : [...languageFilter, language];
    setLanguageFilter(newFilter);
    
    // Update search query language filter
    const languageQuery = newFilter.length === 3 ? "all" : newFilter[0] || "all";
    setSearchQuery({ ...searchQuery, language: languageQuery as any });
  };

  // Handle filter removal
  const handleRemoveFilter = (filterKey: string) => {
    switch (filterKey) {
      case "dictionaryType":
        setSearchQuery({ ...searchQuery, dictionaryType: "all" });
        break;
      case "language":
        setSearchQuery({ ...searchQuery, language: "all" });
        setLanguageFilter(["tetum", "portuguese", "english"]);
        break;
      case "exactMatch":
        setSearchQuery({ ...searchQuery, exactMatch: false });
        break;
      case "caseSensitive":
        setSearchQuery({ ...searchQuery, caseSensitive: false });
        break;
    }
  };

  // Handle entry selection
  const handleEntrySelect = (entry: DictionaryEntry) => {
    setSelectedEntry(entry);
  };

  // Handle export
  const handleExportTerms = () => {
    const data = displayResults.map(entry => ({
      tetum: entry.tetum,
      portuguese: entry.portuguese,
      english: entry.english,
      explanation: entry.explanation,
      source: entry.source,
      category: entry.category,
    }));
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `liantek-dictionary-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Brand */}
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <i className="fas fa-language text-white text-sm"></i>
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">LianTek Pro</h1>
                <p className="text-xs text-slate-500">Professional Tools</p>
              </div>
            </div>

            {/* Search Bar */}
            <SearchBar onSearch={handleSearch} initialQuery={searchQuery} />

            {/* Header Actions */}
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowBookmarks(true)}
                className="text-slate-600 hover:text-primary"
              >
                <Bookmark className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowHistory(true)}
                className="text-slate-600 hover:text-primary"
              >
                <History className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-slate-600 hover:text-primary"
              >
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6">
          {/* Sidebar */}
          <DictionarySelector
            selectedType={searchQuery.dictionaryType}
            onTypeSelect={handleDictionarySelect}
            languageFilter={languageFilter}
            onLanguageToggle={handleLanguageToggle}
            onShowBookmarks={() => setShowBookmarks(true)}
            onShowHistory={() => setShowHistory(true)}
            onExportTerms={handleExportTerms}
          />

          {/* Search Results */}
          <SearchResults
            results={displayResults}
            searchQuery={searchQuery}
            isLoading={isLoading}
            onEntrySelect={handleEntrySelect}
            onRemoveFilter={handleRemoveFilter}
            userId={DEFAULT_USER_ID}
          />

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

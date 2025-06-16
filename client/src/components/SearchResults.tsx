import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bookmark, BookmarkCheck, ChevronDown, ChevronUp, List, Grid, X } from "lucide-react";
import { DictionaryEntry, SearchQuery } from "@shared/schema";
import { getDictionaryColor, highlightSearchTerm, DICTIONARY_TYPES } from "@/lib/dictionaries";
import { useCreateBookmark, useDeleteBookmark, useBookmarks } from "@/lib/search";

interface SearchResultsProps {
  results: DictionaryEntry[];
  searchQuery: SearchQuery;
  isLoading: boolean;
  onEntrySelect: (entry: DictionaryEntry) => void;
  onRemoveFilter: (filter: string) => void;
  userId: string;
}

type SortOption = "relevance" | "alphabetical" | "source";
type ViewMode = "list" | "grid";

export function SearchResults({
  results,
  searchQuery,
  isLoading,
  onEntrySelect,
  onRemoveFilter,
  userId,
}: SearchResultsProps) {
  const [sortBy, setSortBy] = useState<SortOption>("relevance");
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [expandedEntries, setExpandedEntries] = useState<Set<number>>(new Set());

  const { data: bookmarks = [] } = useBookmarks(userId);
  const createBookmark = useCreateBookmark();
  const deleteBookmark = useDeleteBookmark();

  const bookmarkedIds = new Set(bookmarks.map(b => b.entryId));

  // Sort results
  const sortedResults = [...results].sort((a, b) => {
    switch (sortBy) {
      case "alphabetical":
        return (a.tetum || a.portuguese || a.english || "").localeCompare(
          b.tetum || b.portuguese || b.english || ""
        );
      case "source":
        return (a.source || "").localeCompare(b.source || "");
      default:
        return 0; // Keep original order for relevance
    }
  });

  const handleBookmarkToggle = async (entryId: number) => {
    if (bookmarkedIds.has(entryId)) {
      await deleteBookmark.mutateAsync({ userId, entryId });
    } else {
      await createBookmark.mutateAsync({ userId, entryId });
    }
  };

  const toggleExpanded = (entryId: number) => {
    const newExpanded = new Set(expandedEntries);
    if (newExpanded.has(entryId)) {
      newExpanded.delete(entryId);
    } else {
      newExpanded.add(entryId);
    }
    setExpandedEntries(newExpanded);
  };

  const getDisplayTerm = (entry: DictionaryEntry) => {
    return entry.tetum || entry.portuguese || entry.english || "Unknown";
  };

  const getActiveFilters = () => {
    const filters = [];
    if (searchQuery.dictionaryType !== "all") {
      filters.push({
        label: DICTIONARY_TYPES[searchQuery.dictionaryType as keyof typeof DICTIONARY_TYPES],
        key: "dictionaryType",
      });
    }
    if (searchQuery.language !== "all") {
      filters.push({
        label: `${searchQuery.language} Language`,
        key: "language",
      });
    }
    if (searchQuery.exactMatch) {
      filters.push({ label: "Exact Match", key: "exactMatch" });
    }
    if (searchQuery.caseSensitive) {
      filters.push({ label: "Case Sensitive", key: "caseSensitive" });
    }
    return filters;
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="p-6">
            <div className="animate-pulse">
              <div className="h-6 bg-slate-200 rounded w-1/3 mb-3"></div>
              <div className="h-4 bg-slate-200 rounded w-2/3 mb-2"></div>
              <div className="h-4 bg-slate-200 rounded w-1/2"></div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <main className="flex-1">
      {/* Search Results Header */}
      <Card className="p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">
              {searchQuery.dictionaryType === "all"
                ? "All Dictionaries"
                : DICTIONARY_TYPES[searchQuery.dictionaryType as keyof typeof DICTIONARY_TYPES]}
            </h2>
            <p className="text-sm text-slate-500">
              {searchQuery.query
                ? `Showing ${results.length} results for "${searchQuery.query}"`
                : `Showing ${results.length} entries`}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="relevance">Sort by Relevance</SelectItem>
                <SelectItem value="alphabetical">Sort Alphabetically</SelectItem>
                <SelectItem value="source">Sort by Source</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-center space-x-1">
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
              >
                <Grid className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Active Filters */}
        <div className="flex flex-wrap gap-2">
          {getActiveFilters().map((filter) => (
            <Badge key={filter.key} variant="secondary" className="flex items-center gap-1">
              {filter.label}
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 hover:bg-transparent"
                onClick={() => onRemoveFilter(filter.key)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
      </Card>

      {/* Dictionary Entries */}
      {results.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="text-slate-500">
            <p className="text-lg font-medium mb-2">No results found</p>
            <p className="text-sm">
              Try adjusting your search terms or removing some filters.
            </p>
          </div>
        </Card>
      ) : (
        <div className={viewMode === "grid" ? "grid grid-cols-2 gap-4" : "space-y-4"}>
          {sortedResults.map((entry) => {
            const isExpanded = expandedEntries.has(entry.id);
            const isBookmarked = bookmarkedIds.has(entry.id);
            const displayTerm = getDisplayTerm(entry);

            return (
              <Card
                key={entry.id}
                className="p-6 hover:border-slate-300 transition-colors cursor-pointer"
                onClick={() => onEntrySelect(entry)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3
                        className="text-lg font-semibold text-slate-900"
                        dangerouslySetInnerHTML={{
                          __html: highlightSearchTerm(displayTerm, searchQuery.query || ""),
                        }}
                      />
                      <Badge variant="secondary" className="text-xs">
                        {entry.category || entry.dictionaryType}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="p-1 h-auto"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleBookmarkToggle(entry.id);
                        }}
                      >
                        {isBookmarked ? (
                          <BookmarkCheck className="h-4 w-4 text-yellow-500" />
                        ) : (
                          <Bookmark className="h-4 w-4 text-slate-400 hover:text-yellow-500" />
                        )}
                      </Button>
                    </div>

                    <div className="space-y-2">
                      {entry.portuguese && (
                        <div className="flex items-start space-x-3">
                          <span className="inline-block w-12 text-xs font-medium text-slate-500 uppercase">
                            PT:
                          </span>
                          <span
                            className="text-slate-900"
                            dangerouslySetInnerHTML={{
                              __html: highlightSearchTerm(entry.portuguese, searchQuery.query || ""),
                            }}
                          />
                        </div>
                      )}
                      {entry.english && (
                        <div className="flex items-start space-x-3">
                          <span className="inline-block w-12 text-xs font-medium text-slate-500 uppercase">
                            EN:
                          </span>
                          <span
                            className="text-slate-900"
                            dangerouslySetInnerHTML={{
                              __html: highlightSearchTerm(entry.english, searchQuery.query || ""),
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-4"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleExpanded(entry.id);
                    }}
                  >
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                </div>

                {/* Explanation */}
                {entry.explanation && (
                  <div className="text-sm text-slate-600 mb-3">
                    <p
                      dangerouslySetInnerHTML={{
                        __html: highlightSearchTerm(entry.explanation, searchQuery.query || ""),
                      }}
                    />
                  </div>
                )}

                {/* Expanded content */}
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-slate-200 space-y-3">
                    {entry.pronunciation && (
                      <div>
                        <span className="text-xs font-medium text-slate-700">Pronunciation: </span>
                        <span className="text-sm text-slate-900">{entry.pronunciation}</span>
                      </div>
                    )}
                    {entry.wordClass && (
                      <div>
                        <span className="text-xs font-medium text-slate-700">Word Class: </span>
                        <span className="text-sm text-slate-900">{entry.wordClass}</span>
                      </div>
                    )}
                    {entry.etymology && (
                      <div>
                        <span className="text-xs font-medium text-slate-700">Etymology: </span>
                        <span className="text-sm text-slate-900">{entry.etymology}</span>
                      </div>
                    )}
                    {entry.usageExamples && entry.usageExamples.length > 0 && (
                      <div>
                        <span className="text-xs font-medium text-slate-700">Examples: </span>
                        <ul className="list-disc list-inside text-sm text-slate-600 ml-4">
                          {entry.usageExamples.map((example, idx) => (
                            <li key={idx}>{example}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between text-xs text-slate-500 mt-3">
                  <span>Source: {entry.source}</span>
                  <span>Category: {entry.category || entry.dictionaryType}</span>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </main>
  );
}

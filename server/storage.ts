import { 
  dictionaryEntries, 
  bookmarks, 
  searchHistory,
  type DictionaryEntry, 
  type InsertDictionaryEntry,
  type Bookmark,
  type InsertBookmark,
  type SearchHistory,
  type InsertSearchHistory,
  type SearchQuery
} from "@shared/schema";

export interface IStorage {
  // Dictionary entries
  getAllEntries(): Promise<DictionaryEntry[]>;
  getEntryById(id: number): Promise<DictionaryEntry | undefined>;
  searchEntries(query: SearchQuery): Promise<DictionaryEntry[]>;
  createEntry(entry: InsertDictionaryEntry): Promise<DictionaryEntry>;
  bulkCreateEntries(entries: InsertDictionaryEntry[]): Promise<DictionaryEntry[]>;
  
  // Bookmarks
  getUserBookmarks(userId: string): Promise<Bookmark[]>;
  createBookmark(bookmark: InsertBookmark): Promise<Bookmark>;
  deleteBookmark(userId: string, entryId: number): Promise<void>;
  
  // Search history
  getUserSearchHistory(userId: string): Promise<SearchHistory[]>;
  addSearchHistory(history: InsertSearchHistory): Promise<SearchHistory>;
  clearSearchHistory(userId: string): Promise<void>;
}

export class MemStorage implements IStorage {
  private entries: Map<number, DictionaryEntry>;
  private bookmarksMap: Map<string, Bookmark>;
  private searchHistoryMap: Map<string, SearchHistory>;
  private currentEntryId: number;
  private currentBookmarkId: number;
  private currentHistoryId: number;

  constructor() {
    this.entries = new Map();
    this.bookmarksMap = new Map();
    this.searchHistoryMap = new Map();
    this.currentEntryId = 1;
    this.currentBookmarkId = 1;
    this.currentHistoryId = 1;
  }

  async getAllEntries(): Promise<DictionaryEntry[]> {
    return Array.from(this.entries.values());
  }

  async getEntryById(id: number): Promise<DictionaryEntry | undefined> {
    return this.entries.get(id);
  }

  async searchEntries(query: SearchQuery): Promise<DictionaryEntry[]> {
    const searchTerm = query.caseSensitive ? (query.query || "") : (query.query || "").toLowerCase();
    
    // Get all entries or filter by dictionary type
    let filteredEntries = Array.from(this.entries.values());
    
    // Filter by dictionary type first
    if (query.dictionaryType !== "all") {
      filteredEntries = filteredEntries.filter(entry => entry.dictionaryType === query.dictionaryType);
    }

    // If no search term, return first 100 entries matching the dictionary type filter
    if (!searchTerm.trim()) {
      return filteredEntries.slice(0, 100);
    }

    // Enhanced search with better matching for monolingual dictionaries
    const results = filteredEntries.filter(entry => {
      // Search in relevant fields based on language preference
      const fields = [];
      if (query.language === "all" || query.language === "tetum") {
        if (entry.tetum) fields.push(entry.tetum);
      }
      if (query.language === "all" || query.language === "portuguese") {
        if (entry.portuguese) fields.push(entry.portuguese);
      }
      if (query.language === "all" || query.language === "english") {
        if (entry.english) fields.push(entry.english);
      }

      // For INL Tetum dictionary, always search in word class and explanation
      if (entry.dictionaryType === "inl-tetum") {
        if (entry.wordClass) fields.push(entry.wordClass);
        // Always include definitions for monolingual dictionaries
        if (entry.explanation) fields.push(entry.explanation);
        if (entry.notes) fields.push(entry.notes);
      } else {
        // Include definitions if requested for other dictionaries
        if (query.includeDefinitions) {
          if (entry.explanation) fields.push(entry.explanation);
          if (entry.notes) fields.push(entry.notes);
          if (entry.category) fields.push(entry.category);
        }
      }

      // Search in relevant fields with improved partial matching
      return fields.some(field => {
        if (!field) return false;
        const fieldValue = query.caseSensitive ? field : field.toLowerCase();
        
        if (query.exactMatch) {
          return fieldValue === searchTerm;
        } else {
          // Better partial matching: word boundaries, starts with, contains
          const normalizedField = fieldValue.trim();
          const normalizedSearch = searchTerm.trim();
          
          // Check for exact word match
          const wordMatch = new RegExp(`\\b${normalizedSearch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
          if (wordMatch.test(normalizedField)) return true;
          
          // Check if field starts with search term
          if (normalizedField.startsWith(normalizedSearch)) return true;
          
          // Check if any word in the field starts with search term
          const words = normalizedField.split(/\s+/);
          if (words.some(word => word.startsWith(normalizedSearch))) return true;
          
          // Finally check for contains
          return normalizedField.includes(normalizedSearch);
        }
      });
    });

    // Enhanced sorting for better search results
    return results.sort((a, b) => {
      const aFields = [(a.tetum || "").trim(), (a.english || "").trim(), (a.portuguese || "").trim()];
      const bFields = [(b.tetum || "").trim(), (b.english || "").trim(), (b.portuguese || "").trim()];
      const searchTermLower = searchTerm.toLowerCase();
      
      // Priority 1: Exact word match
      const aExactWord = aFields.some(field => {
        const fieldLower = field.toLowerCase();
        const wordMatch = new RegExp(`\\b${searchTermLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`);
        return wordMatch.test(fieldLower);
      });
      const bExactWord = bFields.some(field => {
        const fieldLower = field.toLowerCase();
        const wordMatch = new RegExp(`\\b${searchTermLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`);
        return wordMatch.test(fieldLower);
      });
      
      if (aExactWord && !bExactWord) return -1;
      if (!aExactWord && bExactWord) return 1;
      
      // Priority 2: Exact string match
      const aExact = aFields.some(field => 
        query.caseSensitive ? field === (query.query || "") : field.toLowerCase() === searchTerm
      );
      const bExact = bFields.some(field => 
        query.caseSensitive ? field === (query.query || "") : field.toLowerCase() === searchTerm
      );
      
      if (aExact && !bExact) return -1;
      if (!aExact && bExact) return 1;
      
      // Priority 3: Starts with search term
      const aStartsWith = aFields.some(field => 
        query.caseSensitive ? field.startsWith(query.query || "") : field.toLowerCase().startsWith(searchTerm)
      );
      const bStartsWith = bFields.some(field => 
        query.caseSensitive ? field.startsWith(query.query || "") : field.toLowerCase().startsWith(searchTerm)
      );
      
      if (aStartsWith && !bStartsWith) return -1;
      if (!aStartsWith && bStartsWith) return 1;
      
      // Priority 4: Any word starts with search term
      const aWordStarts = aFields.some(field => {
        const words = field.toLowerCase().split(/\s+/);
        return words.some(word => word.startsWith(searchTermLower));
      });
      const bWordStarts = bFields.some(field => {
        const words = field.toLowerCase().split(/\s+/);
        return words.some(word => word.startsWith(searchTermLower));
      });
      
      if (aWordStarts && !bWordStarts) return -1;
      if (!aWordStarts && bWordStarts) return 1;
      
      // Alphabetical sort as fallback
      const aSort = a.tetum || a.english || a.portuguese || "";
      const bSort = b.tetum || b.english || b.portuguese || "";
      return aSort.localeCompare(bSort);
    }).slice(0, 50); // Limit results for performance
  }

  async createEntry(entry: InsertDictionaryEntry): Promise<DictionaryEntry> {
    const id = this.currentEntryId++;
    const newEntry: DictionaryEntry = { 
      ...entry, 
      id,
      source: entry.source || null,
      tetum: entry.tetum || null,
      portuguese: entry.portuguese || null,
      english: entry.english || null,
      category: entry.category || null,
      notes: entry.notes || null,
      explanation: entry.explanation || null,
      pronunciation: entry.pronunciation || null,
      wordClass: entry.wordClass || null,
      etymology: entry.etymology || null,
      usageExamples: Array.isArray(entry.usageExamples) ? entry.usageExamples as string[] : null,
      relatedTerms: Array.isArray(entry.relatedTerms) ? entry.relatedTerms as string[] : null,
    };
    this.entries.set(id, newEntry);
    return newEntry;
  }

  async bulkCreateEntries(entries: InsertDictionaryEntry[]): Promise<DictionaryEntry[]> {
    const createdEntries: DictionaryEntry[] = [];
    for (const entry of entries) {
      const created = await this.createEntry(entry);
      createdEntries.push(created);
    }
    return createdEntries;
  }

  async getUserBookmarks(userId: string): Promise<Bookmark[]> {
    return Array.from(this.bookmarksMap.values()).filter(bookmark => bookmark.userId === userId);
  }

  async createBookmark(bookmark: InsertBookmark): Promise<Bookmark> {
    const id = this.currentBookmarkId++;
    const newBookmark: Bookmark = { 
      ...bookmark, 
      id,
      entryId: bookmark.entryId || null,
    };
    const key = `${bookmark.userId}-${bookmark.entryId}`;
    this.bookmarksMap.set(key, newBookmark);
    return newBookmark;
  }

  async deleteBookmark(userId: string, entryId: number): Promise<void> {
    const key = `${userId}-${entryId}`;
    this.bookmarksMap.delete(key);
  }

  async getUserSearchHistory(userId: string): Promise<SearchHistory[]> {
    return Array.from(this.searchHistoryMap.values())
      .filter(history => history.userId === userId)
      .sort((a, b) => new Date(b.searchedAt).getTime() - new Date(a.searchedAt).getTime());
  }

  async addSearchHistory(history: InsertSearchHistory): Promise<SearchHistory> {
    const id = this.currentHistoryId++;
    const newHistory: SearchHistory = { ...history, id };
    this.searchHistoryMap.set(`${history.userId}-${id}`, newHistory);
    return newHistory;
  }

  async clearSearchHistory(userId: string): Promise<void> {
    const keysToDelete = Array.from(this.searchHistoryMap.keys())
      .filter(key => key.startsWith(`${userId}-`));
    keysToDelete.forEach(key => this.searchHistoryMap.delete(key));
  }
}

export const storage = new MemStorage();

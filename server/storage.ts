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
    const entries = Array.from(this.entries.values());
    
    if (!query.query) return entries;

    const searchTerm = query.caseSensitive ? query.query : query.query.toLowerCase();
    
    return entries.filter(entry => {
      // Filter by dictionary type
      if (query.dictionaryType !== "all" && entry.dictionaryType !== query.dictionaryType) {
        return false;
      }

      // Language-specific search
      const fields: string[] = [];
      if (query.language === "all" || query.language === "tetum") {
        if (entry.tetum) fields.push(entry.tetum);
      }
      if (query.language === "all" || query.language === "portuguese") {
        if (entry.portuguese) fields.push(entry.portuguese);
      }
      if (query.language === "all" || query.language === "english") {
        if (entry.english) fields.push(entry.english);
      }

      // Include explanations if requested
      if (query.includeDefinitions && entry.explanation) {
        fields.push(entry.explanation);
      }

      // Search in relevant fields
      return fields.some(field => {
        const fieldValue = query.caseSensitive ? field : field.toLowerCase();
        return query.exactMatch 
          ? fieldValue === searchTerm
          : fieldValue.includes(searchTerm);
      });
    });
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

import { pgTable, text, serial, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const dictionaryEntries = pgTable("dictionary_entries", {
  id: serial("id").primaryKey(),
  tetum: text("tetum"),
  portuguese: text("portuguese"),
  english: text("english"),
  source: text("source"),
  category: text("category").default("general"),
  dictionaryType: text("dictionary_type").notNull(), // legal, medical, general, asean
  notes: text("notes"),
  explanation: text("explanation"),
  pronunciation: text("pronunciation"),
  wordClass: text("word_class"),
  etymology: text("etymology"),
  usageExamples: jsonb("usage_examples").$type<string[]>().default([]),
  relatedTerms: jsonb("related_terms").$type<string[]>().default([]),
});

export const bookmarks = pgTable("bookmarks", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  entryId: integer("entry_id").references(() => dictionaryEntries.id),
  createdAt: text("created_at").notNull(),
});

export const searchHistory = pgTable("search_history", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  query: text("query").notNull(),
  searchedAt: text("searched_at").notNull(),
});

export const insertDictionaryEntrySchema = createInsertSchema(dictionaryEntries);
export const insertBookmarkSchema = createInsertSchema(bookmarks).omit({ id: true });
export const insertSearchHistorySchema = createInsertSchema(searchHistory).omit({ id: true });

export type DictionaryEntry = typeof dictionaryEntries.$inferSelect;
export type InsertDictionaryEntry = z.infer<typeof insertDictionaryEntrySchema>;
export type Bookmark = typeof bookmarks.$inferSelect;
export type InsertBookmark = z.infer<typeof insertBookmarkSchema>;
export type SearchHistory = typeof searchHistory.$inferSelect;
export type InsertSearchHistory = z.infer<typeof insertSearchHistorySchema>;

// Search and filter types
export const searchQuerySchema = z.object({
  query: z.string().optional().default(""),
  dictionaryType: z.enum(["all", "legal", "medical", "general", "asean", "tetum-glossary", "portuguese-glossary", "tetum-monolingual"]).default("all"),
  language: z.enum(["all", "tetum", "portuguese", "english"]).default("all"),
  exactMatch: z.boolean().default(false),
  includeDefinitions: z.boolean().default(true),
  caseSensitive: z.boolean().default(false),
});

export type SearchQuery = z.infer<typeof searchQuerySchema>;

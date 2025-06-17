import { DictionaryEntry, SearchQuery } from "@shared/schema";

export const DICTIONARY_TYPES = {
  all: "All Dictionaries",
  legal: "Legal Dictionary",
  medical: "Medical Dictionary",
  general: "General Dictionary",
  asean: "ASEAN Glossary",
} as const;

export const LANGUAGES = {
  all: "All Languages",
  tetum: "Tetum",
  portuguese: "Portuguese", 
  english: "English",
} as const;

export const DICTIONARY_ICONS = {
  legal: "fas fa-scale-balanced",
  medical: "fas fa-stethoscope",
  general: "fas fa-book",
  asean: "fas fa-globe-asia",
} as const;

export const DICTIONARY_COLORS = {
  legal: "bg-blue-500",
  medical: "bg-red-500",
  general: "bg-purple-500",
  asean: "bg-green-500",
} as const;

export function getDictionaryIcon(type: string): string {
  return DICTIONARY_ICONS[type as keyof typeof DICTIONARY_ICONS] || "fas fa-book";
}

export function getDictionaryColor(type: string): string {
  return DICTIONARY_COLORS[type as keyof typeof DICTIONARY_COLORS] || "bg-gray-500";
}

export function formatSearchResults(entries: DictionaryEntry[]): DictionaryEntry[] {
  return entries.map(entry => ({
    ...entry,
    // Ensure all fields have fallback values
    tetum: entry.tetum || "",
    portuguese: entry.portuguese || "",
    english: entry.english || "",
    explanation: entry.explanation || "",
    source: entry.source || "Unknown",
    category: entry.category || "general",
  }));
}

export function highlightSearchTerm(text: string, searchTerm: string): string {
  if (!searchTerm || !text) return text;
  
  const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  return text.replace(regex, '<mark class="bg-yellow-200 dark:bg-yellow-800">$1</mark>');
}

export function buildSearchQuery(params: Partial<SearchQuery>): SearchQuery {
  return {
    query: params.query || "",
    dictionaryType: params.dictionaryType || "all",
    language: params.language || "all",
    exactMatch: params.exactMatch || false,
    includeDefinitions: params.includeDefinitions ?? true,
    caseSensitive: params.caseSensitive || false,
  };
}

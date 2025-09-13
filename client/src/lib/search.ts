import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "./queryClient";
import { DictionaryEntry, SearchQuery, Bookmark, SearchHistory } from "../../../shared/schema";
import { offlineManager, useOfflineStatus } from "./offlineManager";

// Enhanced search entries with offline-first approach
export function useSearchEntries(searchQuery: SearchQuery) {
  const isOffline = useOfflineStatus();
  const queryParams = new URLSearchParams();
  
  Object.entries(searchQuery).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      // Handle boolean values properly
      if (typeof value === 'boolean') {
        queryParams.append(key, value.toString());
      } else {
        queryParams.append(key, String(value));
      }
    }
  });

  // Route to module-specific endpoints
  let endpoint = "/api/search";
  if (searchQuery.dictionaryType === "medical") {
    endpoint = "/api/medical/search";
  } else if (searchQuery.dictionaryType === "legal") {
    endpoint = "/api/legal/search";
  } else if (searchQuery.dictionaryType === "tetum-glossary") {
    endpoint = "/api/tetum-glossary/search";
  } else if (searchQuery.dictionaryType === "portuguese-glossary") {
    endpoint = "/api/portuguese-glossary/search";
  } else if (searchQuery.dictionaryType === "tetum-monolingual") {
    endpoint = "/api/tetum-monolingual/search";
  } else if (searchQuery.dictionaryType === "inl-tetum") {
    endpoint = "/api/inl-tetum/search";
  } else if (searchQuery.dictionaryType === "asean") {
    endpoint = "/api/asean/search";
  }

  return useQuery<DictionaryEntry[]>({
    queryKey: [endpoint, queryParams.toString()],
    queryFn: async () => {
      // Try offline search first if we're offline
      if (isOffline) {
        console.log('Using offline search for:', searchQuery);
        return await offlineManager.searchOffline(searchQuery);
      }
      
      // Try online search with offline fallback
      try {
        const response = await fetch(`${endpoint}?${queryParams.toString()}`, {
          credentials: 'include'
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return await response.json();
      } catch (error) {
        console.warn('Online search failed, falling back to offline:', error);
        return await offlineManager.searchOffline(searchQuery);
      }
    },
    enabled: !!searchQuery.query?.trim() || searchQuery.dictionaryType !== "all",
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
  });
}

// Get all entries with offline fallback
export function useAllEntries() {
  const isOffline = useOfflineStatus();
  
  return useQuery<DictionaryEntry[]>({
    queryKey: ["/api/entries"],
    queryFn: async () => {
      if (isOffline) {
        // Get from all cached dictionaries when offline
        const stats = await offlineManager.getCachedStats();
        if (stats) {
          return await offlineManager.searchOffline({ 
            query: "", 
            dictionaryType: "all",
            language: "all",
            exactMatch: false,
            includeDefinitions: true,
            caseSensitive: false
          });
        }
        return [];
      }
      
      try {
        const response = await fetch("/api/entries", { credentials: 'include' });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return await response.json();
      } catch (error) {
        console.warn('Failed to fetch entries online, using offline fallback');
        return await offlineManager.searchOffline({ 
          query: "", 
          dictionaryType: "all",
          language: "all",
          exactMatch: false,
          includeDefinitions: true,
          caseSensitive: false
        });
      }
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
    gcTime: 1000 * 60 * 60, // 1 hour
  });
}

// Get medical entries with offline fallback
export function useMedicalEntries() {
  const isOffline = useOfflineStatus();
  
  return useQuery<DictionaryEntry[]>({
    queryKey: ["/api/medical/entries"],
    queryFn: async () => {
      if (isOffline) {
        return await offlineManager.getCachedEntries('medical');
      }
      
      try {
        const response = await fetch("/api/medical/entries", { credentials: 'include' });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return await response.json();
      } catch (error) {
        console.warn('Failed to fetch medical entries online, using offline fallback');
        return await offlineManager.getCachedEntries('medical');
      }
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
    gcTime: 1000 * 60 * 60, // 1 hour
  });
}

// Get legal entries
export function useLegalEntries() {
  return useQuery<DictionaryEntry[]>({
    queryKey: ["/api/legal/entries"],
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

// Get single entry
export function useEntry(id: number | null) {
  return useQuery<DictionaryEntry>({
    queryKey: ["/api/entries", id],
    enabled: !!id,
  });
}

// Get dictionary statistics with offline fallback
export function useDictionaryStats() {
  const isOffline = useOfflineStatus();
  
  return useQuery<{
    total: number;
    legal: number;
    medical: number;
    general: number;
    asean: number;
    "tetum-glossary": number;
    "portuguese-glossary": number;
    "tetum-monolingual": number;
    "portuguese-legal": number;
    "inl-tetum": number;
    offline?: boolean;
  }>({
    queryKey: ["/api/stats"],
    queryFn: async () => {
      if (isOffline) {
        const cachedStats = await offlineManager.getCachedStats();
        return cachedStats ? { ...cachedStats, offline: true } : {
          total: 0, legal: 0, medical: 0, general: 0, asean: 0,
          "tetum-glossary": 0, "portuguese-glossary": 0, 
          "tetum-monolingual": 0, "portuguese-legal": 0,
          "inl-tetum": 0, offline: true
        };
      }
      
      try {
        const response = await fetch("/api/stats", { credentials: 'include' });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return await response.json();
      } catch (error) {
        console.warn('Failed to fetch stats online, using offline fallback');
        const cachedStats = await offlineManager.getCachedStats();
        return cachedStats ? { ...cachedStats, offline: true } : {
          total: 0, legal: 0, medical: 0, general: 0, asean: 0,
          "tetum-glossary": 0, "portuguese-glossary": 0, 
          "tetum-monolingual": 0, "portuguese-legal": 0,
          "inl-tetum": 0, offline: true
        };
      }
    },
    staleTime: 1000 * 60 * 15, // 15 minutes
    gcTime: 1000 * 60 * 60, // 1 hour
  });
}

// Bookmarks
export function useBookmarks(userId: string) {
  return useQuery<Bookmark[]>({
    queryKey: ["/api/bookmarks", userId],
    enabled: !!userId,
  });
}

export function useCreateBookmark() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: { userId: string; entryId: number }) => {
      const response = await apiRequest("POST", "/api/bookmarks", data);
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/bookmarks", variables.userId] });
    },
  });
}

export function useDeleteBookmark() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ userId, entryId }: { userId: string; entryId: number }) => {
      const response = await apiRequest("DELETE", `/api/bookmarks/${userId}/${entryId}`);
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/bookmarks", variables.userId] });
    },
  });
}

// Search History
export function useSearchHistory(userId: string) {
  return useQuery<SearchHistory[]>({
    queryKey: ["/api/history", userId],
    enabled: !!userId,
  });
}

export function useAddSearchHistory() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: { userId: string; query: string }) => {
      const response = await apiRequest("POST", "/api/history", data);
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/history", variables.userId] });
    },
  });
}

export function useClearSearchHistory() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (userId: string) => {
      const response = await apiRequest("DELETE", `/api/history/${userId}`);
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/history", variables] });
    },
  });
}

// INL Tetum Dictionary specific hooks
export function useINLTetumEntries() {
  return useQuery<DictionaryEntry[]>({
    queryKey: ["/api/inl-tetum/entries"],
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

export function useINLTetumSearch(searchQuery: SearchQuery) {
  const queryParams = new URLSearchParams();
  
  Object.entries(searchQuery).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      if (typeof value === 'boolean') {
        queryParams.append(key, value.toString());
      } else {
        queryParams.append(key, String(value));
      }
    }
  });

  return useQuery<DictionaryEntry[]>({
    queryKey: ["/api/inl-tetum/search", queryParams.toString()],
    enabled: !!searchQuery.query?.trim(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

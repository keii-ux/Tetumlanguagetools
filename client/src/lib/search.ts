import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { DictionaryEntry, SearchQuery, Bookmark, SearchHistory } from "@shared/schema";

// Search entries with module-specific routing
export function useSearchEntries(searchQuery: SearchQuery) {
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
  } else if (searchQuery.dictionaryType === "legal" || 
             searchQuery.dictionaryType === "tetum-glossary" || 
             searchQuery.dictionaryType === "portuguese-glossary" ||
             searchQuery.dictionaryType === "portuguese-legal") {
    endpoint = "/api/legal/search";
  } else if (searchQuery.dictionaryType === "tetum-monolingual") {
    endpoint = "/api/tetum-monolingual/search";
  } else if (searchQuery.dictionaryType === "inl-tetum") {
    endpoint = "/api/inl-tetum/search";
  }

  return useQuery<DictionaryEntry[]>({
    queryKey: [endpoint, queryParams.toString()],
    enabled: !!searchQuery.query?.trim() || searchQuery.dictionaryType !== "all",
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Get all entries
export function useAllEntries() {
  return useQuery<DictionaryEntry[]>({
    queryKey: ["/api/entries"],
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

// Get dictionary statistics
export function useDictionaryStats() {
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
  }>({
    queryKey: ["/api/stats"],
    staleTime: 1000 * 60 * 15, // 15 minutes
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

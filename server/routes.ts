import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { searchQuerySchema, insertBookmarkSchema, insertSearchHistorySchema } from "@shared/schema";
import fs from "fs/promises";
import path from "path";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Helper function to safely convert values to strings
  const safeStringify = (value: any): string => {
    if (value === null || value === undefined) return "";
    if (typeof value === "string") return value;
    if (typeof value === "object") {
      if (value.meaning) return value.meaning;
      if (value.variant) return value.variant;
      return JSON.stringify(value);
    }
    return String(value);
  };

  // Initialize dictionary data from JSON files
  async function initializeDictionaries() {
    try {
      // Load medical dictionaries
      const medicalTetumEnPath = path.resolve(process.cwd(), "attached_assets", "medical-dic_tt_en_1750136885930.json");
      const medicalEnTetumPath = path.resolve(process.cwd(), "attached_assets", "medical_dic_en-tt_fixed.json");
      
      let medicalTetumEnData = [];
      let medicalEnTetumData = [];
      
      try {
        medicalTetumEnData = JSON.parse(await fs.readFile(medicalTetumEnPath, "utf-8"));
      } catch (error) {
        console.warn("Medical Tetum-English dictionary not found");
      }
      
      try {
        medicalEnTetumData = JSON.parse(await fs.readFile(medicalEnTetumPath, "utf-8"));
        console.log(`Medical English-Tetum dictionary loaded successfully with ${medicalEnTetumData.length} entries`);
      } catch (error) {
        console.warn("Medical English-Tetum dictionary not found or malformed:", error);
        medicalEnTetumData = [];
      }
      
      // Load INL Tetum dictionary (has complex structure with meaning/variant objects)
      let inlTetumData: any[] = [];
      try {
        const inlTetumPath = path.resolve(process.cwd(), "attached_assets", "inl_tt_dic_final_1750040241832.json");
        inlTetumData = JSON.parse(await fs.readFile(inlTetumPath, "utf-8"));
      } catch (error) {
        console.warn("INL Tetum dictionary not found");
      }
      
      // For now, we'll initialize without the legal dictionaries since they were removed
      const legalDictData: any[] = [];
      const legalGlossaryData: any[] = [];
      const generalDictData: any[] = [];

      // Process legal dictionary entries
      const legalEntries = legalDictData.map((item: any) => ({
        tetum: safeStringify(item.tetum),
        portuguese: safeStringify(item.portuguese),
        english: safeStringify(item.english),
        source: safeStringify(item.source),
        category: "legal",
        dictionaryType: "legal",
        notes: safeStringify(item.notes),
        explanation: "",
        pronunciation: "",
        wordClass: "",
        etymology: "",
        usageExamples: [],
        relatedTerms: [],
      }));

      // Process legal glossary entries
      const glossaryEntries = legalGlossaryData.map((item: any) => ({
        tetum: safeStringify(item.tetum_term),
        portuguese: "",
        english: "",
        source: safeStringify(item.source) || "Legal Dictionary",
        category: "legal",
        dictionaryType: "legal",
        notes: "",
        explanation: safeStringify(item.tetum_explanation),
        pronunciation: "",
        wordClass: "",
        etymology: "",
        usageExamples: [],
        relatedTerms: [],
      }));

      // Process INL Tetum dictionary entries (complex structure with objects)
      const inlTetumEntries = inlTetumData.filter((item: any) => item && item.word).map((item: any) => ({
        tetum: safeStringify(item.word),
        portuguese: "",
        english: safeStringify(item.meaning),
        source: "INL Tetum Dictionary",
        category: "general",
        dictionaryType: "general",
        notes: "",
        explanation: safeStringify(item.meaning),
        pronunciation: "",
        wordClass: safeStringify(item.class),
        etymology: "",
        usageExamples: [],
        relatedTerms: [],
      }));

      // Process medical dictionary entries (Tetum-English)
      const medicalTetumEntries = medicalTetumEnData.map((item: any) => ({
        tetum: safeStringify(item.term),
        english: Array.isArray(item.translations) ? item.translations.join("; ") : safeStringify(item.translation),
        portuguese: "",
        source: safeStringify(item.source) || "Medical Dictionary",
        category: "medical",
        dictionaryType: "medical",
        notes: item.usage ? `Usage: ${safeStringify(item.usage)}` : "",
        explanation: item.similar ? `Similar: ${Array.isArray(item.similar) ? item.similar.join("; ") : safeStringify(item.similar)}` : "",
        pronunciation: "",
        wordClass: "",
        etymology: "",
        usageExamples: item.action ? (Array.isArray(item.action) ? item.action.map(safeStringify) : [safeStringify(item.action)]) : [],
        relatedTerms: item.synonym ? (Array.isArray(item.synonym) ? item.synonym.map(safeStringify) : [safeStringify(item.synonym)]) : [],
      }));

      // Process medical dictionary entries (English-Tetum)
      const medicalEnEntries = medicalEnTetumData.map((item: any) => ({
        english: safeStringify(item.english),
        tetum: safeStringify(item.tetum),
        portuguese: "",
        source: "Medical Dictionary",
        category: "medical",
        dictionaryType: "medical",
        notes: "",
        explanation: "",
        pronunciation: "",
        wordClass: "",
        etymology: "",
        usageExamples: [],
        relatedTerms: [],
      }));

      // Process general dictionary entries
      const generalEntries = generalDictData.map((item: any) => ({
        tetum: safeStringify(item.tetum),
        portuguese: safeStringify(item.portuguese),
        english: safeStringify(item.english),
        source: safeStringify(item.source),
        category: "general",
        dictionaryType: "general",
        notes: safeStringify(item.notes),
        explanation: "",
        pronunciation: "",
        wordClass: "",
        etymology: "",
        usageExamples: [],
        relatedTerms: [],
      }));

      // Bulk insert all entries
      await storage.bulkCreateEntries([...legalEntries, ...glossaryEntries, ...inlTetumEntries, ...medicalTetumEntries, ...medicalEnEntries, ...generalEntries]);
      
      console.log(`Loaded ${legalEntries.length + glossaryEntries.length + inlTetumEntries.length + medicalTetumEntries.length + medicalEnEntries.length + generalEntries.length} dictionary entries`);
    } catch (error) {
      console.error("Error initializing dictionaries:", error);
    }
  }

  // Initialize dictionaries on startup
  await initializeDictionaries();

  // Search entries
  app.get("/api/search", async (req, res) => {
    try {
      const searchQuery = searchQuerySchema.parse(req.query);
      const results = await storage.searchEntries(searchQuery);
      res.json(results);
    } catch (error) {
      res.status(400).json({ error: "Invalid search parameters" });
    }
  });

  // Get all entries
  app.get("/api/entries", async (req, res) => {
    try {
      const entries = await storage.getAllEntries();
      res.json(entries);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch entries" });
    }
  });

  // Get entry by ID
  app.get("/api/entries/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const entry = await storage.getEntryById(id);
      if (!entry) {
        return res.status(404).json({ error: "Entry not found" });
      }
      res.json(entry);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch entry" });
    }
  });

  // Get user bookmarks
  app.get("/api/bookmarks/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const bookmarks = await storage.getUserBookmarks(userId);
      res.json(bookmarks);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch bookmarks" });
    }
  });

  // Create bookmark
  app.post("/api/bookmarks", async (req, res) => {
    try {
      const bookmarkData = insertBookmarkSchema.parse({
        ...req.body,
        createdAt: new Date().toISOString(),
      });
      const bookmark = await storage.createBookmark(bookmarkData);
      res.json(bookmark);
    } catch (error) {
      res.status(400).json({ error: "Invalid bookmark data" });
    }
  });

  // Delete bookmark
  app.delete("/api/bookmarks/:userId/:entryId", async (req, res) => {
    try {
      const { userId, entryId } = req.params;
      await storage.deleteBookmark(userId, parseInt(entryId));
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete bookmark" });
    }
  });

  // Get user search history
  app.get("/api/history/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const history = await storage.getUserSearchHistory(userId);
      res.json(history);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch search history" });
    }
  });

  // Add search history
  app.post("/api/history", async (req, res) => {
    try {
      const historyData = insertSearchHistorySchema.parse({
        ...req.body,
        searchedAt: new Date().toISOString(),
      });
      const history = await storage.addSearchHistory(historyData);
      res.json(history);
    } catch (error) {
      res.status(400).json({ error: "Invalid history data" });
    }
  });

  // Clear search history
  app.delete("/api/history/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      await storage.clearSearchHistory(userId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to clear search history" });
    }
  });

  // Get dictionary statistics
  app.get("/api/stats", async (req, res) => {
    try {
      const entries = await storage.getAllEntries();
      const stats = {
        total: entries.length,
        legal: entries.filter(e => e.dictionaryType === "legal").length,
        medical: entries.filter(e => e.dictionaryType === "medical").length,
        general: entries.filter(e => e.dictionaryType === "general").length,
        asean: entries.filter(e => e.dictionaryType === "asean").length,
      };
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch statistics" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

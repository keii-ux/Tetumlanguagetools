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
      const medicalEnTetumPath = path.resolve(process.cwd(), "attached_assets", "medical_dic_en-tt_1750136885932.json");
      
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

      // Load Tetum Monolingual dictionary
      let tetumMonolingualData: any[] = [];
      try {
        const tetumMonoPath = path.resolve(process.cwd(), "attached_assets", "Pasted--word-atletizmu-class-Substantivu-meaning-Atividade-ka-ku-1750156777749_1750156777753.txt");
        const fileContent = await fs.readFile(tetumMonoPath, "utf-8");
        tetumMonolingualData = JSON.parse(fileContent);
        console.log(`Tetum monolingual dictionary loaded successfully with ${tetumMonolingualData.length} entries`);
      } catch (error) {
        console.warn("Tetum monolingual dictionary not found or malformed:", error);
        // Fallback to sample data
        try {
          const fallbackPath = path.resolve(process.cwd(), "attached_assets", "tetum_monolingual_sample.json");
          tetumMonolingualData = JSON.parse(await fs.readFile(fallbackPath, "utf-8"));
          console.log(`Using fallback Tetum monolingual data with ${tetumMonolingualData.length} entries`);
        } catch (fallbackError) {
          console.warn("Fallback Tetum monolingual dictionary also not found");
        }
      }
      
      // Load legal dictionaries
      let legalDictData: any[] = [];
      let tetumGlossaryData: any[] = [];
      let portugueseGlossaryData: any[] = [];
      
      try {
        const legalDictPath = path.resolve(process.cwd(), "attached_assets", "legal dic tt_1750146002336.json");
        legalDictData = JSON.parse(await fs.readFile(legalDictPath, "utf-8"));
        console.log(`Legal dictionary loaded successfully with ${legalDictData.length} entries`);
      } catch (error) {
        console.warn("Legal dictionary not found:", error);
      }
      
      try {
        const tetumGlossaryPath = path.resolve(process.cwd(), "attached_assets", "legal tetum glossay_1750146002337.json");
        tetumGlossaryData = JSON.parse(await fs.readFile(tetumGlossaryPath, "utf-8"));
        console.log(`Tetum glossary loaded successfully with ${tetumGlossaryData.length} entries`);
      } catch (error) {
        console.warn("Tetum glossary not found:", error);
      }
      
      try {
        const portugueseGlossaryPath = path.resolve(process.cwd(), "attached_assets", "glos_juridico_pt.json");
        portugueseGlossaryData = JSON.parse(await fs.readFile(portugueseGlossaryPath, "utf-8"));
        console.log(`Portuguese glossary loaded successfully with ${portugueseGlossaryData.length} entries`);
      } catch (error) {
        console.warn("Portuguese glossary not found:", error);
      }

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

      // Process Tetum glossary entries
      const tetumGlossaryEntries = tetumGlossaryData.map((item: any) => ({
        tetum: safeStringify(item.tetum_term),
        portuguese: "",
        english: "",
        source: safeStringify(item.source) || "Legal Dictionary",
        category: "legal",
        dictionaryType: "tetum-glossary",
        notes: "",
        explanation: safeStringify(item.tetum_explanation),
        pronunciation: "",
        wordClass: "",
        etymology: "",
        usageExamples: [],
        relatedTerms: [],
      }));

      // Process Portuguese glossary entries
      const portugueseGlossaryEntries = portugueseGlossaryData.map((item: any) => ({
        tetum: "",
        portuguese: safeStringify(item.termo),
        english: "",
        source: "Portuguese Legal Dictionary",
        category: "legal",
        dictionaryType: "portuguese-glossary",
        notes: "",
        explanation: safeStringify(item.significado),
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

      // Process Tetum Monolingual dictionary entries
      const tetumMonolingualEntries = tetumMonolingualData.filter(item => item && item.word).map((item: any) => ({
        tetum: safeStringify(item.word),
        portuguese: "",
        english: "",
        source: "Tetum Monolingual Dictionary",
        category: "tetum-monolingual",
        dictionaryType: "tetum-monolingual",
        notes: "",
        explanation: safeStringify(item.meaning),
        pronunciation: "",
        wordClass: safeStringify(item.class),
        etymology: "",
        usageExamples: [],
        relatedTerms: [],
      }));

      // Bulk insert all entries
      await storage.bulkCreateEntries([...legalEntries, ...tetumGlossaryEntries, ...portugueseGlossaryEntries, ...inlTetumEntries, ...medicalTetumEntries, ...medicalEnEntries, ...generalEntries, ...tetumMonolingualEntries]);
      
      console.log(`Loaded ${legalEntries.length + tetumGlossaryEntries.length + portugueseGlossaryEntries.length + inlTetumEntries.length + medicalTetumEntries.length + medicalEnEntries.length + generalEntries.length + tetumMonolingualEntries.length} dictionary entries`);
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
      console.error("Search error:", error);
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(400).json({ error: "Invalid search parameters" });
      }
    }
  });

  // Get all entries
  app.get("/api/entries", async (req, res) => {
    try {
      const entries = await storage.getAllEntries();
      res.json(entries);
    } catch (error) {
      console.error("Get all entries error:", error);
      res.status(500).json({ error: "Failed to fetch entries" });
    }
  });

  // Get entry by ID
  app.get("/api/entries/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid entry ID" });
      }
      const entry = await storage.getEntryById(id);
      if (!entry) {
        return res.status(404).json({ error: "Entry not found" });
      }
      res.json(entry);
    } catch (error) {
      console.error("Get entry by ID error:", error);
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
      console.error("Create bookmark error:", error);
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(400).json({ error: "Invalid bookmark data" });
      }
    }
  });

  // Delete bookmark
  app.delete("/api/bookmarks/:userId/:entryId", async (req, res) => {
    try {
      const { userId, entryId } = req.params;
      const entryIdNum = parseInt(entryId);
      if (isNaN(entryIdNum)) {
        return res.status(400).json({ error: "Invalid entry ID" });
      }
      await storage.deleteBookmark(userId, entryIdNum);
      res.json({ success: true });
    } catch (error) {
      console.error("Delete bookmark error:", error);
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
      console.error("Add search history error:", error);
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(400).json({ error: "Invalid history data" });
      }
    }
  });

  // Clear search history
  app.delete("/api/history/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      if (!userId || userId.trim() === "") {
        return res.status(400).json({ error: "Invalid user ID" });
      }
      await storage.clearSearchHistory(userId);
      res.json({ success: true });
    } catch (error) {
      console.error("Clear search history error:", error);
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
        "tetum-glossary": entries.filter(e => e.dictionaryType === "tetum-glossary").length,
        "portuguese-glossary": entries.filter(e => e.dictionaryType === "portuguese-glossary").length,
        "tetum-monolingual": entries.filter(e => e.dictionaryType === "tetum-monolingual").length,
      };
      res.json(stats);
    } catch (error) {
      console.error("Get statistics error:", error);
      res.status(500).json({ error: "Failed to fetch statistics" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

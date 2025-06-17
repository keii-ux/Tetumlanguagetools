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
      // Load MEDICAL dictionaries - Only medical terms
      const medicalTetumEnPath = path.resolve(process.cwd(), "attached_assets", "medical-dic_tt_en_1750136885930.json");
      const medicalEnTetumPath = path.resolve(process.cwd(), "attached_assets", "medical_dic_en-tt_1750136885932.json");
      
      let medicalTetumEnData = [];
      let medicalEnTetumData = [];
      
      try {
        medicalTetumEnData = JSON.parse(await fs.readFile(medicalTetumEnPath, "utf-8"));
        console.log(`Medical Tetum-English dictionary loaded successfully with ${medicalTetumEnData.length} entries`);
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
      
      // Load INL Tetum dictionary from the new JSON file
      let inlTetumData: any[] = [];
      try {
        const inlTetumPath = path.resolve(process.cwd(), "attached_assets", "inl_tt_dic.json");
        inlTetumData = JSON.parse(await fs.readFile(inlTetumPath, "utf-8"));
        console.log(`INL Tetum dictionary loaded successfully with ${inlTetumData.length} entries`);
      } catch (error) {
        console.warn("INL Tetum dictionary not found:", error);
      }

      // Load additional legal terms in Portuguese
      let additionalLegalData: any[] = [];
      try {
        const additionalLegalPath = path.resolve(process.cwd(), "attached_assets", "Pasted--termo-Abandono-da-causa-significado-Por-incumprimento-das-dilig-ncias-proces-1750147297627_1750147297629.txt");
        additionalLegalData = JSON.parse(await fs.readFile(additionalLegalPath, "utf-8"));
        console.log(`Additional legal terms loaded successfully with ${additionalLegalData.length} entries`);
      } catch (error) {
        console.warn("Additional legal terms not found:", error);
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

      // Process INL Tetum dictionary entries (new structure)
      const inlTetumEntries = inlTetumData.filter((item: any) => item && item.word).map((item: any) => ({
        tetum: safeStringify(item.word),
        portuguese: "",
        english: "",
        source: "INL Tetum Dictionary",
        category: "inl-tetum",
        dictionaryType: "inl-tetum",
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



      // Process additional legal terms (Portuguese)
      const additionalLegalEntries = additionalLegalData.filter(item => item && item.termo).map((item: any) => ({
        tetum: "",
        portuguese: safeStringify(item.termo),
        english: "",
        source: "Legal Dictionary Supplement",
        category: "legal",
        dictionaryType: "portuguese-legal",
        notes: "",
        explanation: safeStringify(item.significado),
        pronunciation: "",
        wordClass: "Termo Jurídico",
        etymology: "",
        usageExamples: [],
        relatedTerms: [],
      }));

      // Bulk insert all entries with proper separation
      await storage.bulkCreateEntries([
        ...legalEntries,           // Legal module only
        ...tetumGlossaryEntries,   // Legal module only
        ...portugueseGlossaryEntries, // Legal module only
        ...additionalLegalEntries, // Legal module only
        ...medicalTetumEntries,    // Medical module only
        ...medicalEnEntries,       // Medical module only
        ...inlTetumEntries         // INL Tetum dictionary module
      ]);
      
      console.log(`Loaded ${legalEntries.length + tetumGlossaryEntries.length + portugueseGlossaryEntries.length + additionalLegalEntries.length + medicalTetumEntries.length + medicalEnEntries.length + inlTetumEntries.length} dictionary entries`);
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
        "portuguese-legal": entries.filter(e => e.dictionaryType === "portuguese-legal").length,
        "inl-tetum": entries.filter(e => e.dictionaryType === "inl-tetum").length,
      };
      res.json(stats);
    } catch (error) {
      console.error("Get statistics error:", error);
      res.status(500).json({ error: "Failed to fetch statistics" });
    }
  });

  // Medical module endpoints - Only medical terms
  app.get("/api/medical/search", async (req, res) => {
    try {
      const searchQuery = searchQuerySchema.parse(req.query);
      const allResults = await storage.searchEntries(searchQuery);
      const medicalResults = allResults.filter(e => e.dictionaryType === "medical");
      res.json(medicalResults);
    } catch (error) {
      console.error("Medical search error:", error);
      res.status(400).json({ error: "Invalid search parameters" });
    }
  });

  app.get("/api/medical/entries", async (req, res) => {
    try {
      const entries = await storage.getAllEntries();
      const medicalEntries = entries.filter(e => e.dictionaryType === "medical");
      res.json(medicalEntries);
    } catch (error) {
      console.error("Medical entries error:", error);
      res.status(500).json({ error: "Failed to fetch medical entries" });
    }
  });

  // Legal module endpoints - Only legal terms
  app.get("/api/legal/search", async (req, res) => {
    try {
      const searchQuery = searchQuerySchema.parse(req.query);
      const allResults = await storage.searchEntries(searchQuery);
      const legalResults = allResults.filter(e => 
        e.dictionaryType === "legal" || 
        e.dictionaryType === "tetum-glossary" || 
        e.dictionaryType === "portuguese-glossary" ||
        e.dictionaryType === "portuguese-legal"
      );
      res.json(legalResults);
    } catch (error) {
      console.error("Legal search error:", error);
      res.status(400).json({ error: "Invalid search parameters" });
    }
  });

  // INL Tetum dictionary endpoints
  app.get("/api/inl-tetum/search", async (req, res) => {
    try {
      const searchQuery = searchQuerySchema.parse(req.query);
      const allResults = await storage.searchEntries(searchQuery);
      const inlTetumResults = allResults.filter(e => e.dictionaryType === "inl-tetum");
      res.json(inlTetumResults);
    } catch (error) {
      console.error("INL Tetum search error:", error);
      res.status(400).json({ error: "Invalid search parameters" });
    }
  });

  app.get("/api/legal/entries", async (req, res) => {
    try {
      const entries = await storage.getAllEntries();
      const legalEntries = entries.filter(e => 
        e.dictionaryType === "legal" || 
        e.dictionaryType === "tetum-glossary" || 
        e.dictionaryType === "portuguese-glossary" ||
        e.dictionaryType === "portuguese-legal"
      );
      res.json(legalEntries);
    } catch (error) {
      console.error("Legal entries error:", error);
      res.status(500).json({ error: "Failed to fetch legal entries" });
    }
  });

  // Tetum monolingual module endpoints - Only Tetum monolingual terms
  app.get("/api/tetum-monolingual/search", async (req, res) => {
    try {
      const searchQuery = searchQuerySchema.parse(req.query);
      const allResults = await storage.searchEntries(searchQuery);
      const tetumResults = allResults.filter(e => e.dictionaryType === "tetum-monolingual");
      res.json(tetumResults);
    } catch (error) {
      console.error("Tetum monolingual search error:", error);
      res.status(400).json({ error: "Invalid search parameters" });
    }
  });

  app.get("/api/tetum-monolingual/entries", async (req, res) => {
    try {
      const entries = await storage.getAllEntries();
      const tetumEntries = entries.filter(e => e.dictionaryType === "tetum-monolingual");
      res.json(tetumEntries);
    } catch (error) {
      console.error("Tetum monolingual entries error:", error);
      res.status(500).json({ error: "Failed to fetch Tetum monolingual entries" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

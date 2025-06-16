import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { searchQuerySchema, insertBookmarkSchema, insertSearchHistorySchema } from "@shared/schema";
import fs from "fs/promises";
import path from "path";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Initialize dictionary data from JSON files
  async function initializeDictionaries() {
    try {
      // Load legal dictionary
      const legalDictPath = path.resolve(process.cwd(), "attached_assets", "legal dic tt_1750040265133.json");
      const legalDictData = JSON.parse(await fs.readFile(legalDictPath, "utf-8"));
      
      // Load legal glossary
      const legalGlossaryPath = path.resolve(process.cwd(), "attached_assets", "legal tetum glossay_1750040265136.json");
      const legalGlossaryData = JSON.parse(await fs.readFile(legalGlossaryPath, "utf-8"));
      
      // Load general dictionary
      const generalDictPath = path.resolve(process.cwd(), "attached_assets", "legal dic tt copy_1750040265136.json");
      const generalDictData = JSON.parse(await fs.readFile(generalDictPath, "utf-8"));
      
      // Load medical dictionary
      const medicalDictPath = path.resolve(process.cwd(), "server", "data", "medical-dictionary.json");
      const medicalDictData = JSON.parse(await fs.readFile(medicalDictPath, "utf-8"));

      // Process legal dictionary entries
      const legalEntries = legalDictData.map((item: any) => ({
        tetum: item.tetum || "",
        portuguese: item.portuguese || "",
        english: item.english || "",
        source: item.source || "",
        category: "legal",
        dictionaryType: "legal",
        notes: item.notes || "",
        explanation: "",
        pronunciation: "",
        wordClass: "",
        etymology: "",
        usageExamples: [],
        relatedTerms: [],
      }));

      // Process legal glossary entries
      const glossaryEntries = legalGlossaryData.map((item: any) => ({
        tetum: item.tetum_term || "",
        portuguese: "",
        english: "",
        source: item.source || "Legal Dictionary",
        category: "legal",
        dictionaryType: "legal",
        notes: "",
        explanation: item.tetum_explanation || "",
        pronunciation: "",
        wordClass: "",
        etymology: "",
        usageExamples: [],
        relatedTerms: [],
      }));

      // Process general dictionary entries
      const generalEntries = generalDictData.map((item: any) => ({
        tetum: item.tetum || "",
        portuguese: item.portuguese || "",
        english: item.english || "",
        source: item.source || "",
        category: "general",
        dictionaryType: "general",
        notes: item.notes || "",
        explanation: "",
        pronunciation: "",
        wordClass: "",
        etymology: "",
        usageExamples: [],
        relatedTerms: [],
      }));

      // Process medical dictionary entries
      const medicalEntries = medicalDictData.map((item: any) => ({
        tetum: item.tetum || "",
        portuguese: item.portuguese || "",
        english: item.english || "",
        source: item.source || "Medical Dictionary",
        category: item.category || "medical",
        dictionaryType: "medical",
        notes: item.notes || "",
        explanation: item.explanation || "",
        pronunciation: item.pronunciation || "",
        wordClass: item.wordClass || "",
        etymology: item.etymology || "",
        usageExamples: item.usageExamples || [],
        relatedTerms: item.relatedTerms || [],
      }));

      // Bulk insert all entries
      await storage.bulkCreateEntries([...legalEntries, ...glossaryEntries, ...generalEntries, ...medicalEntries]);
      
      console.log(`Loaded ${legalEntries.length + glossaryEntries.length + generalEntries.length + medicalEntries.length} dictionary entries`);
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

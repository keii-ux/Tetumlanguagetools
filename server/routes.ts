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
      // Load MEDICAL dictionaries - English to Tetum and Tetum to English medical terms
      const medicalEnTetumPath = path.resolve(process.cwd(), "attached_assets", "medical_dic_en-tt_1750163422276.json");
      const medicalTetumEnPath = path.resolve(process.cwd(), "attached_assets", "medical-dic_tt_en.json");
      
      let medicalEnTetumData = [];
      let medicalTetumEnData = [];
      
      try {
        let fileContent = await fs.readFile(medicalEnTetumPath, "utf-8");
        
        // Fix JSON structure - the file appears to be missing array brackets
        if (!fileContent.trim().startsWith('[')) {
          fileContent = '[' + fileContent;
        }
        if (!fileContent.trim().endsWith(']')) {
          fileContent = fileContent + ']';
        }
        
        // Clean up any trailing commas and fix structural issues
        fileContent = fileContent.replace(/,(\s*[}\]])/g, '$1');
        
        medicalEnTetumData = JSON.parse(fileContent);
        console.log(`Medical English-Tetum dictionary loaded successfully with ${medicalEnTetumData.length} entries`);
      } catch (parseError) {
        console.warn("Medical dictionary parsing failed, attempting recovery:", parseError);
        
        // Fallback: Extract individual JSON objects and reconstruct array
        try {
          let fileContent = await fs.readFile(medicalEnTetumPath, "utf-8");
          
          // Extract individual medical term objects
          const objectMatches = fileContent.match(/\{[^{}]*"english"[^{}]*"tetum"[^{}]*\}/g);
          if (objectMatches) {
            const cleanedObjects = objectMatches.map(obj => {
              try {
                return JSON.parse(obj);
              } catch {
                return null;
              }
            }).filter(obj => obj !== null);
            
            medicalEnTetumData = cleanedObjects;
            console.log(`Medical dictionary recovered ${medicalEnTetumData.length} entries from malformed file`);
          }
        } catch (recoveryError) {
          console.error("Medical dictionary recovery failed:", recoveryError);
          medicalEnTetumData = [];
        }
      }
      
      // Load Tetum to English medical dictionary
      try {
        medicalTetumEnData = JSON.parse(await fs.readFile(medicalTetumEnPath, "utf-8"));
        console.log(`Medical Tetum-English dictionary loaded successfully with ${medicalTetumEnData.length} entries`);
      } catch (error) {
        console.warn("Medical Tetum-English dictionary not found or malformed:", error);
        medicalTetumEnData = [];
      }
      
      // Load INL Tetum dictionary from the new JSON file
      let inlTetumData: any[] = [];
      try {
        const inlTetumPath = path.resolve(process.cwd(), "attached_assets", "inl_tt_dic.json");
        let fileContent = await fs.readFile(inlTetumPath, "utf-8");
        
        // Clean up encoding issues in the JSON - handle common encoding artifacts
        fileContent = fileContent
          .replace(/M-CM-/g, '')
          .replace(/M-bM-\^@M-\^Y/g, 'e')
          .replace(/M-CM-!/g, 'a')
          .replace(/M-CM-:/g, 'u')
          .replace(/M-CM-\)/g, 'e')
          .replace(/M-CM-1/g, 'n')
          .replace(/M-CM--/g, 'o')
          .replace(/M-CM-3/g, 'o')
          .replace(/M-CM-\^/g, '')
          .replace(/M-CM-\"/g, '')
          .replace(/M-/g, '')
          .replace(/\^/g, '')
          .replace(/[^\x00-\x7F\u00A0-\uFFFF]/g, '');
        
        // Try to fix common JSON structure issues
        fileContent = fileContent.replace(/,(\s*[}\]])/g, '$1'); // Remove trailing commas
        
        inlTetumData = JSON.parse(fileContent);
        console.log(`INL Tetum dictionary loaded successfully with ${inlTetumData.length} entries`);
      } catch (parseError) {
        console.warn("INL Tetum dictionary parsing failed, attempting line-by-line recovery:", parseError);
        
        // Fallback: Try to extract valid JSON objects from the file
        try {
          const inlTetumPath = path.resolve(process.cwd(), "attached_assets", "inl_tt_dic.json");
          let fileContent = await fs.readFile(inlTetumPath, "utf-8");
          
          // Extract individual objects and reconstruct the array
          const objectMatches = fileContent.match(/\{[^{}]*"word"[^{}]*"class"[^{}]*"meaning"[^{}]*\}/g);
          if (objectMatches) {
            const cleanedObjects = objectMatches.map(obj => {
              // Clean each object individually
              const cleaned = obj
                .replace(/M-CM-/g, '')
                .replace(/M-bM-\^@M-\^Y/g, 'e')
                .replace(/M-CM-!/g, 'a')
                .replace(/M-CM-:/g, 'u')
                .replace(/M-CM-\)/g, 'e')
                .replace(/M-CM-1/g, 'n')
                .replace(/M-CM--/g, 'o')
                .replace(/M-CM-3/g, 'o')
                .replace(/[^\x00-\x7F\u00A0-\uFFFF]/g, '');
              
              try {
                return JSON.parse(cleaned);
              } catch {
                return null;
              }
            }).filter(obj => obj !== null);
            
            inlTetumData = cleanedObjects;
            console.log(`INL Tetum dictionary recovered ${inlTetumData.length} entries from corrupted file`);
          }
        } catch (recoveryError) {
          console.error("INL Tetum dictionary recovery failed:", recoveryError);
          inlTetumData = [];
        }
      }

      // Load LEGAL dictionaries - Portuguese/Tetum/English, Tetum Legal Glossary, and Portuguese Legal Glossary
      let legalDictData: any[] = [];
      let tetumGlossaryData: any[] = [];
      let portugueseGlossaryData: any[] = [];
      
      try {
        const legalDictPath = path.resolve(process.cwd(), "attached_assets", "legal dic tt.json");
        legalDictData = JSON.parse(await fs.readFile(legalDictPath, "utf-8"));
        console.log(`Legal dictionary loaded successfully with ${legalDictData.length} entries`);
      } catch (error) {
        console.warn("Legal dictionary not found:", error);
        legalDictData = [];
      }
      
      // Load Tetum Legal Glossary
      try {
        const tetumGlossaryPath = path.resolve(process.cwd(), "attached_assets", "legal tetum glossay.json");
        tetumGlossaryData = JSON.parse(await fs.readFile(tetumGlossaryPath, "utf-8"));
        console.log(`Tetum legal glossary loaded successfully with ${tetumGlossaryData.length} entries`);
      } catch (error) {
        console.warn("Tetum legal glossary not found:", error);
        tetumGlossaryData = [];
      }
      
      // Load Portuguese Legal Glossary
      try {
        const portugueseGlossaryPath = path.resolve(process.cwd(), "attached_assets", "glos juridico pt.json");
        portugueseGlossaryData = JSON.parse(await fs.readFile(portugueseGlossaryPath, "utf-8"));
        console.log(`Portuguese legal glossary loaded successfully with ${portugueseGlossaryData.length} entries`);
      } catch (error) {
        console.warn("Portuguese legal glossary not found:", error);
        portugueseGlossaryData = [];
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

      // Process Tetum Legal Glossary entries
      const tetumGlossaryEntries = tetumGlossaryData.map((item: any) => ({
        tetum: safeStringify(item.tetum_term),
        portuguese: "",
        english: "",
        source: safeStringify(item.source) || "Tetum Legal Glossary",
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

      // Process Portuguese Legal Glossary entries
      const portugueseGlossaryEntries = portugueseGlossaryData.map((item: any) => ({
        tetum: "",
        portuguese: safeStringify(item.termo),
        english: "",
        source: "Portuguese Legal Glossary",
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

      // Process medical dictionary entries (English-Tetum) - New comprehensive medical terms
      const medicalEnTtEntries = medicalEnTetumData.map((item: any) => ({
        english: safeStringify(item.english),
        tetum: safeStringify(item.tetum),
        portuguese: "",
        source: "Medical Technical Dictionary (EN-TT)",
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

      // Process medical dictionary entries (Tetum-English) - Bidirectional search capability
      const medicalTtEnEntries = medicalTetumEnData.map((item: any) => ({
        tetum: safeStringify(item.term),
        english: Array.isArray(item.translations) ? item.translations.join("; ") : safeStringify(item.translation),
        portuguese: "",
        source: "Medical Technical Dictionary (TT-EN)",
        category: "medical",
        dictionaryType: "medical",
        notes: item.usage ? `Usage: ${safeStringify(item.usage)}` : "",
        explanation: item.similar ? `Similar: ${Array.isArray(item.similar) ? item.similar.join("; ") : safeStringify(item.similar)}` : "",
        pronunciation: "",
        wordClass: "",
        etymology: "",
        usageExamples: item.synonyms ? (Array.isArray(item.synonyms) ? item.synonyms.map(safeStringify) : [safeStringify(item.synonyms)]) : [],
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





      // Bulk insert all entries with proper separation
      await storage.bulkCreateEntries([
        ...legalEntries,             // Legal module only
        ...tetumGlossaryEntries,     // Tetum Legal Glossary module only
        ...portugueseGlossaryEntries, // Portuguese Legal Glossary module only
        ...medicalEnTtEntries,       // Medical module - English to Tetum
        ...medicalTtEnEntries,       // Medical module - Tetum to English
        ...inlTetumEntries           // INL Tetum dictionary module
      ]);
      
      console.log(`Loaded ${legalEntries.length + tetumGlossaryEntries.length + portugueseGlossaryEntries.length + medicalEnTtEntries.length + medicalTtEnEntries.length + inlTetumEntries.length} dictionary entries`);
    } catch (error) {
      console.error("Error initializing dictionaries:", error);
    }
  }

  // Initialize dictionaries on startup
  await initializeDictionaries();

  // Generic search entries
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

  // Medical dictionary search
  app.get("/api/medical/search", async (req, res) => {
    try {
      const searchQuery = searchQuerySchema.parse(req.query);
      // Force medical dictionary type
      searchQuery.dictionaryType = "medical";
      const results = await storage.searchEntries(searchQuery);
      res.json(results);
    } catch (error) {
      console.error("Medical search error:", error);
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(400).json({ error: "Invalid search parameters" });
      }
    }
  });

  // Legal dictionary search
  app.get("/api/legal/search", async (req, res) => {
    try {
      const searchQuery = searchQuerySchema.parse(req.query);
      // Force legal dictionary types - include all legal variants
      const results = await storage.searchEntries(searchQuery);
      const legalResults = results.filter(entry => 
        entry.dictionaryType === "legal" || 
        entry.dictionaryType === "tetum-glossary" || 
        entry.dictionaryType === "portuguese-glossary"
      );
      res.json(legalResults);
    } catch (error) {
      console.error("Legal search error:", error);
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(400).json({ error: "Invalid search parameters" });
      }
    }
  });

  // Tetum Glossary search
  app.get("/api/tetum-glossary/search", async (req, res) => {
    try {
      const searchQuery = searchQuerySchema.parse(req.query);
      // Force tetum glossary dictionary type
      searchQuery.dictionaryType = "tetum-glossary";
      const results = await storage.searchEntries(searchQuery);
      res.json(results);
    } catch (error) {
      console.error("Tetum Glossary search error:", error);
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(400).json({ error: "Invalid search parameters" });
      }
    }
  });

  // Portuguese Glossary search
  app.get("/api/portuguese-glossary/search", async (req, res) => {
    try {
      const searchQuery = searchQuerySchema.parse(req.query);
      // Force portuguese glossary dictionary type
      searchQuery.dictionaryType = "portuguese-glossary";
      const results = await storage.searchEntries(searchQuery);
      res.json(results);
    } catch (error) {
      console.error("Portuguese Glossary search error:", error);
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(400).json({ error: "Invalid search parameters" });
      }
    }
  });

  // INL Tetum dictionary search
  app.get("/api/inl-tetum/search", async (req, res) => {
    try {
      const searchQuery = searchQuerySchema.parse(req.query);
      // Force INL Tetum dictionary type
      searchQuery.dictionaryType = "inl-tetum";
      const results = await storage.searchEntries(searchQuery);
      res.json(results);
    } catch (error) {
      console.error("INL Tetum search error:", error);
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(400).json({ error: "Invalid search parameters" });
      }
    }
  });

  // Tetum Monolingual dictionary search
  app.get("/api/tetum-monolingual/search", async (req, res) => {
    try {
      const searchQuery = searchQuerySchema.parse(req.query);
      // Force Tetum Monolingual dictionary type
      searchQuery.dictionaryType = "tetum-monolingual";
      const results = await storage.searchEntries(searchQuery);
      res.json(results);
    } catch (error) {
      console.error("Tetum Monolingual search error:", error);
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

  // Get entries by dictionary type
  app.get("/api/medical/entries", async (req, res) => {
    try {
      const entries = await storage.getAllEntries();
      const medicalEntries = entries.filter(entry => entry.dictionaryType === "medical");
      res.json(medicalEntries);
    } catch (error) {
      console.error("Get medical entries error:", error);
      res.status(500).json({ error: "Failed to fetch medical entries" });
    }
  });

  app.get("/api/legal/entries", async (req, res) => {
    try {
      const entries = await storage.getAllEntries();
      const legalEntries = entries.filter(entry => entry.dictionaryType === "legal");
      res.json(legalEntries);
    } catch (error) {
      console.error("Get legal entries error:", error);
      res.status(500).json({ error: "Failed to fetch legal entries" });
    }
  });

  app.get("/api/tetum-glossary/entries", async (req, res) => {
    try {
      const entries = await storage.getAllEntries();
      const tetumGlossaryEntries = entries.filter(entry => entry.dictionaryType === "tetum-glossary");
      res.json(tetumGlossaryEntries);
    } catch (error) {
      console.error("Get tetum glossary entries error:", error);
      res.status(500).json({ error: "Failed to fetch tetum glossary entries" });
    }
  });

  app.get("/api/portuguese-glossary/entries", async (req, res) => {
    try {
      const entries = await storage.getAllEntries();
      const portugueseGlossaryEntries = entries.filter(entry => entry.dictionaryType === "portuguese-glossary");
      res.json(portugueseGlossaryEntries);
    } catch (error) {
      console.error("Get portuguese glossary entries error:", error);
      res.status(500).json({ error: "Failed to fetch portuguese glossary entries" });
    }
  });

  app.get("/api/inl-tetum/entries", async (req, res) => {
    try {
      const entries = await storage.getAllEntries();
      const inlTetumEntries = entries.filter(entry => entry.dictionaryType === "inl-tetum");
      res.json(inlTetumEntries);
    } catch (error) {
      console.error("Get INL Tetum entries error:", error);
      res.status(500).json({ error: "Failed to fetch INL Tetum entries" });
    }
  });

  app.get("/api/tetum-monolingual/entries", async (req, res) => {
    try {
      const entries = await storage.getAllEntries();
      const tetumMonolingualEntries = entries.filter(entry => entry.dictionaryType === "tetum-monolingual");
      res.json(tetumMonolingualEntries);
    } catch (error) {
      console.error("Get tetum monolingual entries error:", error);
      res.status(500).json({ error: "Failed to fetch tetum monolingual entries" });
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
      const legalEntries = entries.filter(e => e.dictionaryType === "legal");
      res.json(legalEntries);
    } catch (error) {
      console.error("Legal entries error:", error);
      res.status(500).json({ error: "Failed to fetch legal entries" });
    }
  });

  // Tetum Legal Glossary module endpoints - Only Tetum legal glossary terms
  app.get("/api/tetum-glossary/search", async (req, res) => {
    try {
      const searchQuery = searchQuerySchema.parse(req.query);
      const allResults = await storage.searchEntries(searchQuery);
      const tetumGlossaryResults = allResults.filter(e => e.dictionaryType === "tetum-glossary");
      res.json(tetumGlossaryResults);
    } catch (error) {
      console.error("Tetum glossary search error:", error);
      res.status(400).json({ error: "Invalid search parameters" });
    }
  });

  app.get("/api/tetum-glossary/entries", async (req, res) => {
    try {
      const entries = await storage.getAllEntries();
      const tetumGlossaryEntries = entries.filter(e => e.dictionaryType === "tetum-glossary");
      res.json(tetumGlossaryEntries);
    } catch (error) {
      console.error("Tetum glossary entries error:", error);
      res.status(500).json({ error: "Failed to fetch Tetum glossary entries" });
    }
  });

  // Portuguese Legal Glossary module endpoints - Only Portuguese legal glossary terms
  app.get("/api/portuguese-glossary/search", async (req, res) => {
    try {
      const searchQuery = searchQuerySchema.parse(req.query);
      const allResults = await storage.searchEntries(searchQuery);
      const portugueseGlossaryResults = allResults.filter(e => e.dictionaryType === "portuguese-glossary");
      res.json(portugueseGlossaryResults);
    } catch (error) {
      console.error("Portuguese glossary search error:", error);
      res.status(400).json({ error: "Invalid search parameters" });
    }
  });

  app.get("/api/portuguese-glossary/entries", async (req, res) => {
    try {
      const entries = await storage.getAllEntries();
      const portugueseGlossaryEntries = entries.filter(e => e.dictionaryType === "portuguese-glossary");
      res.json(portugueseGlossaryEntries);
    } catch (error) {
      console.error("Portuguese glossary entries error:", error);
      res.status(500).json({ error: "Failed to fetch Portuguese glossary entries" });
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

  // INL Tetum Dictionary module endpoints - Only INL Tetum terms
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

  app.get("/api/inl-tetum/entries", async (req, res) => {
    try {
      const entries = await storage.getAllEntries();
      const inlTetumEntries = entries.filter(e => e.dictionaryType === "inl-tetum");
      res.json(inlTetumEntries);
    } catch (error) {
      console.error("INL Tetum entries error:", error);
      res.status(500).json({ error: "Failed to fetch INL Tetum entries" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

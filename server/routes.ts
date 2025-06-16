import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { searchQuerySchema, insertBookmarkSchema, insertSearchHistorySchema } from "@shared/schema";
import { translateMedicalTerm, generateMedicalVocabulary, MedicalTranslation } from "./openrouter";
import { validateQuery, validateBody, validateParams } from "./validation";
import fs from "fs/promises";
import path from "path";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Initialize dictionary data from JSON files
  async function initializeDictionaries() {
    try {
      
      // Load medical dictionaries
      const medicalDictEnTtPath = path.resolve(process.cwd(), "medical_dic_en-tt.json");
      const medicalDictTtEnPath = path.resolve(process.cwd(), "medical-dic_tt_en.json");
      
      // Parse medical dictionaries with error handling for complex JSON structure
      let medicalDictEnTtData = [];
      let medicalDictTtEnData = [];
      
      try {
        const enTtContent = await fs.readFile(medicalDictEnTtPath, "utf-8");
        
        // Fix malformed JSON - add missing opening bracket
        let fixedContent = enTtContent.trim();
        if (!fixedContent.startsWith('[')) {
          fixedContent = '[' + fixedContent;
        }
        if (!fixedContent.endsWith(']')) {
          fixedContent = fixedContent + ']';
        }
        
        // Clean the JSON content to handle any encoding or formatting issues
        const cleanContent = fixedContent
          .replace(/^\uFEFF/, '') // Remove BOM if present
          .replace(/[\x00-\x1F\x7F-\x9F]/g, '') // Remove control characters
          .replace(/,\s*}/g, '}') // Fix trailing commas in objects
          .replace(/,\s*]/g, ']'); // Fix trailing commas in arrays
        
        medicalDictEnTtData = JSON.parse(cleanContent);
        console.log(`Loaded ${medicalDictEnTtData.length} EN-TT medical entries`);
      } catch (error) {
        console.warn("Could not parse medical_dic_en-tt.json:", error);
        console.warn("Attempting manual object parsing...");
        
        try {
          const enTtContent = await fs.readFile(medicalDictEnTtPath, "utf-8");
          const entries = [];
          
          // Split content by object boundaries
          const objectMatches = enTtContent.match(/\{[^{}]*"english"[^{}]*"tetum"[^{}]*\}/g);
          
          if (objectMatches) {
            for (const match of objectMatches) {
              try {
                const parsed = JSON.parse(match);
                if (parsed.english && parsed.tetum) {
                  entries.push(parsed);
                }
              } catch (parseError) {
                continue;
              }
            }
            
            medicalDictEnTtData = entries;
            console.log(`Successfully parsed ${medicalDictEnTtData.length} EN-TT medical entries using regex method`);
          }
        } catch (altError) {
          console.warn("Manual parsing also failed:", altError);
          console.warn("Skipping medical EN-TT entries");
        }
      }
      
      try {
        medicalDictTtEnData = JSON.parse(await fs.readFile(medicalDictTtEnPath, "utf-8"));
        console.log(`Loaded ${medicalDictTtEnData.length} TT-EN medical entries`);
      } catch (error) {
        console.warn("Could not parse medical-dic_tt_en.json:", error);
        console.warn("Skipping medical TT-EN entries");
      }



      // Process medical dictionary entries (English to Tetum)
      const medicalEntriesEnTt = medicalDictEnTtData.map((item: any) => ({
        tetum: item.tetum || "",
        portuguese: "",
        english: item.english || "",
        source: "Medical Dictionary EN-TT",
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

      // Process medical dictionary entries (Tetum to English)
      const medicalEntriesTtEn = medicalDictTtEnData.map((item: any) => ({
        tetum: item.term || "",
        portuguese: "",
        english: item.translation || "",
        source: item.source || "Medical Dictionary TT-EN",
        category: "medical",
        dictionaryType: "medical",
        notes: item.usage || "",
        explanation: "",
        pronunciation: "",
        wordClass: "",
        etymology: "",
        usageExamples: [],
        relatedTerms: item.similar ? [item.similar] : [],
      }));

      const allMedicalEntries = [...medicalEntriesEnTt, ...medicalEntriesTtEn];

      // Bulk insert medical entries only
      await storage.bulkCreateEntries(allMedicalEntries);
      
      console.log(`Loaded ${allMedicalEntries.length} medical dictionary entries`);
      
      // Debug: Log first few entries to verify structure
      if (allMedicalEntries.length > 0) {
        console.log("Sample entry:", JSON.stringify(allMedicalEntries[0], null, 2));
      }
    } catch (error) {
      console.error("Error initializing dictionaries:", error);
    }
  }

  // Initialize dictionaries on startup
  await initializeDictionaries();

  // Search entries with validation and rate limiting
  app.get("/api/search", async (req, res) => {
    try {
      const searchQuery = searchQuerySchema.parse(req.query);
      console.log("Parsed search query:", searchQuery);
      
      const results = await storage.searchEntries(searchQuery);
      console.log(`Search returned ${results.length} results`);
      
      res.setHeader('Cache-Control', 'public, max-age=300'); // 5 minute cache
      res.json(results);
    } catch (error) {
      console.error("Search error:", error);
      
      if (error instanceof Error && error.name === 'ZodError') {
        return res.status(400).json({ 
          error: "Invalid search parameters", 
          details: "Please check your search query format",
          timestamp: new Date().toISOString()
        });
      }
      
      if (error instanceof Error && error.message.includes('storage')) {
        return res.status(503).json({ 
          error: "Search service temporarily unavailable",
          timestamp: new Date().toISOString()
        });
      }
      
      res.status(500).json({ 
        error: "Internal server error during search",
        timestamp: new Date().toISOString()
      });
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

  // AI-powered medical translation
  app.post("/api/translate", async (req, res) => {
    try {
      const { term, fromLanguage, toLanguage } = req.body;
      
      if (!term || !fromLanguage || !toLanguage) {
        return res.status(400).json({ error: "Missing required fields: term, fromLanguage, toLanguage" });
      }

      const translation = await translateMedicalTerm(term, fromLanguage, toLanguage);
      res.json(translation);
    } catch (error) {
      console.error("Translation error:", error);
      res.status(500).json({ error: "Failed to translate medical term" });
    }
  });

  // Generate medical vocabulary
  app.post("/api/vocabulary", async (req, res) => {
    try {
      const { category = "general", language = "english", count = 10 } = req.body;
      
      const vocabulary = await generateMedicalVocabulary(category, language, count);
      res.json(vocabulary);
    } catch (error) {
      console.error("Vocabulary generation error:", error);
      res.status(500).json({ error: "Failed to generate medical vocabulary" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

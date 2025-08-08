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
      // Load MEDICAL dictionary - Use the correct medical-dic_tt_en.json file
      const medicalTetumEnPath = path.resolve(process.cwd(), "attached_assets", "medical-dic_tt_en.json");
      
      let medicalTetumEnData = [];
      
      try {
        const fileContent = await fs.readFile(medicalTetumEnPath, "utf-8");
        medicalTetumEnData = JSON.parse(fileContent);
        console.log(`Medical Tetum-English dictionary loaded successfully with ${medicalTetumEnData.length} entries`);
      } catch (parseError) {
        console.warn("Medical dictionary loading failed:", parseError);
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

      // Process medical dictionary entries (removed - using only TT-EN file)
      const medicalEnTtEntries: any[] = [];

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

      // ASEAN Terminology entries (from abbreviations PDF)
      const aseanTerminologyData = [
        { abbr: "AADCP", full: "ASEAN-Australia Development Cooperation Programme" },
        { abbr: "AAECP", full: "ASEAN-Australia Economic Cooperation Programme" },
        { abbr: "AAF", full: "ASEAN Automotive Federation" },
        { abbr: "AAPSIP", full: "ASEAN-Australia Postharvest System Improvement Programme" },
        { abbr: "AATHP", full: "ASEAN Agreement on Transboundary Haze Pollution" },
        { abbr: "ABAC", full: "ASEAN Business Advisory Council" },
        { abbr: "ACB", full: "ASEAN Centre for Biodiversity" },
        { abbr: "ACBC", full: "ASEAN China Business Council" },
        { abbr: "ACBF", full: "ASEAN Central Bank Forum" },
        { abbr: "ACC", full: "ASEAN Coordinating Council" },
        { abbr: "ACCSQ", full: "ASEAN Consultative Committee on Standards and Quality" },
        { abbr: "ACCT", full: "ASEAN Convention on Counter-Terrorism" },
        { abbr: "ACDM", full: "ASEAN Committee on Disaster Management" },
        { abbr: "ACE", full: "ASEAN Centre for Energy" },
        { abbr: "ACECA", full: "ASEAN-Canada Economic Cooperation Agreement" },
        { abbr: "ACFTA", full: "ASEAN-China Free Trade Area" },
        { abbr: "ACMF", full: "ASEAN Capital Markets Forum" },
        { abbr: "ACP", full: "ASEAN Cooperation Plan" },
        { abbr: "ACTC", full: "ASEAN Center for Combating Transnational Crime" },
        { abbr: "ACW", full: "ASEAN Committee on Women" },
        { abbr: "ADB", full: "Asian Development Bank" },
        { abbr: "ADMM", full: "ASEAN Defence Ministers' Meeting" },
        { abbr: "AEC", full: "ASEAN Economic Community" },
        { abbr: "AEM", full: "ASEAN Economic Ministers' Meeting" },
        { abbr: "AF", full: "ASEAN Foundation" },
        { abbr: "AFAS", full: "ASEAN Framework Agreement on Services" },
        { abbr: "AFMM", full: "ASEAN Finance Ministers Meeting" },
        { abbr: "AFTA", full: "ASEAN Free Trade Area" },
        { abbr: "AHMM", full: "ASEAN Health Ministers Meeting" },
        { abbr: "AHTN", full: "ASEAN Harmonised Tariff Nomenclature" },
        { abbr: "AIA", full: "ASEAN Investment Area" },
        { abbr: "AICHR", full: "ASEAN Intergovernmental Commission on Human Rights" },
        { abbr: "AICO", full: "ASEAN Industrial Cooperation" },
        { abbr: "AIPO", full: "ASEAN Inter-Parliamentary Organization" },
        { abbr: "AJC", full: "ASEAN-Japan Centre" },
        { abbr: "AJCEP", full: "ASEAN-Japan Closer Economic Partnership" },
        { abbr: "AKFTA", full: "ASEAN-ROK Free Trade Area" },
        { abbr: "ALF", full: "ASEAN Leadership Forum" },
        { abbr: "AMAF", full: "ASEAN Ministers on Agriculture and Forestry" },
        { abbr: "AMM", full: "ASEAN Ministerial Meeting" },
        { abbr: "APEC", full: "Asia Pacific Economic Cooperation" },
        { abbr: "APG", full: "ASEAN Power Grid" },
        { abbr: "APSC", full: "ASEAN Political Security Community" },
        { abbr: "ARF", full: "ASEAN Regional Forum" },
        { abbr: "ASA", full: "ASEAN Swap Arrangement" },
        { abbr: "ASC", full: "ASEAN Security Community" },
        { abbr: "ASCC", full: "ASEAN Socio-Cultural Community" },
        { abbr: "ASEAN", full: "Association of Southeast Asian Nations" },
        { abbr: "ASEM", full: "ASEAN Europe Meeting" },
        { abbr: "ASPEN", full: "ASEAN Strategic Plan of Action on the Environment" },
        { abbr: "BIMP-EAGA", full: "Brunei Darussalam-Indonesia-Malaysia-Philippines East ASEAN Growth Area" },
        { abbr: "CBMs", full: "Confidence Building Measures" },
        { abbr: "CEPT", full: "Common Effective Preferential Tariff" },
        { abbr: "CER", full: "Closer Economic Relations" },
        { abbr: "CLMV", full: "Cambodia, Laos, Myanmar, VietNam" },
        { abbr: "CMI", full: "Chiang Mai Initiative" },
        { abbr: "COC", full: "Code of Conduct" },
        { abbr: "CPR", full: "The Committee of Permanent Representatives to ASEAN" },
        { abbr: "CTI", full: "Committee of Trade and Investment" },
        { abbr: "EAEC", full: "East Asia Economic Caucus" },
        { abbr: "TAC", full: "Treaty of Amity and Cooperation" },
        { abbr: "VAP", full: "Vientiane Action Programme" },
        { abbr: "WTO", full: "World Trade Organization" }
      ];

      const aseanEntries = aseanTerminologyData.map((item) => ({
        tetum: "", // Will be filled via OpenRouter API
        portuguese: "",
        english: item.full,
        source: "ASEAN Abbreviations List",
        category: "asean",
        dictionaryType: "asean",
        notes: `Abbreviation: ${item.abbr}`,
        explanation: item.full,
        pronunciation: "",
        wordClass: "abbreviation",
        etymology: "",
        usageExamples: [],
        relatedTerms: [],
      }));





      // Bulk insert all entries with proper separation
      await storage.bulkCreateEntries([
        ...legalEntries,             // Legal module only
        ...tetumGlossaryEntries,     // Tetum Legal Glossary module only
        ...portugueseGlossaryEntries, // Portuguese Legal Glossary module only
        ...medicalTtEnEntries,       // Medical module - Tetum to English
        ...inlTetumEntries,          // INL Tetum dictionary module
        ...aseanEntries              // ASEAN terminology module
      ]);
      
      console.log(`Loaded ${legalEntries.length + tetumGlossaryEntries.length + portugueseGlossaryEntries.length + medicalTtEnEntries.length + inlTetumEntries.length + aseanEntries.length} dictionary entries`);
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

  // ASEAN terminology search
  app.get("/api/asean/search", async (req, res) => {
    try {
      const searchQuery = searchQuerySchema.parse(req.query);
      // Force ASEAN dictionary type
      searchQuery.dictionaryType = "asean";
      const results = await storage.searchEntries(searchQuery);
      res.json(results);
    } catch (error) {
      console.error("ASEAN search error:", error);
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(400).json({ error: "Invalid search parameters" });
      }
    }
  });

  // ASEAN terminology translation using OpenRouter
  app.post("/api/asean/translate", async (req, res) => {
    try {
      const { text, fromLanguage, toLanguage } = req.body;
      
      if (!text || !fromLanguage || !toLanguage) {
        return res.status(400).json({ error: "Missing required parameters: text, fromLanguage, toLanguage" });
      }

      const openRouterApiKey = process.env.OPENROUTER_API_KEY;
      if (!openRouterApiKey) {
        return res.status(500).json({ error: "OpenRouter API key not configured" });
      }

      const languageMap: { [key: string]: string } = {
        'en': 'English',
        'tet': 'Tetum',
        'pt': 'Portuguese'
      };

      const fromLang = languageMap[fromLanguage] || fromLanguage;
      const toLang = languageMap[toLanguage] || toLanguage;

      const prompt = `Translate the following ${fromLang} text to ${toLang}. This is ASEAN terminology, so maintain professional accuracy and context:

"${text}"

Provide only the translation without additional explanation.`;

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openRouterApiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://liantek.replit.app',
          'X-Title': 'LianTek ASEAN Terminology'
        },
        body: JSON.stringify({
          model: 'anthropic/claude-3.5-sonnet',
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 150,
          temperature: 0.3
        })
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('OpenRouter API error:', errorData);
        return res.status(500).json({ error: 'Translation service unavailable' });
      }

      const data = await response.json();
      const translation = data.choices?.[0]?.message?.content?.trim() || '';

      res.json({ translation });
    } catch (error) {
      console.error("ASEAN translation error:", error);
      res.status(500).json({ error: "Translation failed" });
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

  app.get("/api/asean/entries", async (req, res) => {
    try {
      const entries = await storage.getAllEntries();
      const aseanEntries = entries.filter(entry => entry.dictionaryType === "asean");
      res.json(aseanEntries);
    } catch (error) {
      console.error("Get ASEAN entries error:", error);
      res.status(500).json({ error: "Failed to fetch ASEAN entries" });
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

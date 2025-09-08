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

  // Parse INL Tetum meaning field to extract definition, synonyms, notes, and examples
  function parseINLMeaning(meaning: string): {
    definition: string;
    synonyms: string[];
    notes: string;
    examples: string[];
  } {
    let definition = meaning;
    let synonyms: string[] = [];
    let notes = "";
    let examples: string[] = [];

    // Extract synonyms (Sin.) - improved regex to handle sentence ending
    const synRegex = /Sin\.\s+([^.]+)\.?/g;
    let synMatch;
    while ((synMatch = synRegex.exec(meaning)) !== null) {
      const synPart = synMatch[1].trim();
      if (synPart) {
        synonyms.push(...synPart.split(/[,;]/).map(s => s.trim()).filter(s => s.length > 0));
        definition = definition.replace(synMatch[0], '').trim();
      }
    }

    // Extract notes (Nota:) - improved regex to capture until end or next marker
    const noteRegex = /Nota:\s+(.+?)(?=\s+(?:Sin\.|Ez\.|$))/g;
    let noteMatch;
    while ((noteMatch = noteRegex.exec(meaning)) !== null) {
      const notePart = noteMatch[1].trim();
      if (notePart) {
        notes += (notes ? '; ' : '') + notePart;
        definition = definition.replace(noteMatch[0], '').trim();
      }
    }

    // Handle notes that go to the end of the string
    const noteEndRegex = /Nota:\s+(.+)$/g;
    let noteEndMatch;
    while ((noteEndMatch = noteEndRegex.exec(meaning)) !== null) {
      const notePart = noteEndMatch[1].trim();
      if (notePart && !notes.includes(notePart)) {
        notes += (notes ? '; ' : '') + notePart;
        definition = definition.replace(noteEndMatch[0], '').trim();
      }
    }

    // Extract examples (Ez.)
    const exRegex = /Ez\.\s+([^.]+)\.?/g;
    let exMatch;
    while ((exMatch = exRegex.exec(meaning)) !== null) {
      const exPart = exMatch[1].trim();
      if (exPart) {
        examples.push(exPart);
        definition = definition.replace(exMatch[0], '').trim();
      }
    }

    // Clean up the definition - remove any remaining patterns and extra spaces
    definition = definition
      .replace(/\s*Sin\.\s*.*$/g, '')
      .replace(/\s*Nota:\s*.*$/g, '')
      .replace(/\s*Ez\.\s*.*$/g, '')
      .replace(/\s+/g, ' ')
      .replace(/\s*\.\s*$/, '.')
      .trim();

    return {
      definition,
      synonyms,
      notes,
      examples
    };
  }

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
      
      // Load INL Tetum dictionary from the new JSON file with improved error handling
      let inlTetumData: any[] = [];
      try {
        const inlTetumPath = path.resolve(process.cwd(), "attached_assets", "inl_tt_dic.json");
        let fileContent = await fs.readFile(inlTetumPath, "utf-8");
        
        // First attempt: Parse the file as-is
        try {
          inlTetumData = JSON.parse(fileContent);
          console.log(`INL Tetum dictionary loaded successfully with ${inlTetumData.length} entries`);
        } catch (directParseError: any) {
          console.warn("Direct parsing failed, trying with cleanup:", directParseError.message);
          
          // Clean up encoding issues and malformed JSON
          fileContent = fileContent
            // Remove byte order mark and encoding issues
            .replace(/^\uFEFF/, '')
            // Remove problematic characters
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
            // Fix common JSON formatting issues
            .replace(/,(\s*[}\]])/g, '$1') // Remove trailing commas
            .replace(/\n\s*\n/g, '\n') // Remove empty lines
            .trim();
          
          try {
            inlTetumData = JSON.parse(fileContent);
            console.log(`INL Tetum dictionary loaded with cleanup: ${inlTetumData.length} entries`);
          } catch (cleanupParseError: any) {
            console.warn("Cleanup parsing failed, attempting advanced recovery:", cleanupParseError.message);
            throw cleanupParseError; // Let the main catch block handle advanced recovery
          }
        }
      } catch (parseError) {
        console.warn("INL Tetum dictionary parsing failed, attempting line-by-line recovery:", parseError);
        
        // Advanced Recovery: Extract objects one by one with better pattern matching
        try {
          const inlTetumPath = path.resolve(process.cwd(), "attached_assets", "inl_tt_dic.json");
          let fileContent = await fs.readFile(inlTetumPath, "utf-8");
          
          // Enhanced single pattern to capture more entries
          const objectMatches = fileContent.match(/\{[\s\S]*?"word"[\s\S]*?"class"[\s\S]*?"meaning"[\s\S]*?\}/g);
          if (objectMatches) {
            const cleanedObjects = [];
            
            for (let i = 0; i < objectMatches.length; i++) {
              const obj = objectMatches[i];
              try {
                // Clean each object more carefully
                let cleaned = obj
                  .replace(/M-CM-/g, '')
                  .replace(/M-bM-\^@M-\^Y/g, 'e')
                  .replace(/M-CM-!/g, 'a')
                  .replace(/M-CM-:/g, 'u')
                  .replace(/M-CM-\)/g, 'e')
                  .replace(/M-CM-1/g, 'n')
                  .replace(/M-CM--/g, 'o')
                  .replace(/M-CM-3/g, 'o')
                  .replace(/[^\x00-\x7F\u00A0-\uFFFF]/g, '');
                
                const parsed = JSON.parse(cleaned);
                if (parsed && parsed.word && parsed.meaning) {
                  cleanedObjects.push(parsed);
                }
              } catch (objError: any) {
                // Skip malformed objects but log for debugging
                if (i < 10) { // Only log first few errors to avoid spam
                  console.warn(`Skipping malformed object at index ${i}:`, objError.message);
                }
              }
            }
            
            inlTetumData = cleanedObjects;
            console.log(`INL Tetum dictionary recovered ${inlTetumData.length} entries from corrupted file`);
          } else {
            console.error("No valid JSON objects found in INL Tetum dictionary file");
            inlTetumData = [];
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

      // Process INL Tetum dictionary entries with enhanced data validation
      const inlTetumEntries = inlTetumData
        .filter((item: any) => {
          // More robust filtering to ensure data quality
          return item && 
                 item.word && 
                 typeof item.word === 'string' && 
                 item.word.trim().length > 0 &&
                 item.meaning && 
                 typeof item.meaning === 'string' && 
                 item.meaning.trim().length > 0;
        })
        .map((item: any) => {
          // Clean and normalize the word entry
          const cleanWord = safeStringify(item.word).replace(/,$/, '').trim(); // Remove trailing comma
          const cleanMeaning = safeStringify(item.meaning).trim();
          const cleanClass = item.class ? safeStringify(item.class).trim() : "";
          
          // Parse the meaning field to extract definition, synonyms, notes, and examples
          const parsedMeaning = parseINLMeaning(cleanMeaning);
          
          // Combine word class with any parsed notes
          const allNotes = [
            cleanClass ? `Word class: ${cleanClass}` : "",
            parsedMeaning.notes || ""
          ].filter(n => n.trim().length > 0).join('; ');
          
          return {
            tetum: cleanWord,
            portuguese: "",
            english: "",
            source: "INL Tetum Dictionary",
            category: "inl-tetum",
            dictionaryType: "inl-tetum",
            notes: allNotes,
            explanation: parsedMeaning.definition,
            pronunciation: "",
            wordClass: cleanClass,
            etymology: "",
            usageExamples: parsedMeaning.examples,
            relatedTerms: parsedMeaning.synonyms,
          };
        });

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

      // Load comprehensive ASEAN terminology data from new glossary file
      let aseanTerminologyData: any[] = [];
      let aseanEntries: any[] = [];
      
      try {
        const aseanCompletePath = path.resolve(process.cwd(), 'extracted_asean_complete.json');
        const aseanCompleteData = await fs.readFile(aseanCompletePath, 'utf8');
        aseanTerminologyData = JSON.parse(aseanCompleteData);
        
        aseanEntries = aseanTerminologyData.map((item: any, index: number) => {
          // Handle both old format (abbreviations) and new format (terminology)
          if (item.type === "terminology") {
            // New format: direct English-Tetum terminology
            return {
              tetum: item.tetum || "",
              portuguese: item.portuguese || "",
              english: item.english || "",
              source: item.source || "ASEAN Terminology Collection",
              category: "asean",
              dictionaryType: "asean",
              notes: item.word_class ? `${item.word_class.english} (${item.word_class.tetum})` : "",
              explanation: item.english || "",
              pronunciation: "",
              wordClass: item.word_class?.english || "term",
              etymology: "",
              usageExamples: [],
              relatedTerms: [],
            };
          } else {
            // Original format: abbreviations with translations
            return {
              tetum: item.full_form_Tetum || item.abbreviation_EN,
              portuguese: item.full_form_Portuguese || "",
              english: `${item.abbreviation_EN}: ${item.full_form}`,
              source: "ASEAN Abbreviations List with authentic translations",
              category: "asean",
              dictionaryType: "asean",
              notes: item.full_form_Tetum ? `Tetum: ${item.full_form_Tetum}` : `Abbreviation: ${item.abbreviation_EN}`,
              explanation: item.full_form,
              pronunciation: "",
              wordClass: "abbreviation",
              etymology: "",
              usageExamples: [`${item.abbreviation_EN}: ${item.full_form}`],
              relatedTerms: [],
            };
          }
        });
        
        console.log(`ASEAN comprehensive glossary loaded successfully with ${aseanEntries.length} entries from authentic ASEAN-Abbreviations-List.pdf`);
      } catch (error) {
        console.error('Error loading ASEAN comprehensive glossary:', error);
        // Load from the previous extracted data as fallback
        try {
          const aseanJsonPath = path.resolve(process.cwd(), 'extracted_asean_data.json');
          const aseanJsonData = await fs.readFile(aseanJsonPath, 'utf8');
          aseanTerminologyData = JSON.parse(aseanJsonData);
          
          aseanEntries = aseanTerminologyData.map((item: any, index: number) => ({
            tetum: "", // Will be filled via AI translation when requested
            portuguese: "", // Will be filled via AI translation when requested
            english: item.fullForm,
            source: "ASEAN Abbreviations List - Comprehensive A-Z",
            category: item.category || "asean",
            dictionaryType: "asean",
            notes: `Abbreviation: ${item.abbreviation} | Type: ${item.type} | Category: ${item.category}`,
            explanation: item.fullForm,
            pronunciation: "",
            wordClass: "abbreviation",
            etymology: "",
            usageExamples: [],
            relatedTerms: [],
          }));
          
          console.log(`ASEAN terminology loaded successfully with ${aseanEntries.length} entries from A-Z list (fallback)`);
        } catch (fallbackError) {
          console.error('Error loading fallback ASEAN data:', fallbackError);
          // Final fallback with basic ASEAN data
          aseanTerminologyData = [
            { abbr: "ASEAN", full: "Association of Southeast Asian Nations" }
          ];
          aseanEntries = aseanTerminologyData.map((item: any) => ({
            tetum: "",
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
        }
      }





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

  // ASEAN terminology translation using Google Translate API (primary) with OpenRouter fallback
  app.post("/api/asean/translate", async (req, res) => {
    try {
      const { text, fromLanguage, toLanguage } = req.body;
      
      if (!text || !fromLanguage || !toLanguage) {
        return res.status(400).json({ error: "Missing required parameters: text, fromLanguage, toLanguage" });
      }

      let translation = text;
      let translationMethod = "fallback";

      // Try Google Translate API first
      try {
        const googleApiKey = process.env.GOOGLE_API_KEY;
        if (googleApiKey) {
          const googleUrl = `https://translation.googleapis.com/language/translate/v2?key=${googleApiKey}`;
          
          const googleResponse = await fetch(googleUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              q: text,
              target: toLanguage,
              source: fromLanguage,
              format: 'text'
            })
          });

          if (googleResponse.ok) {
            const googleData = await googleResponse.json();
            translation = googleData.data.translations[0].translatedText;
            translationMethod = "Google Translate API";
          }
        }
      } catch (googleError) {
        console.warn("Google Translate API failed, falling back to OpenRouter:", googleError);
      }

      // Fallback to OpenRouter if Google Translate failed
      if (translationMethod === "fallback") {
        try {
          const openRouterApiKey = process.env.OPENROUTER_API_KEY;
          if (openRouterApiKey) {
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

            if (response.ok) {
              const data = await response.json();
              translation = data.choices?.[0]?.message?.content?.trim() || text;
              translationMethod = "OpenRouter AI";
            }
          }
        } catch (openRouterError) {
          console.error("OpenRouter translation also failed:", openRouterError);
        }
      }

      res.json({ 
        translation,
        method: translationMethod
      });
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

  // Enhanced term explanation endpoint
  app.get("/api/enhanced-explanation/:term", async (req, res) => {
    try {
      const { term } = req.params;
      const { sourceLanguage = "english" } = req.query;
      
      const { getEnhancedTermExplanation } = await import("./gemini");
      const explanation = await getEnhancedTermExplanation(
        term, 
        sourceLanguage as "tetum" | "portuguese" | "english"
      );
      
      res.json(explanation);
    } catch (error) {
      console.error("Enhanced explanation error:", error);
      res.status(500).json({ 
        error: "Failed to fetch enhanced explanation",
        fallback: true 
      });
    }
  });

  // Etymology search endpoint
  app.get("/api/etymology/search", async (req, res) => {
    try {
      const { word } = req.query;
      
      if (!word || typeof word !== 'string') {
        return res.status(400).json({ error: "Word parameter is required" });
      }

      if (!process.env.OPENROUTER_API_KEY) {
        return res.status(500).json({ 
          error: "OpenRouter API key not configured. Etymology research requires API access."
        });
      }

      // Get INL Tetum dictionary entries for spelling reference
      const allEntries = await storage.getAllEntries();
      const inlEntries = allEntries.filter(e => e.dictionaryType === "inl-tetum");
      
      // Find exact match or similar entries for spelling reference
      const exactMatch = inlEntries.find(e => 
        e.tetum?.toLowerCase() === word.trim().toLowerCase()
      );
      
      const similarEntries = inlEntries.filter(e => 
        e.tetum?.toLowerCase().includes(word.trim().toLowerCase()) ||
        word.trim().toLowerCase().includes(e.tetum?.toLowerCase() || '')
      ).slice(0, 5); // Limit to 5 similar entries

      let spellingContext = "";
      if (exactMatch) {
        spellingContext = `\n\nIMPORTANT: The official INL spelling is "${exactMatch.tetum}". Use this exact spelling throughout your response.`;
        if (exactMatch.explanation) {
          spellingContext += ` INL definition: "${exactMatch.explanation}"`;
        }
      } else if (similarEntries.length > 0) {
        const similarWords = similarEntries.map(e => e.tetum).join(", ");
        spellingContext = `\n\nNote: Similar words in INL dictionary: ${similarWords}. Ensure spelling follows INL standards.`;
      }

      const prompt = `Analyze the etymology of the Tetum word "${word.trim()}" following INL (Instituto Nacional de Linguística) spelling standards. Provide concise information about:
1. Word origin and etymology
2. Historical forms (if known)  
3. Meaning evolution
4. Related words (use INL spelling)
5. Language influences (Portuguese, Malay, indigenous)
6. Tetum expressions and compound words using this word

TETUM EXPRESSIONS: ONLY include expressions that you can verify exist in authentic Tetum sources or official documentation. DO NOT invent or create new expressions. If you cannot find verified, documented expressions using "${word.trim()}", leave the expressions array empty. Only include expressions that are documented in:
- Official INL (Instituto Nacional de Linguística) materials
- Published Tetum dictionaries or linguistic studies  
- Verified Tetum language resources
- Academic linguistic publications about Tetum

STRICT REQUIREMENT: Every expression must be authentic and verifiable. If unsure about authenticity, exclude it.

SPELLING STANDARDS: Follow the official INL Tetum dictionary spelling conventions. Use proper Tetum orthography as established by the Instituto Nacional de Linguística.${spellingContext}

Respond in this exact JSON format:
{
  "word": "${exactMatch ? exactMatch.tetum : word.trim()}",
  "language": "Tetum",
  "etymology": "concise etymology explanation using INL spelling standards",
  "historical_forms": ["form1", "form2"],
  "meaning_evolution": "brief meaning evolution",
  "related_words": ["word1", "word2"],
  "expressions": [
    {"expression": "compound1", "meaning": "meaning of compound1"},
    {"expression": "compound2", "meaning": "meaning of compound2"}
  ],
  "source": "AI Etymology Research via OpenRouter (INL spelling standards)"
}`;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://replit.com",
          "X-Title": "Tetum Etymology Dictionary"
        },
        body: JSON.stringify({
          model: "anthropic/claude-3-haiku", // Faster model for quicker responses
          messages: [
            {
              role: "system",
              content: "You are a Tetum linguistics expert. Provide concise, accurate etymology information in valid JSON format only. Always include the expressions field with Tetum compound words."
            },
            {
              role: "user", 
              content: prompt
            }
          ],
          max_tokens: 1200, // Increased to ensure expressions are included
          temperature: 0.2
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`OpenRouter API request failed: ${response.status} ${response.statusText}`);
      }

      const apiResult = await response.json();
      
      if (!apiResult?.choices?.[0]?.message?.content) {
        throw new Error("Invalid API response structure");
      }

      let result;
      const content = apiResult.choices[0].message.content.trim();
      
      try {
        // Try to extract JSON from response
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          result = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error("No JSON found in response");
        }
      } catch (parseError) {
        // Quick fallback for parsing errors
        result = {
          word: word.trim(),
          language: "Tetum",
          etymology: content.substring(0, 300) + "...", // Truncate long responses
          historical_forms: [],
          meaning_evolution: "Detailed analysis available in etymology section",
          related_words: [],
          expressions: [], // Ensure expressions field is always present
          source: "AI Etymology Research via OpenRouter"
        };
      }
      
      // Ensure all required fields are present
      const etymologyResult = {
        word: result.word || word.trim(),
        language: result.language || "Tetum",
        etymology: result.etymology || "Etymology information not available",
        historical_forms: Array.isArray(result.historical_forms) ? result.historical_forms : [],
        meaning_evolution: result.meaning_evolution || "Meaning evolution information not available",
        related_words: Array.isArray(result.related_words) ? result.related_words : [],
        expressions: Array.isArray(result.expressions) ? result.expressions : [],
        source: result.source || "AI Etymology Research via OpenRouter"
      };

      res.json(etymologyResult);
    } catch (error) {
      console.error("Etymology search error:", error);
      res.status(500).json({ 
        error: "Failed to research etymology. Please try again.",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

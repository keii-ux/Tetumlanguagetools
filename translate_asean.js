import { promises as fs } from 'fs';

// Simple translation function using Google Translate REST API
async function translateText(text, targetLang = 'tet') {
  try {
    const apiKey = process.env.GOOGLE_API_KEY;
    const url = `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: text,
        target: targetLang,
        format: 'text'
      })
    });
    
    if (!response.ok) {
      throw new Error(`Translation API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.data.translations[0].translatedText;
  } catch (error) {
    console.error('Translation error for:', text, error);
    return text; // Return original if translation fails
  }
}



async function translateAseanGlossary() {
  try {
    console.log('Loading ASEAN glossary data...');
    const data = await fs.readFile('clean_asean_glossary.json', 'utf8');
    const glossary = JSON.parse(data);
    
    console.log(`Found ${glossary.length} ASEAN entries to translate`);
    
    const translatedGlossary = [];
    
    // Process in batches to avoid rate limits
    const BATCH_SIZE = 10;
    
    for (let i = 0; i < glossary.length; i += BATCH_SIZE) {
      const batch = glossary.slice(i, i + BATCH_SIZE);
      console.log(`Processing batch ${Math.floor(i/BATCH_SIZE) + 1}/${Math.ceil(glossary.length/BATCH_SIZE)}`);
      
      const translatedBatch = await Promise.all(
        batch.map(async (entry) => {
          // Translate both abbreviation and full form to Tetum
          const abbreviationTetum = await translateText(entry.abbreviation_EN, 'tet');
          const fullFormTetum = await translateText(entry.full_form, 'tet');
          
          return {
            ...entry,
            abbreviation_Tetum: abbreviationTetum,
            full_form_Tetum: fullFormTetum,
            source: "Excerpts from \"ASEAN-Abbreviations-List.pdf\" with Google Translate Tetum translations"
          };
        })
      );
      
      translatedGlossary.push(...translatedBatch);
      
      // Add delay to respect rate limits
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // Save the translated glossary
    await fs.writeFile('extracted_asean_complete.json', JSON.stringify(translatedGlossary, null, 2));
    
    console.log(`Successfully translated ${translatedGlossary.length} ASEAN entries with Tetum translations`);
    console.log('Saved to extracted_asean_complete.json');
    
    return translatedGlossary;
    
  } catch (error) {
    console.error('Error processing ASEAN glossary:', error);
    throw error;
  }
}

// Run the translation
translateAseanGlossary()
  .then(() => {
    console.log('ASEAN glossary translation completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Translation failed:', error);
    process.exit(1);
  });
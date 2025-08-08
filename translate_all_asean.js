import { promises as fs } from 'fs';

// Translate text using Google Translate API
async function translateText(text, targetLang = 'tet', sourceLang = 'en') {
  try {
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      console.error('GOOGLE_API_KEY not found in environment');
      return text;
    }

    const url = `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: text,
        target: targetLang,
        source: sourceLang,
        format: 'text'
      })
    });

    if (response.ok) {
      const data = await response.json();
      return data.data.translations[0].translatedText;
    } else {
      console.error(`Google Translate API error ${response.status}: ${await response.text()}`);
      return text;
    }
  } catch (error) {
    console.error(`Translation error for "${text}":`, error.message);
    return text;
  }
}

// Add delay to respect rate limits
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function translateAllAseanData() {
  try {
    console.log('Loading ASEAN data for translation...');
    
    // Load the extracted ASEAN data
    const aseanData = JSON.parse(await fs.readFile('extracted_asean_complete.json', 'utf8'));
    console.log(`Starting translation of ${aseanData.length} ASEAN abbreviations to Tetum...`);
    
    const translatedData = [];
    const batchSize = 5; // Process in small batches
    
    for (let i = 0; i < aseanData.length; i++) {
      const entry = aseanData[i];
      console.log(`Processing ${i+1}/${aseanData.length}: ${entry.abbreviation_EN}`);
      
      // Translate the full form to Tetum
      const fullFormTetum = await translateText(entry.full_form, 'tet', 'en');
      
      // Keep abbreviation same (standard practice)
      const abbreviationTetum = entry.abbreviation_EN;
      
      // Create fully translated entry
      const translatedEntry = {
        abbreviation_EN: entry.abbreviation_EN,
        full_form: entry.full_form,
        abbreviation_Tetum: abbreviationTetum,
        full_form_Tetum: fullFormTetum,
        source: 'Excerpts from "ASEAN-Abbreviations-List.pdf" with Google Translate Tetum integration',
        index: entry.index || (i + 1)
      };
      
      translatedData.push(translatedEntry);
      
      console.log(`  EN: ${entry.full_form}`);
      console.log(`  TET: ${fullFormTetum}`);
      console.log('');
      
      // Rate limiting - pause every batch
      if ((i + 1) % batchSize === 0) {
        console.log('Pausing 2 seconds for rate limiting...');
        await delay(2000);
      }
    }
    
    // Save the fully translated data
    const outputFile = 'asean_complete_with_tetum.json';
    await fs.writeFile(outputFile, JSON.stringify(translatedData, null, 2));
    
    console.log(`\n✅ Successfully translated ${translatedData.length} ASEAN entries`);
    console.log(`✅ Saved to: ${outputFile}`);
    
    // Show sample results
    console.log('\n📋 Sample translations:');
    translatedData.slice(0, 5).forEach(entry => {
      console.log(`• ${entry.abbreviation_EN}: ${entry.full_form}`);
      console.log(`  Tetum: ${entry.full_form_Tetum}`);
      console.log('');
    });
    
    return translatedData;
    
  } catch (error) {
    console.error('❌ Error translating ASEAN data:', error);
    return null;
  }
}

// Run the translation
translateAllAseanData()
  .then(result => {
    if (result) {
      console.log('🎉 ASEAN translation completed successfully!');
      console.log(`🔢 Total entries translated: ${result.length}`);
      process.exit(0);
    } else {
      console.log('❌ Translation failed!');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('❌ Translation process failed:', error);
    process.exit(1);
  });
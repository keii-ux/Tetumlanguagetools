import { promises as fs } from 'fs';
import path from 'path';

// Key ASEAN terms that need proper translation
const keyTermsToCorrect = [
  "Association of Southeast Asian Nations",
  "ASEAN Free Trade Area", 
  "ASEAN Economic Community",
  "ASEAN Political-Security Community", 
  "ASEAN Socio-Cultural Community",
  "ASEAN Regional Forum",
  "ASEAN Plus Three",
  "East Asia Summit",
  "Treaty of Amity and Cooperation",
  "ASEAN Charter",
  "ASEAN Secretariat", 
  "ASEAN Summit",
  "ASEAN Community",
  "Development Cooperation Programme",
  "Regional Partnership Scheme",
  "Economic Cooperation Programme",
  "Trade Facilitation",
  "Investment Promotion", 
  "Technical Cooperation",
  "Capacity Building"
];

async function translateText(text, fromLanguage, toLanguage) {
  try {
    const response = await fetch('http://localhost:5000/api/asean/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: text,
        fromLanguage: fromLanguage,
        toLanguage: toLanguage
      })
    });
    
    if (response.ok) {
      const data = await response.json();
      return {
        translation: data.translation,
        method: data.method || 'API'
      };
    } else {
      console.error(`Translation failed for "${text}":`, response.status);
      return { translation: text, method: 'failed' };
    }
  } catch (error) {
    console.error(`Error translating "${text}":`, error.message);
    return { translation: text, method: 'error' };
  }
}

async function analyzeCurrentData() {
  try {
    console.log('🔍 Reading current ASEAN data...');
    const data = await fs.readFile('extracted_asean_complete.json', 'utf8');
    const entries = JSON.parse(data);
    
    console.log(`📊 Found ${entries.length} ASEAN entries`);
    
    // Find entries with problematic translations
    const problematic = entries.filter(entry => {
      const tetum = entry.full_form_Tetum || entry.tetum || '';
      return tetum.includes('Programaa') || 
             tetum.includes('Coordihaatihag') || 
             tetum.includes('Kooperasaun Programaa') ||
             tetum.length === 0;
    });
    
    console.log(`🔧 Found ${problematic.length} entries with translation issues`);
    
    return { entries, problematic };
  } catch (error) {
    console.error('Error reading ASEAN data:', error);
    return { entries: [], problematic: [] };
  }
}

async function correctTranslations() {
  console.log('🌏 ASEAN Terminology Translation Correction');
  console.log('Using Google Translate API via existing backend');
  console.log('='.repeat(60));
  
  const correctedTerms = [];
  
  console.log('\n📝 Translating key ASEAN terms...\n');
  
  for (let i = 0; i < keyTermsToCorrect.length; i++) {
    const term = keyTermsToCorrect[i];
    console.log(`${i + 1}. Translating: "${term}"`);
    
    // Small delay to avoid overwhelming the API
    if (i > 0) await new Promise(resolve => setTimeout(resolve, 500));
    
    try {
      // Get Tetum translation
      const tetumResult = await translateText(term, 'en', 'tet');
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Get Portuguese translation  
      const portugueseResult = await translateText(term, 'en', 'pt');
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const correction = {
        english: term,
        tetum: tetumResult.translation,
        portuguese: portugueseResult.translation,
        tetum_method: tetumResult.method,
        portuguese_method: portugueseResult.method,
        timestamp: new Date().toISOString()
      };
      
      correctedTerms.push(correction);
      
      console.log(`   🇹🇱 Tetum: ${tetumResult.translation} (${tetumResult.method})`);
      console.log(`   🇵🇹 Portuguese: ${portugueseResult.translation} (${portugueseResult.method})`);
      console.log('');
      
    } catch (error) {
      console.error(`   ❌ Failed to translate "${term}":`, error.message);
    }
  }
  
  return correctedTerms;
}

async function saveCorrections(corrections) {
  const outputFile = 'asean_translation_corrections.json';
  
  const output = {
    corrected_translations: corrections,
    analysis: {
      total_terms_corrected: corrections.length,
      timestamp: new Date().toISOString(),
      method: 'Google Translate API via Node.js backend',
      api_endpoint_used: '/api/asean/translate'
    },
    common_issues_found: [
      'Programaa → should be Programa',
      'Coordihaatihag → should be Koordinasaun',
      'Inconsistent terminology',
      'Missing translations'
    ],
    recommendations: [
      'Update extracted_asean_complete.json with corrected translations',
      'Apply corrections to database entries', 
      'Validate translations with Tetum language experts',
      'Implement consistent terminology standards'
    ]
  };
  
  try {
    await fs.writeFile(outputFile, JSON.stringify(output, null, 2), 'utf8');
    console.log(`\n💾 Corrections saved to: ${outputFile}`);
    return outputFile;
  } catch (error) {
    console.error('Error saving corrections:', error);
    return null;
  }
}

async function main() {
  try {
    // Analyze current data
    const { entries, problematic } = await analyzeCurrentData();
    
    console.log(`\n🔍 Analysis Results:`);
    console.log(`   • Total entries: ${entries.length}`);
    console.log(`   • Problematic entries: ${problematic.length}`);
    
    // Get corrected translations
    const corrections = await correctTranslations();
    
    // Save results
    const outputFile = await saveCorrections(corrections);
    
    if (outputFile) {
      console.log('\n✅ Translation correction completed!');
      console.log(`📈 Statistics:`);
      console.log(`   • Terms corrected: ${corrections.length}`);
      console.log(`   • Google API success rate: ${corrections.filter(c => c.tetum_method === 'Google Translate API').length}/${corrections.length}`);
      
      console.log(`\n📋 Next steps:`);
      console.log(`   1. Review corrections in ${outputFile}`);
      console.log(`   2. Apply corrections to main data files`);
      console.log(`   3. Update database with corrected translations`);
      console.log(`   4. Test ASEAN module with new translations`);
    }
    
  } catch (error) {
    console.error('❌ Error in main execution:', error);
  }
}

// Run the correction process
main().catch(console.error);
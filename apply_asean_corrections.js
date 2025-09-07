import { promises as fs } from 'fs';

async function applyCorrections() {
  console.log('🔧 Applying ASEAN Translation Corrections...');
  
  try {
    // Read current data
    const data = await fs.readFile('extracted_asean_complete.json', 'utf8');
    const entries = JSON.parse(data);
    
    console.log(`📊 Processing ${entries.length} entries...`);
    
    let correctionCount = 0;
    const corrections = [];
    
    // Apply critical corrections
    const updatedEntries = entries.map(entry => {
      let updated = { ...entry };
      let hasChanges = false;
      
      // Fix "Programaa" → "Programa"
      if (updated.full_form_Tetum && updated.full_form_Tetum.includes('Programaa')) {
        const oldValue = updated.full_form_Tetum;
        updated.full_form_Tetum = updated.full_form_Tetum.replace(/Programaa/g, 'Programa');
        corrections.push({
          type: 'Tetum spelling correction',
          old: oldValue,
          new: updated.full_form_Tetum,
          entry: entry.abbreviation_EN || entry.english
        });
        hasChanges = true;
      }
      
      if (updated.full_form_Portuguese && updated.full_form_Portuguese.includes('Programaa')) {
        const oldValue = updated.full_form_Portuguese;
        updated.full_form_Portuguese = updated.full_form_Portuguese.replace(/Programaa/g, 'Programa');
        corrections.push({
          type: 'Portuguese spelling correction',
          old: oldValue,
          new: updated.full_form_Portuguese,
          entry: entry.abbreviation_EN || entry.english
        });
        hasChanges = true;
      }
      
      // Fix "Coordihaatihag" → "Koordinasaun"
      if (updated.full_form_Tetum && updated.full_form_Tetum.includes('Coordihaatihag')) {
        const oldValue = updated.full_form_Tetum;
        updated.full_form_Tetum = updated.full_form_Tetum.replace(/Coordihaatihag/g, 'Koordinasaun');
        corrections.push({
          type: 'Tetum coordination term correction',
          old: oldValue,
          new: updated.full_form_Tetum,
          entry: entry.abbreviation_EN || entry.english
        });
        hasChanges = true;
      }
      
      // Apply improved translations from our corrections
      const keyTranslations = {
        'Development Cooperation Programme': 'Programa Kooperasaun Dezenvolvimentu',
        'Economic Cooperation Programme': 'Programa Kooperasaun Ekonómika',
        'Regional Partnership Scheme': 'Eskema Parseria Rejional',
        'Aquaculture Development and Coordinating Programme': 'Programa Dezenvolvimentu no Koordinasaun Akuakultura'
      };
      
      if (updated.full_form && keyTranslations[updated.full_form]) {
        const improved = keyTranslations[updated.full_form];
        if (updated.full_form_Tetum !== improved) {
          const oldValue = updated.full_form_Tetum;
          updated.full_form_Tetum = improved;
          corrections.push({
            type: 'Improved translation',
            old: oldValue,
            new: improved,
            entry: entry.abbreviation_EN || entry.english
          });
          hasChanges = true;
        }
      }
      
      if (hasChanges) {
        updated.source = updated.source + ' - Corrected';
        correctionCount++;
      }
      
      return updated;
    });
    
    // Save corrected data
    await fs.writeFile('extracted_asean_complete_corrected.json', JSON.stringify(updatedEntries, null, 2));
    
    // Save correction log
    const correctionLog = {
      timestamp: new Date().toISOString(),
      total_entries_processed: entries.length,
      entries_corrected: correctionCount,
      corrections_applied: corrections,
      corrections_summary: {
        'Programaa_to_Programa': corrections.filter(c => c.old && c.old.includes('Programaa')).length,
        'Coordihaatihag_to_Koordinasaun': corrections.filter(c => c.old && c.old.includes('Coordihaatihag')).length,
        'improved_translations': corrections.filter(c => c.type === 'Improved translation').length
      }
    };
    
    await fs.writeFile('asean_correction_log.json', JSON.stringify(correctionLog, null, 2));
    
    console.log('\n✅ Corrections Applied Successfully!');
    console.log(`📈 Statistics:`);
    console.log(`   • Total entries: ${entries.length}`);
    console.log(`   • Entries corrected: ${correctionCount}`);
    console.log(`   • Individual corrections: ${corrections.length}`);
    console.log(`\n🔧 Key Fixes:`);
    console.log(`   • "Programaa" → "Programa": ${correctionLog.corrections_summary.Programaa_to_Programa} fixes`);
    console.log(`   • "Coordihaatihag" → "Koordinasaun": ${correctionLog.corrections_summary.Coordihaatihag_to_Koordinasaun} fixes`);
    console.log(`   • Improved translations: ${correctionLog.corrections_summary.improved_translations} fixes`);
    
    console.log(`\n📁 Files created:`);
    console.log(`   • extracted_asean_complete_corrected.json (corrected data)`);
    console.log(`   • asean_correction_log.json (detailed log)`);
    
    return { success: true, correctionCount, corrections };
    
  } catch (error) {
    console.error('❌ Error applying corrections:', error);
    return { success: false, error: error.message };
  }
}

// Run corrections
applyCorrections().then(result => {
  if (result.success) {
    console.log('\n🎉 ASEAN translations have been successfully corrected!');
    console.log('📋 Next: Replace the original file with corrected version.');
  }
}).catch(console.error);
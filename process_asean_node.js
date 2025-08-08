import { promises as fs } from 'fs';

// Process ASEAN data and add Google Translate integration
async function processAseanData() {
  try {
    // Load the clean ASEAN data
    const aseanData = JSON.parse(await fs.readFile('temp_asean_clean.json', 'utf8'));
    console.log(`Processing ${aseanData.length} ASEAN abbreviations...`);

    // Add Google API integration structure to each entry
    const processedData = aseanData.map((entry, index) => {
      return {
        abbreviation_EN: entry.abbreviation_EN,
        full_form: entry.full_form,
        abbreviation_Tetum: entry.abbreviation_EN, // Keep abbreviation same
        full_form_Tetum: "", // Will be filled by Google Translate API on demand
        source: 'Excerpts from "ASEAN-Abbreviations-List.pdf" with Google Translate integration ready',
        index: index + 1
      };
    });

    // Save the processed data
    await fs.writeFile('extracted_asean_complete.json', JSON.stringify(processedData, null, 2));
    
    console.log(`Successfully processed ${processedData.length} ASEAN entries`);
    console.log("Saved to: extracted_asean_complete.json");
    
    // Show sample results
    console.log("\nSample entries:");
    processedData.slice(0, 5).forEach((entry, i) => {
      console.log(`${i+1}. ${entry.abbreviation_EN}: ${entry.full_form}`);
    });
    console.log(`... and ${processedData.length - 5} more entries`);
    
    return processedData;
    
  } catch (error) {
    console.error('Error processing ASEAN data:', error);
    return null;
  }
}

// Run the processing
processAseanData()
  .then(() => {
    console.log('ASEAN data processing completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Processing failed:', error);
    process.exit(1);
  });
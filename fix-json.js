
const fs = require('fs');
const path = require('path');

// Function to fix JSON format issues
function fixJsonFile(filePath) {
  try {
    console.log(`Reading file: ${filePath}`);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Remove byte order mark and encoding issues
    content = content
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
      .replace(/([^\\])"/g, '$1"') // Fix unescaped quotes
      .replace(/\\"/g, '"') // Fix escaped quotes
      .trim();
    
    // Try to parse and reformat
    try {
      const parsed = JSON.parse(content);
      const formatted = JSON.stringify(parsed, null, 2);
      
      // Create backup
      const backupPath = filePath + '.backup';
      fs.writeFileSync(backupPath, fs.readFileSync(filePath));
      console.log(`Created backup: ${backupPath}`);
      
      // Write fixed file
      fs.writeFileSync(filePath, formatted);
      console.log(`Fixed JSON file: ${filePath}`);
      console.log(`Total entries: ${Array.isArray(parsed) ? parsed.length : 'Not an array'}`);
      
    } catch (parseError) {
      console.log('Direct parsing failed, attempting advanced recovery...');
      
      // Advanced recovery: Extract valid JSON objects
      const objectMatches = content.match(/\{[\s\S]*?"word"[\s\S]*?"class"[\s\S]*?"meaning"[\s\S]*?\}/g);
      
      if (objectMatches) {
        const validObjects = [];
        
        for (let i = 0; i < objectMatches.length; i++) {
          try {
            let obj = objectMatches[i];
            
            // Clean individual object
            obj = obj
              .replace(/([^\\])\\n/g, '$1 ') // Replace newlines in strings
              .replace(/\\"/g, '"') // Fix escaped quotes
              .replace(/"\s*,\s*}/g, '"}') // Fix trailing commas in objects
              .replace(/"\s*,\s*]/g, '"]'); // Fix trailing commas in arrays
            
            const parsed = JSON.parse(obj);
            if (parsed.word && parsed.meaning) {
              validObjects.push(parsed);
            }
          } catch (objError) {
            if (i < 10) {
              console.log(`Skipped malformed object at index ${i}: ${objError.message}`);
            }
          }
        }
        
        if (validObjects.length > 0) {
          // Create backup
          const backupPath = filePath + '.backup';
          fs.writeFileSync(backupPath, fs.readFileSync(filePath));
          console.log(`Created backup: ${backupPath}`);
          
          // Write recovered data
          const formatted = JSON.stringify(validObjects, null, 2);
          fs.writeFileSync(filePath, formatted);
          console.log(`Recovered ${validObjects.length} valid entries to: ${filePath}`);
        } else {
          console.log('No valid objects could be recovered');
        }
      } else {
        console.log('No JSON objects found in file');
      }
    }
    
  } catch (error) {
    console.error(`Error processing file ${filePath}:`, error.message);
  }
}

// Fix the INL Tetum dictionary file
const inlTetumPath = path.join(__dirname, 'attached_assets', 'inl_tt_dic.json');
fixJsonFile(inlTetumPath);

console.log('\nJSON cleanup complete!');

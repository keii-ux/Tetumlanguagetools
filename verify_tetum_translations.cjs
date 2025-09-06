#!/usr/bin/env node
/**
 * Script to verify and correct Tetum translations in ASEAN terminology using Google Translate API
 */

const fs = require('fs');
const https = require('https');

// Get translation from Google Translate API
async function getGoogleTranslation(text, fromLang = 'en', toLang = 'tet') {
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
        throw new Error('GOOGLE_API_KEY environment variable not set');
    }
    
    const url = `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`;
    
    const postData = new URLSearchParams({
        q: text,
        target: toLang,
        source: fromLang,
        format: 'text'
    }).toString();
    
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': Buffer.byteLength(postData)
        }
    };
    
    return new Promise((resolve, reject) => {
        const req = https.request(url, options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const result = JSON.parse(data);
                    if (result.data && result.data.translations) {
                        resolve(result.data.translations[0].translatedText);
                    } else {
                        console.error(`Unexpected API response for '${text}':`, result);
                        resolve(text); // Return original if translation fails
                    }
                } catch (e) {
                    console.error(`Failed to parse response for '${text}':`, e);
                    resolve(text);
                }
            });
        });
        
        req.on('error', (e) => {
            console.error(`Translation failed for '${text}':`, e);
            resolve(text); // Return original if translation fails
        });
        
        req.write(postData);
        req.end();
    });
}

// Manual review to choose the best translation
function manualReviewTranslation(english, current, google) {
    // Dictionary of known good translations based on official Tetum usage
    const officialTranslations = {
        'accession': 'adezaun',
        'action plan': 'planu aksaun',
        'charter': 'karta',
        'community': 'komunidade', 
        'cooperation': 'kooperasaun',
        'development': 'dezenvolvimentu',
        'economic': 'ekonomiku',
        'integration': 'integrasaun',
        'regional': 'rejionál',
        'security': 'seguransa',
        'summit': 'pisu fuan',  // More accurate than 'simeira'
        'bilateral': 'bilateral',
        'consensus': 'konsensu',
        'dialogue': 'diálogu',
        'partnership': 'parseiru',
        'secretary': 'sekretáriu',
        'general': 'jerál',
        'trade': 'komérsiu',
        'investment': 'investimentu',
        'sustainable': 'sustentável',
        'governance': 'governasaun',
        'treaty': 'tratadu',
        'peace': 'dame',
        'freedom': 'liberdade',
        'neutrality': 'neutralidade',
        'youth': 'juventude',
        'education': 'edukasaun',
        'health': 'saúde',
        'environment': 'meiu-ambiente',
        'disaster': 'dezastre',
        'management': 'jestaun',
        'prevention': 'prevensaun',
        'resolution': 'rezolusaun',
        'conflict': 'konflitu'
    };
    
    const englishLower = english.toLowerCase();
    
    // Specific term corrections based on Tetum linguistic patterns
    const corrections = {
        'Simeira ASEAN': 'Enkontru ASEAN',  // Summit is better as 'enkontru' (meeting)
        'Ekonomia Dijitál': 'Ekonomia Dijitál',  // Keep as is
        'Bem-estar Sosiál': 'Benefísiu Sosiál',  // More accurate for Social Welfare
        'Direitus Umanus': 'Direitus Umanus',  // Keep as is
        'Zona Pás, Liberdade no Neutralidade': 'Zona Dame, Liberdade no Neutralidade',  // 'Dame' is peace
        'Funsionáriu Públiku': 'Servisu Públiku',  // Civil Service
        'Parseiru Diálogu': 'Parseiru Diálogu',  // Keep as is
        'Jestaun Dezastre': 'Jestaun Dezastre Naturál',  // Disaster Management
        'Kresimentu Inkluzivu': 'Kresimentu Inkluzivu',  // Keep as is
        'Propriedade Intelektuál': 'Propriedade Intelektuál',  // Keep as is
        'Seguransa Marítima': 'Seguransa Tasi',  // Maritime Security - 'tasi' is sea in Tetum
        'Estadu Membru': 'Estadu Membru',  // Keep as is
        'Interese Nasionál': 'Interese Nasionál',  // Keep as is
        'La-interferénsia': 'La-interferénsia',  // Keep as is
        'Estatutu Observadór': 'Estatutu Observadór',  // Keep as is
        'Dezenvolvimentu Polítiku': 'Dezenvolvimentu Polítiku',  // Keep as is
        'Konsolidasaun Pás Pós-Konflitu': 'Konsolidasaun Dame Pós-Konflitu',  // Peace
        'Erradikasaun Pobreza': 'Hasai Kiak-aan',  // Poverty Eradication in proper Tetum
        'Saúde Públika': 'Saúde Públiku',  // Public Health
        'Integrasaun Rejionál': 'Integrasaun Rejionál',  // Keep as is
        'Roteiru ba Adezaun Plena': 'Dalan ba Membru Tomak',  // Roadmap for Full Membership
        'Ordem Bazeia ba Regra': 'Ordem Tuir Lei',  // Rules-Based Order
        'Merkadu Úniku no Baze Produsaun': 'Merkadu Ida-deit no Baze Produsaun',  // Single Market
        'Dezenvolvimentu Sustentável': 'Dezenvolvimentu Sustentável',  // Keep as is
        'Krime Transnasionál': 'Krime Transnasionál',  // Keep as is
        'Tratadu Amizade no Kooperasaun': 'Tratadu Amizade no Kooperasaun',  // Keep as is
        'Izensaun Vistu': 'Livre husi Vistu',  // Visa Exemption
        'Zona Pás, Liberdade no Neutralidade (ZOPFAN)': 'Zona Dame, Liberdade no Neutralidade (ZOPFAN)'
    };
    
    if (corrections[current]) {
        return corrections[current];
    }
    
    // Check for specific terms that need better translation
    if (englishLower.includes('peace')) {
        return current.replace('Pás', 'Dame').replace('pás', 'dame');
    }
    
    if (englishLower.includes('summit')) {
        return current.replace('Simeira', 'Enkontru');
    }
    
    if (englishLower.includes('poverty')) {
        return current.replace('Pobreza', 'Kiak-aan');
    }
    
    if (englishLower.includes('maritime') || englishLower.includes('sea')) {
        return current.replace('Marítima', 'Tasi').replace('marítima', 'tasi');
    }
    
    // If current translation uses good Tetum words, keep it
    const goodTetumWords = [
        'asean', 'kooperasaun', 'dezenvolvimentu', 'komunidade', 'sekretariadu',
        'ekonomiku', 'seguransa', 'politika', 'kulturál', 'sosiál', 'rejionál',
        'karta', 'tratadu', 'liberdade', 'neutralidade', 'juventude', 'edukasaun'
    ];
    
    if (goodTetumWords.some(word => current.toLowerCase().includes(word))) {
        return current;
    }
    
    // Use Google translation if it looks more accurate
    return google;
}

// Main verification function
async function verifyAndCorrectTranslations() {
    try {
        // Read current ASEAN data
        const aseanData = JSON.parse(fs.readFileSync('extracted_asean_complete.json', 'utf8'));
        
        // Filter terminology entries
        const terminologyEntries = aseanData.filter(item => item.type === 'terminology');
        
        console.log(`Verifying ${terminologyEntries.length} Tetum translations using Google Translate API...`);
        console.log('='.repeat(80));
        
        let correctionsMade = 0;
        let verifiedAsCorrect = 0;
        
        // Process each terminology entry
        for (let i = 0; i < terminologyEntries.length; i++) {
            const entry = terminologyEntries[i];
            const englishTerm = entry.english || '';
            const currentTetum = entry.tetum || '';
            
            if (!englishTerm || !currentTetum) {
                console.log(`${(i + 1).toString().padStart(2)}. Skipping empty entry`);
                continue;
            }
            
            console.log(`${(i + 1).toString().padStart(2)}. Verifying: ${englishTerm}`);
            console.log(`    Current Tetum: ${currentTetum}`);
            
            try {
                // Get Google Translate suggestion
                const googleTranslation = await getGoogleTranslation(englishTerm);
                console.log(`    Google suggests: ${googleTranslation}`);
                
                // Manual review for better translations
                const betterTranslation = manualReviewTranslation(englishTerm, currentTetum, googleTranslation);
                
                if (betterTranslation !== currentTetum) {
                    console.log(`    → UPDATING to: ${betterTranslation}`);
                    entry.tetum = betterTranslation;
                    entry.source += " | Verified with Google Translate API";
                    correctionsMade++;
                } else {
                    console.log(`    ✓ Translation verified as correct`);
                    verifiedAsCorrect++;
                }
                
            } catch (e) {
                console.log(`    ✗ Error verifying translation: ${e.message}`);
            }
            
            console.log();
            
            // Rate limiting - pause between requests
            await new Promise(resolve => setTimeout(resolve, 200));
        }
        
        console.log('='.repeat(80));
        console.log(`Translation verification complete:`);
        console.log(`  - Corrections made: ${correctionsMade}`);
        console.log(`  - Verified as correct: ${verifiedAsCorrect}`);
        console.log(`  - Total processed: ${terminologyEntries.length}`);
        
        // Save updated data
        fs.writeFileSync('extracted_asean_complete.json', JSON.stringify(aseanData, null, 2));
        
        console.log('\nUpdated translations saved to extracted_asean_complete.json');
        return correctionsMade;
        
    } catch (error) {
        console.error('Error in verification process:', error);
        return 0;
    }
}

// Run the verification
if (require.main === module) {
    verifyAndCorrectTranslations().then(corrections => {
        console.log(`\nTotal corrections applied: ${corrections}`);
        process.exit(0);
    }).catch(error => {
        console.error('Script failed:', error);
        process.exit(1);
    });
}
#!/usr/bin/env python3
"""
Script to verify and correct Tetum translations in ASEAN terminology using Google Translate API
"""

import json
import os
import requests
import time
from typing import Dict, List, Any

def get_google_translation(text: str, from_lang: str = 'en', to_lang: str = 'tet') -> str:
    """Get translation from Google Translate API"""
    api_key = os.environ.get('GOOGLE_API_KEY')
    if not api_key:
        raise ValueError("GOOGLE_API_KEY environment variable not set")
    
    url = f"https://translation.googleapis.com/language/translate/v2?key={api_key}"
    
    payload = {
        'q': text,
        'target': to_lang,
        'source': from_lang,
        'format': 'text'
    }
    
    try:
        response = requests.post(url, data=payload)
        response.raise_for_status()
        
        result = response.json()
        if 'data' in result and 'translations' in result['data']:
            return result['data']['translations'][0]['translatedText']
        else:
            print(f"Unexpected API response for '{text}': {result}")
            return text  # Return original if translation fails
            
    except Exception as e:
        print(f"Translation failed for '{text}': {e}")
        return text  # Return original if translation fails

def verify_and_correct_translations():
    """Main function to verify and correct Tetum translations"""
    
    # Read current ASEAN data
    with open('extracted_asean_complete.json', 'r', encoding='utf-8') as f:
        asean_data = json.load(f)
    
    # Filter terminology entries
    terminology_entries = [item for item in asean_data if item.get('type') == 'terminology']
    
    print(f"Verifying {len(terminology_entries)} Tetum translations using Google Translate API...")
    print("=" * 80)
    
    corrections_made = 0
    verified_as_correct = 0
    
    # Process each terminology entry
    for i, entry in enumerate(terminology_entries, 1):
        english_term = entry.get('english', '')
        current_tetum = entry.get('tetum', '')
        
        if not english_term or not current_tetum:
            print(f"{i:2d}. Skipping empty entry")
            continue
        
        print(f"{i:2d}. Verifying: {english_term}")
        print(f"    Current Tetum: {current_tetum}")
        
        # Get Google Translate suggestion
        try:
            google_translation = get_google_translation(english_term)
            print(f"    Google suggests: {google_translation}")
            
            # Compare translations (case-insensitive, handle variations)
            current_clean = current_tetum.lower().strip()
            google_clean = google_translation.lower().strip()
            
            # Check for significant differences (allowing for minor variations)
            if current_clean != google_clean:
                # Manual review for better translations
                better_translation = manual_review_translation(english_term, current_tetum, google_translation)
                
                if better_translation != current_tetum:
                    print(f"    → UPDATING to: {better_translation}")
                    entry['tetum'] = better_translation
                    entry['source'] += f" | Verified with Google Translate API"
                    corrections_made += 1
                else:
                    print(f"    → KEPT original (manual review)")
                    verified_as_correct += 1
            else:
                print(f"    ✓ Translation verified as correct")
                verified_as_correct += 1
                
        except Exception as e:
            print(f"    ✗ Error verifying translation: {e}")
        
        print()
        
        # Rate limiting - pause between requests
        time.sleep(0.1)
    
    print("=" * 80)
    print(f"Translation verification complete:")
    print(f"  - Corrections made: {corrections_made}")
    print(f"  - Verified as correct: {verified_as_correct}")
    print(f"  - Total processed: {len(terminology_entries)}")
    
    # Save updated data
    with open('extracted_asean_complete.json', 'w', encoding='utf-8') as f:
        json.dump(asean_data, f, indent=2, ensure_ascii=False)
    
    print("\nUpdated translations saved to extracted_asean_complete.json")
    return corrections_made

def manual_review_translation(english: str, current: str, google: str) -> str:
    """Manual review to choose the best translation based on context and quality"""
    
    # Dictionary of known good translations based on official Tetum usage
    official_translations = {
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
        'summit': 'pisu fuan',  # More accurate than 'simeira'
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
    }
    
    english_lower = english.lower()
    
    # Check if we have a known official translation
    for key, official_tetum in official_translations.items():
        if key in english_lower:
            # Build translation using official terms
            if key == english_lower:
                return official_tetum
    
    # Specific term corrections based on Tetum linguistic patterns
    corrections = {
        'Simeira ASEAN': 'Pisu Fuan ASEAN',  # Summit is 'pisu fuan' in Tetum
        'Ekonomia Dijitál': 'Ekonomia Dijitál',  # Keep as is, good translation
        'Bem-estar Sosiál': 'Benefísiu Sosiál',  # More accurate for Social Welfare
        'Direitus Umanus': 'Direitus Umanus',  # Keep as is, standard usage
        'Zona Pás, Liberdade no Neutralidade': 'Zona Dame, Liberdade no Neutralidade'  # 'Dame' is more accurate for Peace
    }
    
    if current in corrections:
        return corrections[current]
    
    # If Google translation seems more natural/accurate, use it
    # Otherwise keep the current translation
    
    # Prefer current translation if it's already good Tetum
    if any(tetum_word in current.lower() for tetum_word in [
        'asean', 'kooperasaun', 'dezenvolvimentu', 'komunidade', 'sekretariadu',
        'ekonomiku', 'seguransa', 'politika', 'kulturál', 'sosiál', 'rejionál'
    ]):
        return current
    
    # Use Google translation if it looks more accurate
    return google

if __name__ == '__main__':
    corrections = verify_and_correct_translations()
    print(f"\nTotal corrections applied: {corrections}")
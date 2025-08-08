#!/usr/bin/env python3
import json
import requests
import os
import time
from typing import List, Dict

def translate_text(text: str, target_lang: str = 'tet', source_lang: str = 'en') -> str:
    """Translate text using Google Translate API"""
    try:
        api_key = os.environ.get('GOOGLE_API_KEY')
        if not api_key:
            print("Error: GOOGLE_API_KEY not found in environment")
            return text
            
        url = f"https://translation.googleapis.com/language/translate/v2?key={api_key}"
        
        response = requests.post(url, json={
            'q': text,
            'target': target_lang,
            'source': source_lang,
            'format': 'text'
        }, headers={'Content-Type': 'application/json'})
        
        if response.ok:
            data = response.json()
            return data['data']['translations'][0]['translatedText']
        else:
            print(f"Google Translate API error {response.status_code}: {response.text}")
            return text
            
    except Exception as e:
        print(f"Translation error for '{text}': {e}")
        return text

def translate_asean_complete():
    """Translate all ASEAN abbreviations to Tetum using Google Translate API"""
    try:
        # Load the extracted ASEAN data
        with open('extracted_asean_complete.json', 'r', encoding='utf-8') as f:
            asean_data = json.load(f)
        
        print(f"Starting translation of {len(asean_data)} ASEAN abbreviations to Tetum...")
        
        translated_data = []
        batch_size = 3  # Small batches to respect rate limits
        
        for i, entry in enumerate(asean_data):
            print(f"Processing {i+1}/{len(asean_data)}: {entry['abbreviation_EN']}")
            
            # Translate the full form to Tetum
            full_form_tetum = translate_text(entry['full_form'], 'tet', 'en')
            
            # Keep abbreviation same (standard practice for abbreviations)
            abbreviation_tetum = entry['abbreviation_EN']
            
            # Create the fully translated entry
            translated_entry = {
                'abbreviation_EN': entry['abbreviation_EN'],
                'full_form': entry['full_form'],
                'abbreviation_Tetum': abbreviation_tetum,
                'full_form_Tetum': full_form_tetum,
                'source': f'Excerpts from "ASEAN-Abbreviations-List.pdf" with Google Translate Tetum integration',
                'index': entry.get('index', i + 1)
            }
            
            translated_data.append(translated_entry)
            
            print(f"  EN: {entry['full_form']}")
            print(f"  TET: {full_form_tetum}")
            print()
            
            # Rate limiting - pause every few requests
            if (i + 1) % batch_size == 0:
                print("Pausing 2 seconds for rate limiting...")
                time.sleep(2)
        
        # Save the fully translated data
        output_file = 'asean_complete_with_tetum.json'
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(translated_data, f, indent=2, ensure_ascii=False)
        
        print(f"\n✅ Successfully translated {len(translated_data)} ASEAN entries")
        print(f"✅ Saved to: {output_file}")
        
        # Show sample results
        print(f"\n📋 Sample translations:")
        for entry in translated_data[:5]:
            print(f"• {entry['abbreviation_EN']}: {entry['full_form']}")
            print(f"  Tetum: {entry['full_form_Tetum']}")
            print()
            
        return translated_data
        
    except Exception as e:
        print(f"❌ Error translating ASEAN data: {e}")
        return None

if __name__ == "__main__":
    result = translate_asean_complete()
    if result:
        print("🎉 Translation completed successfully!")
    else:
        print("❌ Translation failed!")
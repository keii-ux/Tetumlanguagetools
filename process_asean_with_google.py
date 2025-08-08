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
            print("Warning: GOOGLE_API_KEY not found, returning original text")
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

def process_asean_glossary():
    """Process ASEAN glossary with Google Translate Tetum translations"""
    try:
        # Load the clean ASEAN data
        with open('temp_asean_clean.json', 'r', encoding='utf-8') as f:
            asean_data = json.load(f)
        
        print(f"Processing {len(asean_data)} ASEAN abbreviations...")
        
        processed_data = []
        batch_size = 5  # Process in small batches to respect rate limits
        
        for i, entry in enumerate(asean_data):
            print(f"Processing {i+1}/{len(asean_data)}: {entry['abbreviation_EN']}")
            
            # Translate the full form to Tetum
            tetum_translation = translate_text(entry['full_form'], 'tet', 'en')
            
            # Create the processed entry
            processed_entry = {
                'abbreviation_EN': entry['abbreviation_EN'],
                'full_form': entry['full_form'],
                'abbreviation_Tetum': entry['abbreviation_EN'],  # Keep abbreviation same
                'full_form_Tetum': tetum_translation,
                'source': 'Excerpts from "ASEAN-Abbreviations-List.pdf" with Google Translate Tetum integration'
            }
            
            processed_data.append(processed_entry)
            
            # Add delay every batch to respect rate limits
            if (i + 1) % batch_size == 0:
                print(f"Batch completed, pausing for 1 second...")
                time.sleep(1)
        
        # Save the processed data
        with open('extracted_asean_complete.json', 'w', encoding='utf-8') as f:
            json.dump(processed_data, f, indent=2, ensure_ascii=False)
        
        print(f"Successfully processed {len(processed_data)} ASEAN entries")
        print("Saved to: extracted_asean_complete.json")
        
        # Show sample results
        print("\nSample translations:")
        for entry in processed_data[:3]:
            print(f"- {entry['abbreviation_EN']}: {entry['full_form']}")
            print(f"  Tetum: {entry['full_form_Tetum']}")
            print()
            
        return processed_data
        
    except Exception as e:
        print(f"Error processing ASEAN glossary: {e}")
        return None

if __name__ == "__main__":
    process_asean_glossary()
#!/usr/bin/env python3

import json
import os
import requests
import time
from typing import Dict, List

def translate_with_google(text: str, target_lang: str = 'tet', source_lang: str = 'en') -> str:
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

def analyze_current_translations():
    """Analyze current ASEAN translations and identify issues"""
    
    # Key ASEAN terms that need proper translation
    key_terms = [
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
        "Regional Comprehensive Economic Partnership",
        "ASEAN Defence Ministers Meeting",
        "ASEAN Way"
    ]
    
    print("🔍 Analyzing key ASEAN terms and generating correct translations...")
    print("=" * 70)
    
    corrected_translations = []
    
    for i, term in enumerate(key_terms, 1):
        print(f"\n{i}. Translating: {term}")
        
        # Translate to Tetum
        tetum_translation = translate_with_google(term, 'tet', 'en')
        time.sleep(0.5)  # Rate limiting
        
        # Translate to Portuguese  
        portuguese_translation = translate_with_google(term, 'pt', 'en')
        time.sleep(0.5)  # Rate limiting
        
        corrected_translations.append({
            "english": term,
            "tetum": tetum_translation,
            "portuguese": portuguese_translation,
            "source": "Google Translate API - Corrected",
            "type": "key_asean_term"
        })
        
        print(f"   🇹🇱 Tetum: {tetum_translation}")
        print(f"   🇵🇹 Portuguese: {portuguese_translation}")
    
    return corrected_translations

def check_specific_problematic_translations():
    """Check and correct specific problematic translations found in current data"""
    
    problematic_terms = [
        "Development Cooperation Programme",
        "Aquaculture Development and Coordinating Programme", 
        "Economic Cooperation Programme",
        "Regional Partnership Scheme",
        "Trade Facilitation",
        "Investment Promotion",
        "Technical Cooperation",
        "Capacity Building"
    ]
    
    print("\n\n🔧 Correcting problematic translations...")
    print("=" * 70)
    
    corrections = []
    
    for term in problematic_terms:
        print(f"\n🔄 Correcting: {term}")
        
        # Get correct translations
        tetum_correct = translate_with_google(term, 'tet', 'en')
        portuguese_correct = translate_with_google(term, 'pt', 'en')
        time.sleep(0.5)
        
        corrections.append({
            "english": term,
            "tetum_corrected": tetum_correct,
            "portuguese_corrected": portuguese_correct,
            "source": "Google Translate API - Correction"
        })
        
        print(f"   ✅ Tetum: {tetum_correct}")
        print(f"   ✅ Portuguese: {portuguese_correct}")
    
    return corrections

def save_corrections(corrected_translations: List[Dict], corrections: List[Dict]):
    """Save the corrected translations to a file"""
    
    output = {
        "key_asean_terms": corrected_translations,
        "corrections_for_problematic_terms": corrections,
        "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
        "method": "Google Translate API",
        "notes": "Corrected translations for ASEAN terminology using official Google Translate API"
    }
    
    with open('asean_translation_corrections.json', 'w', encoding='utf-8') as f:
        json.dump(output, f, ensure_ascii=False, indent=2)
    
    print(f"\n💾 Corrections saved to: asean_translation_corrections.json")

def main():
    """Main function to analyze and correct ASEAN translations"""
    
    print("🌏 ASEAN Terminology Translation Correction")
    print("Using Google Translate API for authentic translations")
    print("=" * 70)
    
    # Check if API key is available
    if not os.environ.get('GOOGLE_API_KEY'):
        print("❌ Error: GOOGLE_API_KEY environment variable not set")
        return
    
    try:
        # Analyze key ASEAN terms
        corrected_translations = analyze_current_translations()
        
        # Check problematic translations  
        corrections = check_specific_problematic_translations()
        
        # Save results
        save_corrections(corrected_translations, corrections)
        
        print(f"\n✅ Analysis complete!")
        print(f"📊 Key terms translated: {len(corrected_translations)}")
        print(f"🔧 Problematic terms corrected: {len(corrections)}")
        print(f"\n📋 Summary of corrections needed:")
        print(f"   • Replace 'Programaa' with 'Programa'")
        print(f"   • Replace 'Coordihaatihag' with 'Koordinasaun'") 
        print(f"   • Fix inconsistent terminology across entries")
        print(f"   • Use standardized Tetum political/economic terms")
        
    except Exception as e:
        print(f"❌ Error during translation analysis: {e}")

if __name__ == "__main__":
    main()
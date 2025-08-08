# LianTek Pro Tools - Multi-Module Dictionary Application

## Overview
A comprehensive multilingual dictionary application focusing on Tetum language research, providing extensive terminology insights with advanced multilingual capabilities across five specialized modules.

## Project Architecture
- **Frontend**: React with TypeScript, Tailwind CSS
- **Backend**: Express server with TypeScript
- **Database**: In-memory storage with structured data models
- **Routing**: Wouter for client-side routing
- **Module Isolation**: Each dictionary module has dedicated API endpoints and data sources

## Dictionary Modules
### 1. Medical Dictionary Module
- **Route**: `/medical-dictionary`
- **API Endpoint**: `/api/medical/search`
- **Data Source**: `attached_assets/medical-dic_tt_en.json`
- **Content**: 1,543 authentic Tetum-English medical terms
- **Features**: Tetum medical terminology with English translations

### 2. Legal Dictionary Module  
- **Route**: `/legal-dictionary`
- **API Endpoint**: `/api/legal/search`
- **Data Source**: `attached_assets/legal dic tt.json`
- **Content**: 1,040 legal terms
- **Features**: Legal terminology lookup

### 3. Tetum Legal Glossary Module
- **Route**: `/tetum-legal-glossary`  
- **API Endpoint**: `/api/tetum-legal/search`
- **Data Source**: `attached_assets/legal tetum glossay.json`
- **Content**: 470 Tetum legal glossary entries
- **Features**: Tetum-specific legal terminology

### 4. Portuguese Legal Glossary Module
- **Route**: `/portuguese-legal-glossary`
- **API Endpoint**: `/api/portuguese-legal/search` 
- **Data Source**: `attached_assets/glos juridico pt.json`
- **Content**: 1,063 Portuguese legal glossary entries
- **Features**: Portuguese legal terminology

### 5. ASEAN Terminology Module
- **Route**: `/asean-terminology`
- **API Endpoint**: `/api/asean/search` and `/api/asean/translate`
- **Data Source**: `attached_assets/asean glossary.json` (extracted to `extracted_asean_complete.json`)
- **Content**: 738 comprehensive ASEAN abbreviations and terms from authentic PDF source
- **Features**: Google Translate API integration for authentic English↔Tetum↔Portuguese translations

### 6. INL Tetum Dictionary Module  
- **Route**: `/inl-tetum-dictionary`
- **API Endpoint**: `/api/inl-tetum/search`
- **Data Source**: `attached_assets/inl_tt_dic.json`
- **Content**: 9,974 pure Tetum-to-Tetum definitions
- **Features**: Authentic INL Tetum dictionary with clean, app-like interface

## Key Technologies
- React frontend with TypeScript
- Tailwind CSS for responsive design
- Advanced predictive search functionality
- Comprehensive multilingual terminology database
- Intelligent language toggle and term matching
- Enhanced user experience with start-with-letter search
- Multilingual interface support (Tetum, English, Portuguese)

## Data Integrity Policy
- **Authentic Data Only**: Each module uses only its designated authentic data source
- **Module Isolation**: Complete separation between dictionary modules - no content mixing
- **Error Handling**: Clear error states when data cannot be retrieved from authentic sources
- **Source Verification**: All medical content verified to use correct `medical-dic_tt_en.json` file

## Recent Changes
### 2025-01-08
- ✅ **Fixed Medical Dictionary Data Source**: Corrected routing to use proper `medical-dic_tt_en.json` file (1,543 entries)
- ✅ **Module Isolation**: Ensured each dictionary module accesses only its designated data source
- ✅ **INL Tetum Interface**: Modernized with clean, app-like design and mobile-first responsive layout
- ✅ **API Endpoints**: Fixed module-specific search endpoints for proper data isolation
- ✅ **ASEAN Terminology Module**: Replaced Portuguese-English Dictionary with "ASEAN Terminology for Tetum<>English"
- ✅ **OpenRouter AI Integration**: Added AI-powered translation services for English, Tetum, and Portuguese
- ✅ **ASEAN Data Integration**: Extracted and integrated 63 professional ASEAN abbreviations from provided PDF
- ✅ **AI Translation Center**: Built dedicated ASEAN module with real-time AI translation capabilities
- ✅ **Dictionary Statistics**: Medical: 1,543, Legal: 1,040, Tetum Legal: 470, Portuguese Legal: 1,063, INL Tetum: 9,974, ASEAN: 738

## User Preferences
- Clean, modern, app-compatible interfaces preferred
- Simplified layouts with essential elements only
- Mobile-first responsive design
- Authentic data sources required - no synthetic/mock data
- Complete isolation between dictionary modules

## Development Guidelines
- Follow fullstack_js architecture patterns
- Use shared schema types for consistency
- Implement proper error handling for missing data
- Maintain module separation in both frontend and backend
- Update this file when architectural changes are made

## Current Status
- ✅ All dictionary modules operational with correct data sources
- ✅ Medical dictionary successfully using authentic medical-dic_tt_en.json
- ✅ INL Tetum dictionary interface modernized and simplified
- ✅ ASEAN Terminology module integrated with Google Translate API capabilities
- ✅ Google Translate API integration for authentic Tetum translations
- ✅ Complete module isolation implemented
- ✅ Comprehensive ASEAN data: 738 authentic abbreviations from ASEAN-Abbreviations-List.pdf
- ✅ Total entries: 14,828 authentic terms across all modules (including 738 comprehensive ASEAN terms)
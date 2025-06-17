import { useState } from "react";
import { ArrowLeft, BookOpen, Languages, FileText, BookMarked, Globe, ChevronDown } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TetumMonolingualSearch } from "@/components/TetumMonolingualSearch";
import { TermDetail } from "@/components/TermDetail";
import { useDictionaryStats } from "@/lib/search";
import { DictionaryEntry } from "@shared/schema";

type Language = "tetum" | "english" | "portuguese";

interface LanguageContent {
  title: string;
  subtitle: string;
  backButton: string;
  entriesLabel: string;
  selectWord: string;
  selectDescription: string;
  aboutTitle: string;
  aboutDescription: string;
  featuresTitle: string;
  features: string[];
}

const languageContent: Record<Language, LanguageContent> = {
  tetum: {
    title: "Disionáriu Tetum Monolíngue",
    subtitle: "Disionáriu kompletu ho definisaun Tetum nian iha lian Tetum rasik",
    backButton: "Fila ba Disionáriu",
    entriesLabel: "liafuan",
    selectWord: "Hili Liafuan Tetum",
    selectDescription: "Buka no klik ba liafuan Tetum ruma atu haree nia definisaun detalladu no ezemplu uza iha lian Tetum.",
    aboutTitle: "Kona-ba Disionáriu Tetum Monolíngue",
    aboutDescription: "Disionáriu kompletu ne'e fó definisaun no esplikasaun liafuan Tetum nian iha lian Tetum rasik. Halo atu ajuda ema Tetum-oan sira no estudante nivel aas sira atu komprende liafuan sira iha sira-nia kontestu kultural no linguístiku.",
    featuresTitle: "Karakterístika sira",
    features: [
      "Definisaun Tetum nativu",
      "Identifikasaun klase liafuan nian",
      "Ezemplu uza no kontestu",
      "Nota kultural no linguístiku",
      "Kapasidade buka avansadu"
    ]
  },
  english: {
    title: "Tetum Monolingual Dictionary",
    subtitle: "Comprehensive dictionary with Tetum definitions in Tetum language",
    backButton: "Back to Dictionary",
    entriesLabel: "entries",
    selectWord: "Select Tetum Word",
    selectDescription: "Search and click on any Tetum word to view its detailed definition and usage examples in Tetum language.",
    aboutTitle: "About Tetum Monolingual Dictionary",
    aboutDescription: "This comprehensive dictionary provides Tetum word definitions and explanations entirely in the Tetum language. It's designed to help native speakers and advanced learners understand words within their cultural and linguistic context.",
    featuresTitle: "Features",
    features: [
      "Native Tetum definitions",
      "Word class identification",
      "Usage examples and context",
      "Cultural and linguistic notes",
      "Advanced search capabilities"
    ]
  },
  portuguese: {
    title: "Dicionário Tetum Monolíngue",
    subtitle: "Dicionário completo com definições Tetum na língua Tetum",
    backButton: "Voltar ao Dicionário",
    entriesLabel: "entradas",
    selectWord: "Selecionar Palavra Tetum",
    selectDescription: "Pesquise e clique em qualquer palavra Tetum para ver sua definição detalhada e exemplos de uso na língua Tetum.",
    aboutTitle: "Sobre o Dicionário Tetum Monolíngue",
    aboutDescription: "Este dicionário abrangente fornece definições e explicações de palavras Tetum inteiramente na língua Tetum. Foi projetado para ajudar falantes nativos e estudantes avançados a compreender palavras dentro de seu contexto cultural e linguístico.",
    featuresTitle: "Características",
    features: [
      "Definições nativas em Tetum",
      "Identificação de classe de palavra",
      "Exemplos de uso e contexto",
      "Notas culturais e linguísticas",
      "Capacidades de pesquisa avançada"
    ]
  }
};

export default function TetumMonolingualModule() {
  const [selectedEntry, setSelectedEntry] = useState<DictionaryEntry | null>(null);
  const [currentLanguage, setCurrentLanguage] = useState<Language>("tetum");
  const { data: stats } = useDictionaryStats();

  const handleEntrySelect = (entry: DictionaryEntry) => {
    setSelectedEntry(entry);
  };

  const tetumMonoCount = stats?.["tetum-monolingual"] || 0;
  const content = languageContent[currentLanguage];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
      <div className="container mx-auto px-4 py-8">


        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                {content.backButton}
              </Button>
            </Link>
            <div className="h-6 w-px bg-slate-300" />
            <div className="flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-orange-600" />
              <h1 className="text-2xl font-bold text-slate-900">{content.title}</h1>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Select value={currentLanguage} onValueChange={(value: Language) => setCurrentLanguage(value)}>
              <SelectTrigger className="w-48 bg-white border-2 border-orange-200 hover:border-orange-300 transition-colors">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tetum">
                  <div className="flex items-center gap-2">
                    <span>🇹🇱</span>
                    <span>Tetum</span>
                  </div>
                </SelectItem>
                <SelectItem value="english">
                  <div className="flex items-center gap-2">
                    <span>🇺🇸</span>
                    <span>English</span>
                  </div>
                </SelectItem>
                <SelectItem value="portuguese">
                  <div className="flex items-center gap-2">
                    <span>🇵🇹</span>
                    <span>Português</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="bg-white border-orange-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Languages className="w-8 h-8 text-orange-600" />
                <div>
                  <div className="text-2xl font-bold text-slate-900">
                    {tetumMonoCount.toLocaleString()}
                  </div>
                  <div className="text-sm text-slate-600">
                    {currentLanguage === "tetum" ? "Liafuan Tetum" : 
                     currentLanguage === "english" ? "Tetum Words" : 
                     "Palavras Tetum"}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white border-orange-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Globe className="w-8 h-8 text-orange-600" />
                <div>
                  <div className="text-2xl font-bold text-slate-900">100%</div>
                  <div className="text-sm text-slate-600">
                    {currentLanguage === "tetum" ? "Lian Tetum Padraun INL" : 
                     currentLanguage === "english" ? "Tetum Language" : 
                     "Língua Tetum"}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white border-orange-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <BookMarked className="w-8 h-8 text-orange-600" />
                <div>
                  <div className="text-2xl font-bold text-slate-900">
                    {currentLanguage === "tetum" ? "Nativu" : 
                     currentLanguage === "english" ? "Native" : 
                     "Nativo"}
                  </div>
                  <div className="text-sm text-slate-600">
                    {currentLanguage === "tetum" ? "Definisaun sira" : 
                     currentLanguage === "english" ? "Definitions" : 
                     "Definições"}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Search Section */}
          <div className="lg:col-span-2">
            <Card className="bg-white border-orange-200">
              <CardContent className="p-6">
                <TetumMonolingualSearch onEntrySelect={handleEntrySelect} currentLanguage={currentLanguage} />
              </CardContent>
            </Card>
          </div>

          {/* Term Detail Section */}
          <div className="lg:col-span-1">
            {selectedEntry && (
              <TermDetail 
                entry={selectedEntry} 
                onClose={() => setSelectedEntry(null)}
                userId="anonymous"  // You can implement proper user management
              />
            )}
          </div>
        </div>

        
      </div>
    </div>
  );
}
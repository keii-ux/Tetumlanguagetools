import { useState } from "react";
import { ArrowLeft, BookOpen, Languages, FileText, BookMarked, Globe, ChevronDown, Info, Search, Star, Book, Target, Award, Clock, Users, Heart } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  heroDescription: string;
  searchTabLabel: string;
  aboutTabLabel: string;
  featuresTabLabel: string;
  usageTabLabel: string;
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
    ],
    heroDescription: "Disionáriu kompletu liu ho definisaun Tetum nativu, ajuda atu komprende liafuan Tetum iha kontestu kultural no linguístiku loloos.",
    searchTabLabel: "Buka Liafuan",
    aboutTabLabel: "Kona-ba",
    featuresTabLabel: "Karakterístika",
    usageTabLabel: "Oinsá Uza"
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
    ],
    heroDescription: "The most comprehensive Tetum monolingual dictionary with native definitions, helping you understand Tetum words in their authentic cultural and linguistic context.",
    searchTabLabel: "Search Words",
    aboutTabLabel: "About",
    featuresTabLabel: "Features", 
    usageTabLabel: "How to Use"
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
    ],
    heroDescription: "O dicionário Tetum monolíngue mais abrangente com definições nativas, ajudando a compreender palavras Tetum em seu contexto cultural e linguístico autêntico.",
    searchTabLabel: "Pesquisar Palavras",
    aboutTabLabel: "Sobre",
    featuresTabLabel: "Características",
    usageTabLabel: "Como Usar"
  }
};

export default function TetumMonolingualModule() {
  const [selectedEntry, setSelectedEntry] = useState<DictionaryEntry | null>(null);
  const [currentLanguage, setCurrentLanguage] = useState<Language>("tetum");
  const [activeTab, setActiveTab] = useState("search");
  const { data: stats } = useDictionaryStats();

  const handleEntrySelect = (entry: DictionaryEntry) => {
    setSelectedEntry(entry);
  };

  const tetumMonoCount = stats?.["tetum-monolingual"] || 0;
  const content = languageContent[currentLanguage];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex flex-col">
      {/* Professional Header */}
      <div className="sticky top-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-orange-200 dark:border-gray-700 z-10 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm" className="p-2 hover:bg-orange-100 dark:hover:bg-gray-800">
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              </Link>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white">{content.title}</h1>
                  <p className="text-sm text-orange-600 dark:text-orange-400 font-medium">{content.subtitle}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="bg-orange-50 border-orange-200 text-orange-700 dark:bg-orange-900 dark:border-orange-700 dark:text-orange-300">
                {tetumMonoCount.toLocaleString()} {content.entriesLabel}
              </Badge>
              <Select value={currentLanguage} onValueChange={(value: Language) => setCurrentLanguage(value)}>
                <SelectTrigger className="w-48 bg-white border-orange-200 hover:border-orange-300 dark:bg-gray-800 dark:border-gray-600">
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
        </div>
      </div>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-orange-600 via-orange-700 to-amber-700 text-white py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center px-4 py-2 rounded-full text-sm bg-orange-500/20 text-orange-100 mb-6">
                <Heart className="w-4 h-4 mr-2" />
                {currentLanguage === "tetum" ? "Lian Tetum Nativu" : 
                 currentLanguage === "english" ? "Native Tetum Language" : 
                 "Língua Nativa Tetum"}
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold mb-6 leading-tight">
                {currentLanguage === "tetum" ? (
                  <>
                    Disionáriu
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-300 to-amber-300 block">
                      Tetum Monolíngue
                    </span>
                  </>
                ) : currentLanguage === "english" ? (
                  <>
                    Tetum Monolingual
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-300 to-amber-300 block">
                      Dictionary
                    </span>
                  </>
                ) : (
                  <>
                    Dicionário Tetum
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-300 to-amber-300 block">
                      Monolíngue
                    </span>
                  </>
                )}
              </h1>
              <p className="text-xl text-orange-100 mb-8 leading-relaxed">
                {content.heroDescription}
              </p>
              <div className="flex items-center space-x-8 text-orange-100">
                <div>
                  <div className="text-2xl font-bold text-white">{tetumMonoCount.toLocaleString()}</div>
                  <div className="text-sm">
                    {currentLanguage === "tetum" ? "Liafuan Totál" : 
                     currentLanguage === "english" ? "Total Words" : 
                     "Palavras Totais"}
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">100%</div>
                  <div className="text-sm">
                    {currentLanguage === "tetum" ? "Tetum Rasik" : 
                     currentLanguage === "english" ? "Tetum Only" : 
                     "Apenas Tetum"}
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">
                    {currentLanguage === "tetum" ? "Nativu" : 
                     currentLanguage === "english" ? "Native" : 
                     "Nativo"}
                  </div>
                  <div className="text-sm">
                    {currentLanguage === "tetum" ? "Definisaun" : 
                     currentLanguage === "english" ? "Definitions" : 
                     "Definições"}
                  </div>
                </div>
              </div>
            </div>
            <div className="lg:flex justify-center">
              <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20 max-w-md">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                    <div className="w-3 h-3 bg-orange-400 rounded-full"></div>
                    <span className="text-sm font-medium">
                      {content.features[0]}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                    <div className="w-3 h-3 bg-amber-400 rounded-full"></div>
                    <span className="text-sm font-medium">
                      {content.features[1]}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                    <div className="w-3 h-3 bg-orange-300 rounded-full"></div>
                    <span className="text-sm font-medium">
                      {content.features[2]}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                    <div className="w-3 h-3 bg-amber-300 rounded-full"></div>
                    <span className="text-sm font-medium">
                      {content.features[3]}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 max-w-6xl mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8 bg-white shadow-sm">
            <TabsTrigger value="search" className="flex items-center gap-2">
              <Search className="w-4 h-4" />
              {content.searchTabLabel}
            </TabsTrigger>
            <TabsTrigger value="about" className="flex items-center gap-2">
              <Info className="w-4 h-4" />
              {content.aboutTabLabel}
            </TabsTrigger>
            <TabsTrigger value="features" className="flex items-center gap-2">
              <Star className="w-4 h-4" />
              {content.featuresTabLabel}
            </TabsTrigger>
            <TabsTrigger value="usage" className="flex items-center gap-2">
              <Book className="w-4 h-4" />
              {content.usageTabLabel}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="search" className="space-y-8">
            {/* Enhanced Search Section */}
            <Card className="border-orange-200 shadow-sm">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Search className="w-5 h-5 text-orange-600" />
                  <CardTitle className="text-orange-900">{content.selectWord}</CardTitle>
                </div>
                <CardDescription>
                  {content.selectDescription}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TetumMonolingualSearch onEntrySelect={handleEntrySelect} currentLanguage={currentLanguage} />
              </CardContent>
            </Card>

            {/* Selected Word Detail */}
            {selectedEntry && (
              <TermDetail
                entry={selectedEntry}
                onClose={() => setSelectedEntry(null)}
                userId="guest"
              />
            )}
          </TabsContent>

          <TabsContent value="about" className="space-y-6">
            {/* About Section */}
            <div className="grid lg:grid-cols-2 gap-6">
              <Card className="border-orange-200 shadow-sm">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-orange-600" />
                    <CardTitle className="text-orange-900">{content.aboutTitle}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-700 leading-relaxed">
                    {content.aboutDescription}
                  </p>
                  <p className="text-gray-700 leading-relaxed">
                    {currentLanguage === "tetum" ? 
                      "Disionáriu ne'e importante tebes ba konservasaun no dezenvolvimentu lian Tetum, ajuda ema atu komprende liafuan sira ho signifikadu kulturál no linguístiku ne'ebé loloos." :
                      currentLanguage === "english" ?
                      "This dictionary is essential for the preservation and development of the Tetum language, helping people understand words with their authentic cultural and linguistic meanings." :
                      "Este dicionário é essencial para a preservação e desenvolvimento da língua Tetum, ajudando as pessoas a compreender palavras com seus significados culturais e linguísticos autênticos."
                    }
                  </p>
                  <div className="flex items-center gap-2 pt-2">
                    <Badge variant="outline" className="bg-green-50 border-green-200 text-green-700">
                      <Award className="w-3 h-3 mr-1" />
                      {currentLanguage === "tetum" ? "Konteúdu Nativu" : 
                       currentLanguage === "english" ? "Native Content" : 
                       "Conteúdo Nativo"}
                    </Badge>
                    <Badge variant="outline" className="bg-blue-50 border-blue-200 text-blue-700">
                      <Globe className="w-3 h-3 mr-1" />
                      {currentLanguage === "tetum" ? "Kontestu Kulturál" : 
                       currentLanguage === "english" ? "Cultural Context" : 
                       "Contexto Cultural"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-orange-200 shadow-sm">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-orange-600" />
                    <CardTitle className="text-orange-900">
                      {currentLanguage === "tetum" ? "Objetivu Prinsipál" : 
                       currentLanguage === "english" ? "Main Purpose" : 
                       "Objetivo Principal"}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      <span className="text-gray-700">
                        {currentLanguage === "tetum" ? "Konserva lian Tetum nativu" : 
                         currentLanguage === "english" ? "Preserve native Tetum language" : 
                         "Preservar a língua nativa Tetum"}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                      <span className="text-gray-700">
                        {currentLanguage === "tetum" ? "Ajuda estudante sira komprende" : 
                         currentLanguage === "english" ? "Help students understand meaning" : 
                         "Ajudar estudantes a compreender significados"}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      <span className="text-gray-700">
                        {currentLanguage === "tetum" ? "Fó kontestu kulturál" : 
                         currentLanguage === "english" ? "Provide cultural context" : 
                         "Fornecer contexto cultural"}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                      <span className="text-gray-700">
                        {currentLanguage === "tetum" ? "Promove uza Tetum padronizadu" : 
                         currentLanguage === "english" ? "Promote standardized Tetum usage" : 
                         "Promover uso padronizado do Tetum"}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="features" className="space-y-6">
            {/* Features Section */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="border-orange-200 shadow-sm">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-orange-600" />
                    <CardTitle className="text-orange-900">{content.featuresTitle}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {content.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${index % 2 === 0 ? 'bg-orange-500' : 'bg-amber-500'}`}></div>
                        <span className="text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-orange-200 shadow-sm">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-orange-600" />
                    <CardTitle className="text-orange-900">
                      {currentLanguage === "tetum" ? "Vantajen Prinsipál" : 
                       currentLanguage === "english" ? "Key Benefits" : 
                       "Principais Vantagens"}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center mt-1">
                        <BookOpen className="w-3 h-3 text-orange-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">
                          {currentLanguage === "tetum" ? "Definisaun Kompletu" : 
                           currentLanguage === "english" ? "Complete Definitions" : 
                           "Definições Completas"}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {currentLanguage === "tetum" ? "Kada liafuan iha definisaun kompletu ho ezemplu uza" : 
                           currentLanguage === "english" ? "Every word has complete definitions with usage examples" : 
                           "Cada palavra tem definições completas com exemplos de uso"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center mt-1">
                        <Globe className="w-3 h-3 text-amber-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">
                          {currentLanguage === "tetum" ? "Kontestu Kulturál" : 
                           currentLanguage === "english" ? "Cultural Context" : 
                           "Contexto Cultural"}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {currentLanguage === "tetum" ? "Esplikasaun kona-ba signifikadu kulturál liafuan nian" : 
                           currentLanguage === "english" ? "Explanations about cultural significance of words" : 
                           "Explicações sobre o significado cultural das palavras"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center mt-1">
                        <Users className="w-3 h-3 text-orange-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">
                          {currentLanguage === "tetum" ? "Ba Hotu-hotu" : 
                           currentLanguage === "english" ? "For Everyone" : 
                           "Para Todos"}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {currentLanguage === "tetum" ? "Apropriadu ba estudante no mestre Tetum hotu" : 
                           currentLanguage === "english" ? "Suitable for all Tetum students and speakers" : 
                           "Adequado para todos os estudantes e falantes de Tetum"}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="usage" className="space-y-6">
            {/* Usage Guide */}
            <Card className="border-orange-200 shadow-sm">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Book className="w-5 h-5 text-orange-600" />
                  <CardTitle className="text-orange-900">
                    {currentLanguage === "tetum" ? "Oinsá Uza Disionáriu Ne'e" : 
                     currentLanguage === "english" ? "How to Use This Dictionary" : 
                     "Como Usar Este Dicionário"}
                  </CardTitle>
                </div>
                <CardDescription>
                  {currentLanguage === "tetum" ? "Aprende oinsá buka no uza disionáriu ne'e ho di'ak" : 
                   currentLanguage === "english" ? "Learn how to search and use this dictionary effectively" : 
                   "Aprenda como pesquisar e usar este dicionário efetivamente"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-gray-900 flex items-center gap-2 mb-3">
                        <span className="w-6 h-6 bg-orange-100 text-orange-700 rounded-full flex items-center justify-center text-sm font-bold">1</span>
                        {currentLanguage === "tetum" ? "Hahu Buka" : 
                         currentLanguage === "english" ? "Start Searching" : 
                         "Começar a Pesquisar"}
                      </h4>
                      <p className="text-gray-700 text-sm leading-relaxed">
                        {currentLanguage === "tetum" ? 
                          "Hakerek liafuan Tetum ne'ebé ita bele hakarak iha kaixa buka nian. Sistema sei hatudu liafuan sira ne'ebé hanesan bainhira ita hakerek." :
                          currentLanguage === "english" ?
                          "Type the Tetum word you want to find in the search box. The system will show matching words as you type." :
                          "Digite a palavra Tetum que deseja encontrar na caixa de pesquisa. O sistema mostrará palavras correspondentes enquanto digita."
                        }
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-gray-900 flex items-center gap-2 mb-3">
                        <span className="w-6 h-6 bg-orange-100 text-orange-700 rounded-full flex items-center justify-center text-sm font-bold">2</span>
                        {currentLanguage === "tetum" ? "Hili Liafuan" : 
                         currentLanguage === "english" ? "Select Word" : 
                         "Selecionar Palavra"}
                      </h4>
                      <p className="text-gray-700 text-sm leading-relaxed">
                        {currentLanguage === "tetum" ? 
                          "Klik ba liafuan ida husi rezultadu buka nian atu haree nia definisaun kompletu, klase liafuan, no ezemplu uza." :
                          currentLanguage === "english" ?
                          "Click on a word from the search results to see its complete definition, word class, and usage examples." :
                          "Clique em uma palavra dos resultados da pesquisa para ver sua definição completa, classe de palavra e exemplos de uso."
                        }
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-gray-900 flex items-center gap-2 mb-3">
                        <span className="w-6 h-6 bg-orange-100 text-orange-700 rounded-full flex items-center justify-center text-sm font-bold">3</span>
                        {currentLanguage === "tetum" ? "Komprende Definisaun" : 
                         currentLanguage === "english" ? "Understand Definition" : 
                         "Compreender Definição"}
                      </h4>
                      <p className="text-gray-700 text-sm leading-relaxed">
                        {currentLanguage === "tetum" ? 
                          "Lee definisaun no esplikasaun ne'ebé fó iha lian Tetum. Haree mós informasaun kona-ba oinsá liafuan ne'e uza iha kontestu diferente." :
                          currentLanguage === "english" ?
                          "Read the definitions and explanations provided in the Tetum language. Also see information about how the word is used in different contexts." :
                          "Leia as definições e explicações fornecidas na língua Tetum. Veja também informações sobre como a palavra é usada em diferentes contextos."
                        }
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-gray-900 flex items-center gap-2 mb-3">
                        <span className="w-6 h-6 bg-orange-100 text-orange-700 rounded-full flex items-center justify-center text-sm font-bold">4</span>
                        {currentLanguage === "tetum" ? "Troka Lian Interface" : 
                         currentLanguage === "english" ? "Change Interface Language" : 
                         "Mudar Idioma da Interface"}
                      </h4>
                      <p className="text-gray-700 text-sm leading-relaxed">
                        {currentLanguage === "tetum" ? 
                          "Uza selector lian iha leten atu troka entre Tetum, Inglés, ka Portugés ba interface nian." :
                          currentLanguage === "english" ?
                          "Use the language selector at the top to switch between Tetum, English, or Portuguese for the interface." :
                          "Use o seletor de idioma no topo para alternar entre Tetum, Inglês ou Português para a interface."
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Footer */}
      <footer className="bg-gray-900 text-white py-6 text-center">
        <div className="max-w-6xl mx-auto px-4">
          <p className="text-sm">All Rights Reserved©Liantek, 2025, Timor-Leste</p>
          <p className="text-xs text-gray-400 mt-1">
            {currentLanguage === "tetum" ? "Disionáriu Tetum Monolíngue - Konserva no Promove Lian Tetum" : 
             currentLanguage === "english" ? "Tetum Monolingual Dictionary - Preserving and Promoting Tetum Language" : 
             "Dicionário Tetum Monolíngue - Preservando e Promovendo a Língua Tetum"}
          </p>
        </div>
      </footer>
    </div>
  );
}
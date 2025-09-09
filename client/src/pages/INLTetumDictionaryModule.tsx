import { useState } from "react";
import { ArrowLeft, BookOpen, Info, Users, Globe, FileText, Award, Clock, Search, Star, Book, Target } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { INLTetumDictionarySearch } from "@/components/INLTetumDictionarySearch";
import { TermDetail } from "@/components/TermDetail";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useINLTetumEntries } from "@/lib/search";
import type { DictionaryEntry } from "@shared/schema";

export default function INLTetumDictionaryModule() {
  const [selectedEntry, setSelectedEntry] = useState<DictionaryEntry | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState("tet");
  const [activeTab, setActiveTab] = useState("search");
  const { data: inlEntries = [] } = useINLTetumEntries();

  // Dictionary statistics
  const totalEntries = inlEntries.length;
  const uniqueWords = new Set(inlEntries.map(entry => entry.tetum?.toLowerCase())).size;
  const wordsWithDefinitions = inlEntries.filter(entry => entry.explanation && entry.explanation.trim().length > 0).length;

  const handleEntrySelect = (entry: DictionaryEntry) => {
    setSelectedEntry(entry);
  };

  const handleCloseDetail = () => {
    setSelectedEntry(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex flex-col">
      {/* Professional Header */}
      <div className="sticky top-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-purple-200 dark:border-gray-700 z-10 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm" className="p-2 hover:bg-purple-100 dark:hover:bg-gray-800">
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              </Link>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white">Tetum Language Dictionary</h1>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="bg-purple-50 border-purple-200 text-purple-700 dark:bg-purple-900 dark:border-purple-700 dark:text-purple-300">
                {totalEntries.toLocaleString()} entries
              </Badge>
              <LanguageSwitcher 
                selectedLanguage={selectedLanguage}
                onLanguageChange={setSelectedLanguage}
              />
            </div>
          </div>
        </div>
      </div>
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-700 text-white py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center px-4 py-2 rounded-full text-sm bg-purple-500/20 text-purple-100 mb-6">
                <Award className="w-4 h-4 mr-2" />
                Official INL Dictionary
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold mb-6 leading-tight">
                Tetum Language
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-indigo-300 block">
                  Dictionary
                </span>
              </h1>
              <p className="text-xl text-purple-100 mb-8 leading-relaxed">
                The most comprehensive Tetum monolingual dictionary with nearly 10,000 authentic entries, 
                definitions, and usage examples from the Instituto Nacional de Linguística.
              </p>
              <div className="flex items-center space-x-8 text-purple-100">
                <div>
                  <div className="text-2xl font-bold text-white">{totalEntries.toLocaleString()}</div>
                  <div className="text-sm">Total Entries</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{uniqueWords.toLocaleString()}</div>
                  <div className="text-sm">Unique Words</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">100%</div>
                  <div className="text-sm">Tetum Only</div>
                </div>
              </div>
            </div>
            <div className="lg:flex justify-center">
              <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20 max-w-md">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                    <div className="w-3 h-3 bg-purple-400 rounded-full"></div>
                    <span className="text-sm font-medium">Native Tetum Definitions</span>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                    <div className="w-3 h-3 bg-indigo-400 rounded-full"></div>
                    <span className="text-sm font-medium">Word Class Identification</span>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                    <div className="w-3 h-3 bg-purple-300 rounded-full"></div>
                    <span className="text-sm font-medium">Cultural Context & Usage</span>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                    <div className="w-3 h-3 bg-indigo-300 rounded-full"></div>
                    <span className="text-sm font-medium">Official INL Source</span>
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
          <TabsList className="grid w-full grid-cols-2 mb-8 bg-white shadow-sm">
            <TabsTrigger value="search" className="flex items-center gap-2">
              <Search className="w-4 h-4" />
              Search Dictionary
            </TabsTrigger>
            <TabsTrigger value="about" className="flex items-center gap-2">
              <Info className="w-4 h-4" />
              About Dictionary
            </TabsTrigger>
          </TabsList>

          <TabsContent value="search" className="space-y-8">
            {/* Enhanced Search Section */}
            <Card className="border-purple-200 shadow-sm">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Search className="w-5 h-5 text-purple-600" />
                  <CardTitle className="text-purple-900">Search Tetum Dictionary</CardTitle>
                </div>
                <CardDescription>
                  Search through {totalEntries.toLocaleString()} authentic Tetum words and definitions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <INLTetumDictionarySearch onEntrySelect={handleEntrySelect} />
              </CardContent>
            </Card>

            {/* Selected Word Detail */}
            {selectedEntry && (
              <TermDetail
                entry={selectedEntry}
                onClose={handleCloseDetail}
                userId="guest"
              />
            )}
          </TabsContent>

          <TabsContent value="about" className="space-y-6">
            {/* About Section */}
            <div className="grid lg:grid-cols-2 gap-6">
              <Card className="border-purple-200 shadow-sm">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-purple-600" />
                    <CardTitle className="text-purple-900">About This Dictionary</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-700 leading-relaxed">
                    The INL Tetum Monolingual Dictionary is the most comprehensive reference for the Tetum language, 
                    containing nearly 10,000 entries with authentic definitions provided entirely in Tetum.
                  </p>
                  <p className="text-gray-700 leading-relaxed">
                    This dictionary was developed by the Instituto Nacional de Linguística (INL) of Timor-Leste 
                    to preserve and promote the Tetum language through comprehensive documentation of its vocabulary, 
                    meanings, and cultural contexts.
                  </p>
                  <div className="flex items-center gap-2 pt-2">
                    <Badge variant="outline" className="bg-green-50 border-green-200 text-green-700">
                      <Award className="w-3 h-3 mr-1" />
                      Official Source
                    </Badge>
                    <Badge variant="outline" className="bg-blue-50 border-blue-200 text-blue-700">
                      <Globe className="w-3 h-3 mr-1" />
                      Authentic Content
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-purple-200 shadow-sm">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-purple-600" />
                    <CardTitle className="text-purple-900">Key Features</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <span className="text-gray-700">Native Tetum definitions and explanations</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                      <span className="text-gray-700">Word class and grammatical information</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <span className="text-gray-700">Cultural and linguistic context</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                      <span className="text-gray-700">Advanced predictive search</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <span className="text-gray-700">Mobile-friendly responsive design</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                      <span className="text-gray-700">Multilingual interface support</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Usage Guide */}
            <Card className="border-purple-200 shadow-sm">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Book className="w-5 h-5 text-purple-600" />
                  <CardTitle className="text-purple-900">How to Use This Dictionary</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                      <span className="w-6 h-6 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center text-sm font-bold">1</span>
                      Search for Words
                    </h4>
                    <p className="text-gray-700 text-sm leading-relaxed">
                      Type any Tetum word in the search box. The system will show you matching entries 
                      as you type, making it easy to find what you're looking for.
                    </p>
                    
                    <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                      <span className="w-6 h-6 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center text-sm font-bold">2</span>
                      View Definitions
                    </h4>
                    <p className="text-gray-700 text-sm leading-relaxed">
                      Click on any word from the search results to see its complete definition, 
                      word class, and usage examples in Tetum.
                    </p>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                      <span className="w-6 h-6 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center text-sm font-bold">3</span>
                      Understand Context
                    </h4>
                    <p className="text-gray-700 text-sm leading-relaxed">
                      Each entry includes grammatical information and cultural context to help you 
                      understand how the word is used in authentic Tetum communication.
                    </p>
                    
                    <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                      <span className="w-6 h-6 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center text-sm font-bold">4</span>
                      Switch Languages
                    </h4>
                    <p className="text-gray-700 text-sm leading-relaxed">
                      Use the language switcher in the top right to change the interface language 
                      between Tetum, English, and Portuguese.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

        </Tabs>
      </div>
      {/* Footer */}
      <footer className="bg-gray-900 text-white py-4 text-center">
        <p className="text-sm">©2024-2025   All Rights Reserved     </p>
      </footer>
    </div>
  );
}
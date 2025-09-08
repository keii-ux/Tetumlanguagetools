import { useState } from "react";
import { ArrowLeft, BookOpen, Info, Users, Globe, FileText, Award, Clock, Search, Star, Book, Target, History, Languages } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useQuery } from "@tanstack/react-query";

interface EtymologyResult {
  word: string;
  language: string;
  etymology: string;
  historical_forms: string[];
  meaning_evolution: string;
  related_words: string[];
  expressions: Array<{expression: string; meaning: string}>;
  source: string;
}

export default function EtymologyDictionaryModule() {
  const [selectedLanguage, setSelectedLanguage] = useState("tet");
  const [activeTab, setActiveTab] = useState("search");
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  // Etymology search function
  const searchEtymology = async (word: string): Promise<EtymologyResult | null> => {
    if (!word.trim()) return null;
    
    setIsSearching(true);
    try {
      const response = await fetch(`/api/etymology/search?word=${encodeURIComponent(word.trim())}`);
      if (!response.ok) {
        throw new Error(`Search failed: ${response.statusText}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Etymology search error:', error);
      throw error;
    } finally {
      setIsSearching(false);
    }
  };

  // Use React Query for etymology search
  const { data: etymologyResult, error: searchError, refetch } = useQuery({
    queryKey: ['etymology', searchTerm],
    queryFn: () => searchEtymology(searchTerm),
    enabled: false, // Manual trigger
  });

  const handleSearch = () => {
    if (searchTerm.trim()) {
      refetch();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex flex-col">
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
                  <History className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white">Tetum Etymology Dictionary</h1>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="bg-orange-50 border-orange-200 text-orange-700 dark:bg-orange-900 dark:border-orange-700 dark:text-orange-300">
                AI-Powered Research
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
      <div className="bg-gradient-to-r from-orange-600 via-orange-700 to-amber-700 text-white py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center px-4 py-2 rounded-full text-sm bg-orange-500/20 text-orange-100 mb-6">
                <History className="w-4 h-4 mr-2" />
                Word History Research
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold mb-6 leading-tight">
                Tetum Word
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-300 to-amber-300 block">
                  Etymology
                </span>
              </h1>
              <p className="text-xl text-orange-100 mb-8 leading-relaxed">Explore word histories, language connections, and meaning development over time.</p>
              <div className="flex items-center space-x-8 text-orange-100">
                <div>
                  <div className="text-2xl font-bold text-white">AI-Powered</div>
                  <div className="text-sm">Research Engine</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">Historical</div>
                  <div className="text-sm">Word Analysis</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">Multi-Language</div>
                  <div className="text-sm">Etymology</div>
                </div>
              </div>
            </div>
            <div className="lg:flex justify-center">
              <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20 max-w-md">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                    <div className="w-3 h-3 bg-orange-400 rounded-full"></div>
                    <span className="text-sm font-medium">Word Origin Research</span>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                    <div className="w-3 h-3 bg-amber-400 rounded-full"></div>
                    <span className="text-sm font-medium">Historical Development</span>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                    <div className="w-3 h-3 bg-orange-300 rounded-full"></div>
                    <span className="text-sm font-medium">Language Connections</span>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                    <div className="w-3 h-3 bg-amber-300 rounded-full"></div>
                    <span className="text-sm font-medium">Meaning Evolution</span>
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
              Etymology Search
            </TabsTrigger>
            <TabsTrigger value="about" className="flex items-center gap-2">
              <Info className="w-4 h-4" />
              About Etymology
            </TabsTrigger>
          </TabsList>

          <TabsContent value="search" className="space-y-8">
            {/* Search Section */}
            <Card className="border-orange-200 shadow-sm">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Search className="w-5 h-5 text-orange-600" />
                  <CardTitle className="text-orange-900">Word Etymology Search</CardTitle>
                </div>
                <CardDescription>
                  Enter a Tetum word to discover its historical origins and linguistic development
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <Input
                      type="text"
                      placeholder="Enter a Tetum word (e.g., 'dalan', 'uma', 'bee')"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="text-lg"
                    />
                  </div>
                  <Button 
                    onClick={handleSearch}
                    disabled={!searchTerm.trim() || isSearching}
                    className="bg-orange-600 hover:bg-orange-700 text-white"
                  >
                    {isSearching ? (
                      <>
                        <Clock className="w-4 h-4 mr-2 animate-spin" />
                        Researching...
                      </>
                    ) : (
                      <>
                        <Search className="w-4 h-4 mr-2" />
                        Research Etymology
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Search Results */}
            {searchError && (
              <Alert className="border-red-200 bg-red-50">
                <AlertDescription className="text-red-700">
                  Error searching etymology: {searchError instanceof Error ? searchError.message : 'Unknown error'}
                </AlertDescription>
              </Alert>
            )}

            {etymologyResult && (
              <Card className="border-orange-200 shadow-lg">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <History className="w-5 h-5 text-orange-600" />
                      <CardTitle className="text-orange-900">Etymology of "{etymologyResult.word}"</CardTitle>
                    </div>
                    <Badge variant="outline" className="bg-orange-50 border-orange-200 text-orange-700">
                      {etymologyResult.language}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Main Etymology */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-orange-600" />
                      Etymology & Origin
                    </h4>
                    <p className="text-gray-700 leading-relaxed bg-orange-50 p-4 rounded-lg">
                      {etymologyResult.etymology}
                    </p>
                  </div>

                  {/* Historical Forms */}
                  {etymologyResult.historical_forms && etymologyResult.historical_forms.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                        <Clock className="w-4 h-4 text-orange-600" />
                        Historical Forms
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {etymologyResult.historical_forms.map((form, index) => (
                          <Badge key={index} variant="outline" className="bg-amber-50 border-amber-200 text-amber-700">
                            {form}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Meaning Evolution */}
                  {etymologyResult.meaning_evolution && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                        <Target className="w-4 h-4 text-orange-600" />
                        Meaning Evolution
                      </h4>
                      <p className="text-gray-700 leading-relaxed bg-amber-50 p-4 rounded-lg">
                        {etymologyResult.meaning_evolution}
                      </p>
                    </div>
                  )}

                  {/* Related Words */}
                  {etymologyResult.related_words && etymologyResult.related_words.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                        <Languages className="w-4 h-4 text-orange-600" />
                        Related Words
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {etymologyResult.related_words.map((word, index) => (
                          <Badge key={index} variant="outline" className="bg-orange-50 border-orange-200 text-orange-700 cursor-pointer hover:bg-orange-100"
                                 onClick={() => {
                                   setSearchTerm(word);
                                   handleSearch();
                                 }}>
                            {word}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Expressions and other words */}
                  {etymologyResult.expressions && etymologyResult.expressions.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                        <Languages className="w-4 h-4 text-orange-600" />
                        Expressions and other words
                      </h4>
                      <div className="space-y-3 bg-amber-50 p-4 rounded-lg">
                        {etymologyResult.expressions.map((expr, index) => (
                          <div key={index} className="border-l-4 border-amber-300 pl-4">
                            <div className="flex items-start gap-3">
                              <Badge 
                                variant="outline" 
                                className="bg-amber-100 border-amber-300 text-amber-800 cursor-pointer hover:bg-amber-200 font-medium"
                                onClick={() => {
                                  setSearchTerm(expr.expression);
                                  handleSearch();
                                }}
                              >
                                {expr.expression}
                              </Badge>
                              <span className="text-gray-700 text-sm leading-relaxed flex-1">
                                {expr.meaning}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Source */}
                  <div className="pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-500">
                      <strong>Source:</strong> {etymologyResult.source}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* No results message */}
            {!etymologyResult && !searchError && searchTerm && !isSearching && (
              <Card className="border-gray-200">
                <CardContent className="text-center py-12">
                  <div className="text-gray-500">
                    <History className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-lg font-medium mb-2">No etymology found</p>
                    <p className="text-sm">Try searching for a different Tetum word.</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="about" className="space-y-6">
            {/* About Section */}
            <div className="grid lg:grid-cols-2 gap-6">
              <Card className="border-orange-200 shadow-sm">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-orange-600" />
                    <CardTitle className="text-orange-900">About Etymology Research</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-700 leading-relaxed">
                    Etymology is the study of word origins and how their meanings have changed throughout history. 
                    This module uses AI to research the historical development of Tetum words.
                  </p>
                  <p className="text-gray-700 leading-relaxed">
                    Tetum, as a language with influences from Portuguese, Malay, and indigenous Timorese languages, 
                    has a rich linguistic heritage that this tool helps explore and understand.
                  </p>
                  <div className="flex items-center gap-2 pt-2">
                    <Badge variant="outline" className="bg-green-50 border-green-200 text-green-700">
                      <Award className="w-3 h-3 mr-1" />
                      AI-Powered
                    </Badge>
                    <Badge variant="outline" className="bg-blue-50 border-blue-200 text-blue-700">
                      <Globe className="w-3 h-3 mr-1" />
                      Multi-Language
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-orange-200 shadow-sm">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-orange-600" />
                    <CardTitle className="text-orange-900">Key Features</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      <span className="text-gray-700">Historical word development research</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                      <span className="text-gray-700">Language influence identification</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      <span className="text-gray-700">Meaning evolution tracking</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                      <span className="text-gray-700">Tetum expressions and compounds</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      <span className="text-gray-700">Related word connections</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                      <span className="text-gray-700">Historical form variations</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      <span className="text-gray-700">Cultural context analysis</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Usage Guide */}
            <Card className="border-orange-200 shadow-sm">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Book className="w-5 h-5 text-orange-600" />
                  <CardTitle className="text-orange-900">How to Use Etymology Research</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                      <span className="w-6 h-6 bg-orange-100 text-orange-700 rounded-full flex items-center justify-center text-sm font-bold">1</span>
                      Enter a Tetum Word
                    </h4>
                    <p className="text-gray-700 text-sm leading-relaxed">
                      Type any Tetum word in the search box. The system works best with common words 
                      that have historical significance or clear etymological connections.
                    </p>
                    
                    <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                      <span className="w-6 h-6 bg-orange-100 text-orange-700 rounded-full flex items-center justify-center text-sm font-bold">2</span>
                      Review Etymology Results
                    </h4>
                    <p className="text-gray-700 text-sm leading-relaxed">
                      The AI will research and provide detailed information about the word's origin, 
                      historical forms, and how its meaning has evolved over time.
                    </p>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                      <span className="w-6 h-6 bg-orange-100 text-orange-700 rounded-full flex items-center justify-center text-sm font-bold">3</span>
                      Explore Related Words
                    </h4>
                    <p className="text-gray-700 text-sm leading-relaxed">
                      Click on related words to discover linguistic connections and explore 
                      how words within the same language family have developed.
                    </p>
                    
                    <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                      <span className="w-6 h-6 bg-orange-100 text-orange-700 rounded-full flex items-center justify-center text-sm font-bold">4</span>
                      Understand Language History
                    </h4>
                    <p className="text-gray-700 text-sm leading-relaxed">
                      Use the information to better understand Tetum's linguistic heritage 
                      and its connections to Portuguese, Malay, and indigenous languages.
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
        <p className="text-sm">©2024-2025 All Rights Reserved</p>
      </footer>
    </div>
  );
}
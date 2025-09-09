import { useState } from "react";
import { ArrowLeft, Globe, Info, Search, Star, Book, Award, Languages, Zap, Users, Briefcase, Network } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ASEANTerminologySearch } from "@/components/ASEANTerminologySearch";
import { TermDetail } from "@/components/TermDetail";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { DictionaryEntry } from "@shared/schema";

const DEFAULT_USER_ID = "demo-user";

export default function ASEANTerminologyModule() {
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [selectedEntry, setSelectedEntry] = useState<DictionaryEntry | null>(null);
  const [activeTab, setActiveTab] = useState("search");

  const handleEntrySelect = (entry: DictionaryEntry) => {
    setSelectedEntry(entry);
  };

  const handleCloseDetail = () => {
    setSelectedEntry(null);
  };

  // ASEAN has 807 entries based on the previous updates
  const totalASEANEntries = 807;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-teal-50 to-emerald-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex flex-col">
      {/* Professional Header */}
      <div className="sticky top-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-green-200 dark:border-gray-700 z-10 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm" className="p-2 hover:bg-green-100 dark:hover:bg-gray-800">
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              </Link>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-teal-600 rounded-xl flex items-center justify-center">
                  <Globe className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white">ASEAN Terminology</h1>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="bg-green-50 border-green-200 text-green-700 dark:bg-green-900 dark:border-green-700 dark:text-green-300">
                {totalASEANEntries.toLocaleString()} entries
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
      <div className="bg-gradient-to-r from-green-600 via-green-700 to-teal-700 text-white py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center px-4 py-2 rounded-full text-sm bg-green-500/20 text-green-100 mb-6">
                <Network className="w-4 h-4 mr-2" />
                International Terminology
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold mb-6 leading-tight">
                ASEAN Terminology
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-300 to-teal-300 block">
                  for Tetum Translation
                </span>
              </h1>
              <p className="text-xl text-green-100 mb-8 leading-relaxed">
                Comprehensive ASEAN abbreviations and terminology with authentic Tetum translations 
                powered by Google Translate API, featuring {totalASEANEntries} official terms.
              </p>
              <div className="flex items-center space-x-8 text-green-100">
                <div>
                  <div className="text-2xl font-bold text-white">{totalASEANEntries.toLocaleString()}</div>
                  <div className="text-sm">ASEAN Terms</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">3</div>
                  <div className="text-sm">Languages</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">100%</div>
                  <div className="text-sm">Official Source</div>
                </div>
              </div>
            </div>
            <div className="lg:flex justify-center">
              <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20 max-w-md">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                    <span className="text-sm font-medium">Official ASEAN Abbreviations</span>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                    <div className="w-3 h-3 bg-teal-400 rounded-full"></div>
                    <span className="text-sm font-medium">Google Translate API</span>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                    <div className="w-3 h-3 bg-green-300 rounded-full"></div>
                    <span className="text-sm font-medium">Tetum Translations</span>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                    <div className="w-3 h-3 bg-teal-300 rounded-full"></div>
                    <span className="text-sm font-medium">International Standards</span>
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
              Search & Translate
            </TabsTrigger>
            <TabsTrigger value="about" className="flex items-center gap-2">
              <Info className="w-4 h-4" />
              About Dictionary
            </TabsTrigger>
          </TabsList>

          <TabsContent value="search" className="space-y-8">
            {/* Enhanced Search Section */}
            <Card className="border-green-200 shadow-sm">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Search className="w-5 h-5 text-green-600" />
                  <CardTitle className="text-green-900">Search ASEAN Terminology</CardTitle>
                </div>
                
              </CardHeader>
              <CardContent>
                <ASEANTerminologySearch onEntrySelect={handleEntrySelect} />
              </CardContent>
            </Card>

            {/* Selected Term Detail */}
            {selectedEntry && (
              <TermDetail
                entry={selectedEntry}
                onClose={handleCloseDetail}
                userId={DEFAULT_USER_ID}
              />
            )}
          </TabsContent>

          <TabsContent value="about" className="space-y-6">
            {/* About Section */}
            <div className="grid lg:grid-cols-2 gap-6">
              <Card className="border-green-200 shadow-sm">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Globe className="w-5 h-5 text-green-600" />
                    <CardTitle className="text-green-900">About ASEAN Terminology</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-700 leading-relaxed">
                    The ASEAN Terminology module provides comprehensive access to official ASEAN abbreviations 
                    and terms, with authentic Tetum translations powered by Google Translate API.
                  </p>
                  <p className="text-gray-700 leading-relaxed">
                    This resource contains {totalASEANEntries} official terms extracted from authentic ASEAN documentation, 
                    covering organizations, programs, initiatives, and regional cooperation mechanisms, 
                    essential for international relations and regional development work.
                  </p>
                  <div className="flex items-center gap-2 pt-2">
                    <Badge variant="outline" className="bg-blue-50 border-blue-200 text-blue-700">
                      <Award className="w-3 h-3 mr-1" />
                      Official ASEAN Source
                    </Badge>
                    <Badge variant="outline" className="bg-purple-50 border-purple-200 text-purple-700">
                      <Zap className="w-3 h-3 mr-1" />
                      AI Translation
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-green-200 shadow-sm">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-green-600" />
                    <CardTitle className="text-green-900">Key Features</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-gray-700">Official ASEAN abbreviations and terms</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                      <span className="text-gray-700">Google Translate API integration</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-gray-700">Authentic Tetum translations</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                      <span className="text-gray-700">Real-time translation capabilities</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-gray-700">Comprehensive search functionality</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                      <span className="text-gray-700">Regional cooperation focus</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Usage Guide */}
            <Card className="border-green-200 shadow-sm">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Book className="w-5 h-5 text-green-600" />
                  <CardTitle className="text-green-900">How to Use This System</CardTitle>
                </div>
                <CardDescription>
                  Learn how to search, translate, and utilize ASEAN terminology effectively
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-gray-900 flex items-center gap-2 mb-3">
                        <span className="w-6 h-6 bg-green-100 text-green-700 rounded-full flex items-center justify-center text-sm font-bold">1</span>
                        Search ASEAN Terms
                      </h4>
                      <p className="text-gray-700 text-sm leading-relaxed">
                        Enter ASEAN abbreviations or terms in the search box. The system provides predictive 
                        suggestions and matches official ASEAN terminology.
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-gray-900 flex items-center gap-2 mb-3">
                        <span className="w-6 h-6 bg-green-100 text-green-700 rounded-full flex items-center justify-center text-sm font-bold">2</span>
                        View Full Forms
                      </h4>
                      <p className="text-gray-700 text-sm leading-relaxed">
                        Click on any abbreviation to see its full form in English and the corresponding 
                        Tetum translation powered by Google Translate API.
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-gray-900 flex items-center gap-2 mb-3">
                        <span className="w-6 h-6 bg-green-100 text-green-700 rounded-full flex items-center justify-center text-sm font-bold">3</span>
                        Use Translation Feature
                      </h4>
                      <p className="text-gray-700 text-sm leading-relaxed">
                        Access real-time translation between English, Tetum, and Portuguese for any 
                        ASEAN-related content using the integrated Google Translate API.
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-gray-900 flex items-center gap-2 mb-3">
                        <span className="w-6 h-6 bg-green-100 text-green-700 rounded-full flex items-center justify-center text-sm font-bold">4</span>
                        Professional Applications
                      </h4>
                      <p className="text-gray-700 text-sm leading-relaxed">
                        Use these translations for diplomatic communications, regional cooperation documents, 
                        and international relations work in Timor-Leste.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Professional Use Cases */}
            <Card className="border-green-200 shadow-sm">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-green-600" />
                  <CardTitle className="text-green-900">Professional Applications</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <Briefcase className="w-6 h-6 text-green-600" />
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">Diplomats & Officials</h4>
                    <p className="text-sm text-gray-600">
                      Essential for diplomatic communications and regional cooperation initiatives
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <Languages className="w-6 h-6 text-teal-600" />
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">Translators & Interpreters</h4>
                    <p className="text-sm text-gray-600">
                      Accurate ASEAN terminology for international conferences and documents
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <Globe className="w-6 h-6 text-green-600" />
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">International Relations</h4>
                    <p className="text-sm text-gray-600">
                      Critical resource for regional development and cooperation programs
                    </p>
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
          <p className="text-sm">All Rights Reserved  ©Liantek 2025 </p>
        </div>
      </footer>
    </div>
  );
}
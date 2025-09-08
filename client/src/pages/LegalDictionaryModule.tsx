import { useState } from "react";
import { ArrowLeft, Scale, Info, Search, Star, Book, Award, Globe, Shield, Users, FileText, BookOpen, Gavel } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LegalDictionarySearch } from "@/components/LegalDictionarySearch";
import { TetumGlossarySearch } from "@/components/TetumGlossarySearch";
import { PortugueseGlossarySearch } from "@/components/PortugueseGlossarySearch";
import { TermDetail } from "@/components/TermDetail";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { EnhancedTermDetail } from "@/components/EnhancedTermDetail";
import { useDictionaryStats } from "@/lib/search";
import { DictionaryEntry } from "@shared/schema";

export default function LegalDictionaryModule() {
  const [selectedEntry, setSelectedEntry] = useState<DictionaryEntry | null>(null);
  const [showEnhancedDetail, setShowEnhancedDetail] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [activeTab, setActiveTab] = useState("search");
  const [activeGlossary, setActiveGlossary] = useState("legal");
  const { data: stats } = useDictionaryStats();

  const handleEntrySelect = (entry: DictionaryEntry) => {
    setSelectedEntry(entry);
  };

  const handleEnhancedAnalysis = (entry: DictionaryEntry) => {
    setSelectedEntry(entry);
    setShowEnhancedDetail(true);
  };

  const handleCloseDetail = () => {
    setSelectedEntry(null);
  };

  const totalLegalEntries = (stats?.legal || 0) + (stats?.["tetum-glossary"] || 0) + (stats?.["portuguese-glossary"] || 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-slate-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex flex-col">
      {/* Professional Header */}
      <div className="sticky top-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-blue-200 dark:border-gray-700 z-10 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm" className="p-2 hover:bg-blue-100 dark:hover:bg-gray-800">
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              </Link>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                  <Scale className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white">Tetum Legal Dictionary</h1>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900 dark:border-blue-700 dark:text-blue-300">
                {totalLegalEntries.toLocaleString()} entries
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
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center px-4 py-2 rounded-full text-sm bg-blue-500/20 text-blue-100 mb-6">
                <Gavel className="w-4 h-4 mr-2" />
                Legal Terminology
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold mb-6 leading-tight">
                Legal Tetum
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-indigo-300 block">
                  Dictionary
                </span>
              </h1>
              <p className="text-xl text-blue-100 mb-8 leading-relaxed">
                Comprehensive legal terminology resource with over {totalLegalEntries.toLocaleString()} legal terms 
                in Tetum, Portuguese, and English, essential for legal professionals and students.
              </p>
              <div className="flex items-center space-x-8 text-blue-100">
                <div>
                  <div className="text-2xl font-bold text-white">{totalLegalEntries.toLocaleString()}</div>
                  <div className="text-sm">Legal Terms</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">3</div>
                  <div className="text-sm">Languages</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">100%</div>
                  <div className="text-sm">Legal Focus</div>
                </div>
              </div>
            </div>
            <div className="lg:flex justify-center">
              <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20 max-w-md">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                    <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                    <span className="text-sm font-medium">Tetum Legal Dictionary</span>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                    <div className="w-3 h-3 bg-indigo-400 rounded-full"></div>
                    <span className="text-sm font-medium">Tetum Legal Glossary</span>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                    <div className="w-3 h-3 bg-blue-300 rounded-full"></div>
                    <span className="text-sm font-medium">Portuguese Glossary</span>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                    <div className="w-3 h-3 bg-indigo-300 rounded-full"></div>
                    <span className="text-sm font-medium">Constitutional Terms</span>
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
            {/* Glossary Selection */}
            <Card className="border-blue-200 shadow-sm">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Search className="w-5 h-5 text-blue-600" />
                  <CardTitle className="text-blue-900">Search Legal Terminology</CardTitle>
                </div>
                <CardDescription>
                  Choose from {totalLegalEntries.toLocaleString()} legal terms across three comprehensive resources
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4 mb-6">
                  <Button
                    variant={activeGlossary === "legal" ? "default" : "outline"}
                    onClick={() => setActiveGlossary("legal")}
                    className="flex items-center gap-2"
                  >
                    <Scale className="w-4 h-4" />
                    Legal Dictionary ({stats?.legal || 0})
                  </Button>
                  <Button
                    variant={activeGlossary === "tetum" ? "default" : "outline"}
                    onClick={() => setActiveGlossary("tetum")}
                    className="flex items-center gap-2"
                  >
                    <BookOpen className="w-4 h-4" />
                    Tetum Glossary ({stats?.["tetum-glossary"] || 0})
                  </Button>
                  <Button
                    variant={activeGlossary === "portuguese" ? "default" : "outline"}
                    onClick={() => setActiveGlossary("portuguese")}
                    className="flex items-center gap-2"
                  >
                    <FileText className="w-4 h-4" />
                    Portuguese Glossary ({stats?.["portuguese-glossary"] || 0})
                  </Button>
                </div>

                {/* Search Components */}
                {activeGlossary === "legal" && (
                  <LegalDictionarySearch 
                    onEntrySelect={handleEntrySelect}
                    selectedLanguage={selectedLanguage}
                    onEnhancedAnalysis={handleEnhancedAnalysis}
                  />
                )}
                {activeGlossary === "tetum" && (
                  <TetumGlossarySearch onEntrySelect={handleEntrySelect} />
                )}
                {activeGlossary === "portuguese" && (
                  <PortugueseGlossarySearch onEntrySelect={handleEntrySelect} />
                )}
              </CardContent>
            </Card>

            {/* Selected Word Detail */}
            {selectedEntry && !showEnhancedDetail && (
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
              <Card className="border-blue-200 shadow-sm">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Scale className="w-5 h-5 text-blue-600" />
                    <CardTitle className="text-blue-900">About This Dictionary</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-700 leading-relaxed">
                    The Tetum Legal Dictionary provides comprehensive legal terminology in Tetum, Portuguese, and English, 
                    serving legal professionals, law students, and anyone working within Timor-Leste's legal system.
                  </p>
                  <p className="text-gray-700 leading-relaxed">
                    This resource combines three essential legal references: the main Legal Dictionary with constitutional terms, 
                    a Tetum Legal Glossary with detailed explanations, and a Portuguese Legal Glossary, 
                    totaling over {totalLegalEntries.toLocaleString()} entries.
                  </p>
                  <div className="flex items-center gap-2 pt-2">
                    <Badge variant="outline" className="bg-green-50 border-green-200 text-green-700">
                      <Award className="w-3 h-3 mr-1" />
                      Official Sources
                    </Badge>
                    <Badge variant="outline" className="bg-purple-50 border-purple-200 text-purple-700">
                      <Globe className="w-3 h-3 mr-1" />
                      Trilingual Content
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-blue-200 shadow-sm">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-blue-600" />
                    <CardTitle className="text-blue-900">Key Features</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-gray-700">Constitutional and legal terminology</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                      <span className="text-gray-700">Tetum, Portuguese, and English coverage</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-gray-700">Detailed legal explanations</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                      <span className="text-gray-700">Enhanced analysis capabilities</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-gray-700">Professional legal focus</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                      <span className="text-gray-700">Advanced search across all resources</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Usage Guide */}
            <Card className="border-blue-200 shadow-sm">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Book className="w-5 h-5 text-blue-600" />
                  <CardTitle className="text-blue-900">How to Use This Dictionary</CardTitle>
                </div>
                <CardDescription>
                  Learn how to navigate and use the comprehensive legal terminology resources
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-gray-900 flex items-center gap-2 mb-3">
                        <span className="w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-sm font-bold">1</span>
                        Select Dictionary Type
                      </h4>
                      <p className="text-gray-700 text-sm leading-relaxed">
                        Choose from three legal resources: Legal Dictionary (constitutional terms), 
                        Tetum Glossary (detailed explanations), or Portuguese Glossary (Portuguese legal terms).
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-gray-900 flex items-center gap-2 mb-3">
                        <span className="w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-sm font-bold">2</span>
                        Search Legal Terms
                      </h4>
                      <p className="text-gray-700 text-sm leading-relaxed">
                        Enter legal terms in Tetum, Portuguese, or English. The system provides predictive 
                        suggestions and cross-language matching for comprehensive results.
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-gray-900 flex items-center gap-2 mb-3">
                        <span className="w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-sm font-bold">3</span>
                        View Definitions
                      </h4>
                      <p className="text-gray-700 text-sm leading-relaxed">
                        Click on any term to see its definition, context, and usage. Some terms offer 
                        enhanced analysis with detailed legal explanations and related concepts.
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-gray-900 flex items-center gap-2 mb-3">
                        <span className="w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-sm font-bold">4</span>
                        Enhanced Features
                      </h4>
                      <p className="text-gray-700 text-sm leading-relaxed">
                        Use the enhanced analysis feature for deeper legal insights, language switching 
                        for interface preferences, and cross-reference terms across all resources.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Professional Use Cases */}
            <Card className="border-blue-200 shadow-sm">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  <CardTitle className="text-blue-900">Professional Applications</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <Gavel className="w-6 h-6 text-blue-600" />
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">Legal Professionals</h4>
                    <p className="text-sm text-gray-600">
                      Essential for lawyers, judges, and legal practitioners working in Timor-Leste
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <BookOpen className="w-6 h-6 text-indigo-600" />
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">Law Students</h4>
                    <p className="text-sm text-gray-600">
                      Comprehensive study resource for legal education in multiple languages
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <Shield className="w-6 h-6 text-blue-600" />
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">Legal Interpreters</h4>
                    <p className="text-sm text-gray-600">
                      Critical for accurate legal translation and court proceedings
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Enhanced Term Detail Modal */}
      {showEnhancedDetail && selectedEntry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-6xl max-h-[90vh] overflow-y-auto">
            <EnhancedTermDetail
              entry={selectedEntry}
              onClose={() => setShowEnhancedDetail(false)}
              userId="guest"
            />
          </div>
        </div>
      )}
      
      {/* Footer */}
      <footer className="bg-gray-900 text-white py-6 text-center">
        <div className="max-w-6xl mx-auto px-4">
          <p className="text-sm">All Rights Reserved©Liantek, 2025, Timor-Leste</p>
          <p className="text-xs text-gray-400 mt-1">Tetum Legal Dictionary - Supporting Legal Communication</p>
        </div>
      </footer>
    </div>
  );
}
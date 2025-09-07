import { useState } from "react";
import { ArrowLeft, Stethoscope, Info, Search, Star, Book, Award, Globe, Heart, Activity, Shield, Users } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MedicalDictionarySearch } from "@/components/MedicalDictionarySearch";
import { TermDetail } from "@/components/TermDetail";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useDictionaryStats } from "@/lib/search";
import { DictionaryEntry } from "@shared/schema";

export default function MedicalDictionaryModule() {
  const [selectedEntry, setSelectedEntry] = useState<DictionaryEntry | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [activeTab, setActiveTab] = useState("search");
  const { data: stats } = useDictionaryStats();

  const handleEntrySelect = (entry: DictionaryEntry) => {
    setSelectedEntry(entry);
  };

  const handleCloseDetail = () => {
    setSelectedEntry(null);
  };

  const totalMedicalEntries = stats?.medical || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-pink-50 to-rose-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex flex-col">
      {/* Professional Header */}
      <div className="sticky top-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-red-200 dark:border-gray-700 z-10 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm" className="p-2 hover:bg-red-100 dark:hover:bg-gray-800">
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              </Link>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-pink-600 rounded-xl flex items-center justify-center">
                  <Stethoscope className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white">Tetum Medical Dictionary</h1>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="bg-red-50 border-red-200 text-red-700 dark:bg-red-900 dark:border-red-700 dark:text-red-300">
                {totalMedicalEntries.toLocaleString()} entries
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
      <div className="bg-gradient-to-r from-red-600 via-red-700 to-pink-700 text-white py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center px-4 py-2 rounded-full text-sm bg-red-500/20 text-red-100 mb-6">
                <Heart className="w-4 h-4 mr-2" />
                Healthcare Terminology
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold mb-6 leading-tight">
                Disionáriu Médiku
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-300 to-pink-300 block">
                  Tetum-English
                </span>
              </h1>
              <p className="text-xl text-red-100 mb-8 leading-relaxed">
                Comprehensive medical terminology dictionary with over {totalMedicalEntries.toLocaleString()} authentic 
                Tetum-English medical terms, essential for healthcare professionals and students.
              </p>
              <div className="flex items-center space-x-8 text-red-100">
                <div>
                  <div className="text-2xl font-bold text-white">{totalMedicalEntries.toLocaleString()}</div>
                  <div className="text-sm">Medical Terms</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">2</div>
                  <div className="text-sm">Languages</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">100%</div>
                  <div className="text-sm">Healthcare Focus</div>
                </div>
              </div>
            </div>
            <div className="lg:flex justify-center">
              <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20 max-w-md">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                    <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                    <span className="text-sm font-medium">Tetum Medical Terms</span>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                    <div className="w-3 h-3 bg-pink-400 rounded-full"></div>
                    <span className="text-sm font-medium">English Translations</span>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                    <div className="w-3 h-3 bg-red-300 rounded-full"></div>
                    <span className="text-sm font-medium">Healthcare Context</span>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                    <div className="w-3 h-3 bg-pink-300 rounded-full"></div>
                    <span className="text-sm font-medium">Professional Use</span>
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
            <Card className="border-red-200 shadow-sm">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Search className="w-5 h-5 text-red-600" />
                  <CardTitle className="text-red-900">Search Medical Dictionary</CardTitle>
                </div>
                <CardDescription>
                  Search through {totalMedicalEntries.toLocaleString()} authentic Tetum medical terms and English translations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <MedicalDictionarySearch 
                  onEntrySelect={handleEntrySelect} 
                  selectedLanguage={selectedLanguage}
                />
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
              <Card className="border-red-200 shadow-sm">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Stethoscope className="w-5 h-5 text-red-600" />
                    <CardTitle className="text-red-900">About This Dictionary</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-700 leading-relaxed">
                    The Tetum Medical Dictionary provides essential medical terminology in both Tetum and English, 
                    serving healthcare professionals, medical students, and anyone working in Timor-Leste's healthcare sector.
                  </p>
                  <p className="text-gray-700 leading-relaxed">
                    This comprehensive resource contains over {totalMedicalEntries.toLocaleString()} medical terms, 
                    covering anatomy, medical procedures, diseases, treatments, and healthcare terminology essential 
                    for effective medical communication in Tetum and English.
                  </p>
                  <div className="flex items-center gap-2 pt-2">
                    <Badge variant="outline" className="bg-green-50 border-green-200 text-green-700">
                      <Award className="w-3 h-3 mr-1" />
                      Medical Focus
                    </Badge>
                    <Badge variant="outline" className="bg-blue-50 border-blue-200 text-blue-700">
                      <Globe className="w-3 h-3 mr-1" />
                      Bilingual Content
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-red-200 shadow-sm">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-red-600" />
                    <CardTitle className="text-red-900">Key Features</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <span className="text-gray-700">Comprehensive medical terminology</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                      <span className="text-gray-700">Tetum and English translations</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <span className="text-gray-700">Healthcare professional focus</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                      <span className="text-gray-700">Advanced search functionality</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <span className="text-gray-700">Mobile-friendly design</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                      <span className="text-gray-700">Authentic medical content</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Usage Guide */}
            <Card className="border-red-200 shadow-sm">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Book className="w-5 h-5 text-red-600" />
                  <CardTitle className="text-red-900">How to Use This Dictionary</CardTitle>
                </div>
                <CardDescription>
                  Learn how to effectively search and use this medical terminology resource
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-gray-900 flex items-center gap-2 mb-3">
                        <span className="w-6 h-6 bg-red-100 text-red-700 rounded-full flex items-center justify-center text-sm font-bold">1</span>
                        Search Medical Terms
                      </h4>
                      <p className="text-gray-700 text-sm leading-relaxed">
                        Type medical terms in either Tetum or English in the search box. The system will show 
                        matching entries as you type, helping you find the exact terminology you need.
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-gray-900 flex items-center gap-2 mb-3">
                        <span className="w-6 h-6 bg-red-100 text-red-700 rounded-full flex items-center justify-center text-sm font-bold">2</span>
                        View Translations
                      </h4>
                      <p className="text-gray-700 text-sm leading-relaxed">
                        Click on any term from the search results to see its complete translation 
                        and medical context in both Tetum and English languages.
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-gray-900 flex items-center gap-2 mb-3">
                        <span className="w-6 h-6 bg-red-100 text-red-700 rounded-full flex items-center justify-center text-sm font-bold">3</span>
                        Healthcare Applications
                      </h4>
                      <p className="text-gray-700 text-sm leading-relaxed">
                        Use these terms in clinical settings, medical education, patient communication, 
                        and healthcare documentation to ensure accurate medical communication.
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-gray-900 flex items-center gap-2 mb-3">
                        <span className="w-6 h-6 bg-red-100 text-red-700 rounded-full flex items-center justify-center text-sm font-bold">4</span>
                        Switch Languages
                      </h4>
                      <p className="text-gray-700 text-sm leading-relaxed">
                        Use the language switcher to change the interface language and optimize 
                        your search experience for either Tetum or English terminology.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Professional Use Cases */}
            <Card className="border-red-200 shadow-sm">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-red-600" />
                  <CardTitle className="text-red-900">Professional Use Cases</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <Activity className="w-6 h-6 text-red-600" />
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">Healthcare Professionals</h4>
                    <p className="text-sm text-gray-600">
                      Essential for doctors, nurses, and medical staff providing care in Timor-Leste
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <Book className="w-6 h-6 text-pink-600" />
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">Medical Students</h4>
                    <p className="text-sm text-gray-600">
                      Study aid for medical terminology in both Tetum and English languages
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <Shield className="w-6 h-6 text-red-600" />
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">Healthcare Interpreters</h4>
                    <p className="text-sm text-gray-600">
                      Critical resource for accurate medical translation and patient communication
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
          <p className="text-sm">All Rights Reserved©Liantek, 2025, Timor-Leste</p>
          <p className="text-xs text-gray-400 mt-1">Tetum Medical Dictionary - Supporting Healthcare Communication</p>
        </div>
      </footer>
    </div>
  );
}
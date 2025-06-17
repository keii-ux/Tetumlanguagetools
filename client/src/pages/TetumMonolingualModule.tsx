import { useState } from "react";
import { ArrowLeft, BookOpen, Languages, FileText, BookMarked } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TetumMonolingualSearch } from "@/components/TetumMonolingualSearch";
import { TermDetail } from "@/components/TermDetail";
import { useDictionaryStats } from "@/lib/search";
import { DictionaryEntry } from "@shared/schema";

export default function TetumMonolingualModule() {
  const [selectedEntry, setSelectedEntry] = useState<DictionaryEntry | null>(null);
  const [activeSection, setActiveSection] = useState("monolingual");
  const { data: stats } = useDictionaryStats();

  const handleEntrySelect = (entry: DictionaryEntry) => {
    setSelectedEntry(entry);
  };

  const tetumMonoCount = stats?.["tetum-monolingual"] || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Fila ba Disionáriu
              </Button>
            </Link>
            <div className="h-6 w-px bg-slate-300" />
            <div className="flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-orange-600" />
              <h1 className="text-2xl font-bold text-slate-900">Disionáriu Tetum Monolíngue</h1>
            </div>
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
                  <div className="text-sm text-slate-600">Definisaun Tetum</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white border-orange-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <FileText className="w-8 h-8 text-orange-600" />
                <div>
                  <div className="text-2xl font-bold text-slate-900">100%</div>
                  <div className="text-sm text-slate-600">Lian Tetum</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white border-orange-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <BookMarked className="w-8 h-8 text-orange-600" />
                <div>
                  <div className="text-2xl font-bold text-slate-900">Nativu</div>
                  <div className="text-sm text-slate-600">Definisaun sira</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Dictionary Sections */}
        <Tabs value={activeSection} onValueChange={setActiveSection} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="monolingual">Disionáriu Tetum</TabsTrigger>
            <TabsTrigger value="bilingual">Tetum-English</TabsTrigger>
            <TabsTrigger value="multilingual">Tetum Multilingual</TabsTrigger>
          </TabsList>

          <TabsContent value="monolingual" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Search Section */}
              <div className="lg:col-span-2">
                <Card className="bg-white border-orange-200">
                  <CardContent className="p-6">
                    <TetumMonolingualSearch onEntrySelect={handleEntrySelect} />
                  </CardContent>
                </Card>
              </div>

              {/* Term Detail Section */}
              <div className="lg:col-span-1">
                {selectedEntry ? (
                  <TermDetail 
                    entry={selectedEntry} 
                    onClose={() => setSelectedEntry(null)}
                    userId="anonymous"
                  />
                ) : (
                  <Card className="bg-white border-orange-200">
                    <CardContent className="p-6">
                      <div className="text-center space-y-4">
                        <BookOpen className="w-12 h-12 text-orange-400 mx-auto" />
                        <div>
                          <h3 className="text-lg font-semibold text-slate-900 mb-2">
                            Hili Liafuan Tetum
                          </h3>
                          <p className="text-slate-600 text-sm">
                            Buka no klik ba liafuan Tetum ruma atu haree nia definisaun detalladu no ezemplu uza iha lian Tetum.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="bilingual" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <Card className="bg-white border-orange-200">
                  <CardContent className="p-6">
                    <div className="text-center space-y-4">
                      <Languages className="w-16 h-16 text-orange-400 mx-auto" />
                      <div>
                        <h3 className="text-xl font-semibold text-slate-900 mb-3">
                          Tetum-English Dictionary
                        </h3>
                        <p className="text-slate-600">
                          Search for Tetum words with English translations and definitions.
                        </p>
                      </div>
                      <div className="bg-orange-50 p-4 rounded-lg">
                        <p className="text-sm text-orange-800">
                          This section provides Tetum words with their English equivalents, 
                          helping bridge language understanding between Tetum and English speakers.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              <div className="lg:col-span-1">
                <Card className="bg-white border-orange-200">
                  <CardContent className="p-6">
                    <div className="text-center space-y-4">
                      <FileText className="w-12 h-12 text-orange-400 mx-auto" />
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900 mb-2">
                          Bilingual Support
                        </h3>
                        <p className="text-slate-600 text-sm">
                          Access comprehensive Tetum-English dictionary with cultural context and linguistic notes.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="multilingual" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <Card className="bg-white border-orange-200">
                  <CardContent className="p-6">
                    <div className="text-center space-y-4">
                      <Languages className="w-16 h-16 text-orange-400 mx-auto" />
                      <div>
                        <h3 className="text-xl font-semibold text-slate-900 mb-3">
                          Multilingual Tetum Dictionary
                        </h3>
                        <p className="text-slate-600">
                          Comprehensive Tetum dictionary with Portuguese, English, and Indonesian translations.
                        </p>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                        <div className="bg-blue-50 p-3 rounded-lg">
                          <h4 className="font-semibold text-blue-900 mb-1">Portuguese</h4>
                          <p className="text-xs text-blue-700">Colonial heritage translations</p>
                        </div>
                        <div className="bg-green-50 p-3 rounded-lg">
                          <h4 className="font-semibold text-green-900 mb-1">English</h4>
                          <p className="text-xs text-green-700">International communication</p>
                        </div>
                        <div className="bg-purple-50 p-3 rounded-lg">
                          <h4 className="font-semibold text-purple-900 mb-1">Indonesian</h4>
                          <p className="text-xs text-purple-700">Regional linguistic ties</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              <div className="lg:col-span-1">
                <Card className="bg-white border-orange-200">
                  <CardContent className="p-6">
                    <div className="text-center space-y-4">
                      <BookMarked className="w-12 h-12 text-orange-400 mx-auto" />
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900 mb-2">
                          Regional Context
                        </h3>
                        <p className="text-slate-600 text-sm">
                          Understanding Tetum through its linguistic relationships with neighboring languages and colonial influences.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        
      </div>
    </div>
  );
}
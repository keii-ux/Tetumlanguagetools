import { useState } from "react";
import { ArrowLeft, BookOpen, Languages, FileText, BookMarked, Search, Globe } from "lucide-react";
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
  const [activeSection, setActiveSection] = useState("tetum-monolingual");
  const { data: stats } = useDictionaryStats();

  const handleEntrySelect = (entry: DictionaryEntry) => {
    setSelectedEntry(entry);
  };

  const tetumMonoCount = stats?.["tetum-monolingual"] || 0;
  const portugalLegalCount = stats?.["portuguese-legal"] || 0;

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
          <Badge variant="secondary" className="bg-orange-100 text-orange-800">
            {tetumMonoCount.toLocaleString()} liafuan
          </Badge>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-white border-orange-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Languages className="w-8 h-8 text-orange-600" />
                <div>
                  <div className="text-2xl font-bold text-slate-900">
                    {tetumMonoCount.toLocaleString()}
                  </div>
                  <div className="text-sm text-slate-600">Liafuan Tetum</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white border-orange-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <FileText className="w-8 h-8 text-orange-600" />
                <div>
                  <div className="text-2xl font-bold text-slate-900">
                    {portugalLegalCount.toLocaleString()}
                  </div>
                  <div className="text-sm text-slate-600">Termos Jurídicos</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white border-orange-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Globe className="w-8 h-8 text-orange-600" />
                <div>
                  <div className="text-2xl font-bold text-slate-900">3</div>
                  <div className="text-sm text-slate-600">Lian sira</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white border-orange-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <BookMarked className="w-8 h-8 text-orange-600" />
                <div>
                  <div className="text-2xl font-bold text-slate-900">Kompletu</div>
                  <div className="text-sm text-slate-600">Definisaun sira</div>
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
                <Tabs value={activeSection} onValueChange={setActiveSection}>
                  <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="tetum-monolingual" className="flex items-center gap-2">
                      <Languages className="w-4 h-4" />
                      Disionáriu Tetum
                    </TabsTrigger>
                    <TabsTrigger value="portuguese-legal" className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Termos Jurídicos PT
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="tetum-monolingual">
                    <TetumMonolingualSearch onEntrySelect={handleEntrySelect} />
                  </TabsContent>

                  <TabsContent value="portuguese-legal">
                    <div className="space-y-6">
                      <div className="text-center space-y-2">
                        <div className="flex items-center justify-center gap-2">
                          <FileText className="w-6 h-6 text-orange-600" />
                          <h2 className="text-2xl font-bold text-slate-900">Termos Jurídicos Portugueses</h2>
                        </div>
                        <p className="text-slate-600">
                          Dicionário completo de termos jurídicos em português
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                          <input
                            type="text"
                            placeholder="Procurar termos jurídicos..."
                            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          />
                        </div>
                        <Button className="bg-orange-600 hover:bg-orange-700">
                          Procurar
                        </Button>
                      </div>

                      <div className="text-center text-slate-600">
                        {portugalLegalCount.toLocaleString()} termos jurídicos disponíveis
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Term Detail Section */}
          <div className="lg:col-span-1">
            {selectedEntry ? (
              <TermDetail 
                entry={selectedEntry} 
                onClose={() => setSelectedEntry(null)}
                userId="anonymous"  // You can implement proper user management
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

        {/* About Section */}
        <Card className="mt-8 bg-white border-orange-200">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-3">
                  Kona-ba Disionáriu Tetum Monolíngue
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Disionáriu kompletu ne'e fó definisaun no esplikasaun liafuan Tetum nian iha lian Tetum rasik. 
                  Halo atu ajuda ema Tetum-oan sira no estudante nivel aas sira atu komprende liafuan sira 
                  iha sira-nia kontestu kultural no linguístiku.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-3">
                  Karakterístika sira
                </h3>
                <ul className="text-slate-600 text-sm space-y-1">
                  <li>• Definisaun Tetum nativu</li>
                  <li>• Identifikasaun klase liafuan nian</li>
                  <li>• Ezemplu uza no kontestu</li>
                  <li>• Nota kultural no linguístiku</li>
                  <li>• Kapasidade buka avansadu</li>
                  <li>• {tetumMonoCount.toLocaleString()} liafuan Tetum auténtiku</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
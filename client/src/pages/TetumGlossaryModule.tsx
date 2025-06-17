import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TetumGlossarySearch } from "@/components/TetumGlossarySearch";
import { TermDetail } from "@/components/TermDetail";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import type { DictionaryEntry } from "@shared/schema";

export default function TetumGlossaryModule() {
  const [selectedEntry, setSelectedEntry] = useState<DictionaryEntry | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState("tet");

  const handleEntrySelect = (entry: DictionaryEntry) => {
    setSelectedEntry(entry);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex justify-between items-start">
          <Link href="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dictionary
            </Button>
          </Link>
          <LanguageSwitcher 
            selectedLanguage={selectedLanguage}
            onLanguageChange={setSelectedLanguage}
          />
        </div>
          
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Glosáriu Legál Tetum
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Glosáriu komprehensivu ho termu legál importante sira ho esplikasaun detalhadu iha lian Tetum. 
            Inklui termu husi Konstituisaun RDTL, lei sira, no dokumentu legál seluk.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <TetumGlossarySearch onEntrySelect={handleEntrySelect} />
            
            <Card className="mt-8">
              <CardHeader>
                <CardTitle>Deskripsaun</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-gray-700 dark:text-gray-300">
                    Glosáriu ida ne'e inklui termu legál importante sira ne'ebé uza barak iha dokumentu 
                    legál no konstituisaun Timor-Leste nian. Kada termu hetan esplikasaun klaru iha lian Tetum 
                    atu ajuda ema sira komprende diak liu asuntu legál sira.
                  </p>
                  
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
                      Oinsá atu uza:
                    </h4>
                    <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                      <li>• Hakerek liafuan ida iha kaixa buka</li>
                      <li>• Hili termu husi lista ne'ebé mosu</li>
                      <li>• Lee esplikasaun detalhadu iha sorin loos</li>
                      <li>• Uza termu sira-ne'e atu komprende dokumentu legál</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            {selectedEntry ? (
              <TermDetail
                entry={selectedEntry}
                onClose={() => setSelectedEntry(null)}
                userId="guest"
              />
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Detalhe Termu</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                      <ArrowLeft className="w-8 h-8 text-gray-400 transform rotate-180" />
                    </div>
                    <p className="text-gray-500 dark:text-gray-400">
                      Hili termu ida husi lista atu haree esplikasaun detalhadu
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
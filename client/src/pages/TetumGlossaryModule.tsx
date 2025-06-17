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
              Fila ba página prinsipal
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="text-blue-600 dark:text-blue-400">
                  Buka Termu Legál
                </CardTitle>
              </CardHeader>
              <CardContent>
                <TetumGlossarySearch onEntrySelect={handleEntrySelect} />
              </CardContent>
            </Card>
          </div>

          <div>
            {selectedEntry ? (
              <TermDetail
                entry={selectedEntry}
                onClose={() => setSelectedEntry(null)}
                userId="user-1"
              />
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="text-gray-600 dark:text-gray-400">
                    Hili Liafuan
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">📚</div>
                    <p className="text-gray-500 dark:text-gray-400">
                      Hili termu legál ida husi kaixa buka atu haree esplikasaun detalhadu
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-green-600 dark:text-green-400">
                Kona-ba Glosáriu Ne'e
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Glosáriu Legál Tetum ne'e koleksaun termu legál importante sira ho esplikasaun klaru iha lian Tetum. 
                Nia ajuda estudante direitu, advogadu, no sidadaun komun atu komprende termu legál ne'ebé uza iha sistema justisa Timor-Leste.
              </p>
              <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-300 space-y-1">
                <li>470+ termu legál ho esplikasaun detalhadu</li>
                <li>Termu husi Konstituisaun RDTL</li>
                <li>Termu husi Kódigu Sivíl no Kódigu Penál</li>
                <li>Termu husi lei administrativu</li>
                <li>Buka avansadu ho previsaun</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-purple-600 dark:text-purple-400">
                Oinsá Uza
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
                <div className="flex items-start gap-3">
                  <div className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                    1
                  </div>
                  <p>Hakerek termu legál ne'ebé ita buka iha kaixa buka</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                    2
                  </div>
                  <p>Hili termu husi lista sujestão ne'ebé mosu</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                    3
                  </div>
                  <p>Lee esplikasaun detalhadu iha sorin loos</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                    4
                  </div>
                  <p>Uza informasaun sira ba estudu ka trabalhu</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
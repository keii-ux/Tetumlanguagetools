import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PortugueseGlossarySearch } from "@/components/PortugueseGlossarySearch";
import { TermDetail } from "@/components/TermDetail";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import type { DictionaryEntry } from "@shared/schema";

export default function PortugueseGlossaryModule() {
  const [selectedEntry, setSelectedEntry] = useState<DictionaryEntry | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState("pt");

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
              Dictionary
            </Button>
          </Link>
          <LanguageSwitcher 
            selectedLanguage={selectedLanguage}
            onLanguageChange={setSelectedLanguage}
          />
        </div>
          
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Glossário Jurídico Português
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Glossário abrangente com terminologia jurídica importante em português. 
            Inclui termos da Constituição, códigos legais e outros documentos jurídicos relevantes.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <PortugueseGlossarySearch onEntrySelect={handleEntrySelect} />
            
            <Card className="mt-8">
              <CardHeader>
                <CardTitle>Descrição</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-gray-700 dark:text-gray-300">
                    Este glossário inclui termos jurídicos importantes amplamente utilizados em 
                    documentos legais e na constituição de Timor-Leste. Cada termo possui uma 
                    explicação clara em português para ajudar na compreensão de assuntos legais.
                  </p>
                  
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
                      Como usar:
                    </h4>
                    <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                      <li>• Digite uma palavra na caixa de pesquisa</li>
                      <li>• Selecione um termo da lista que aparece</li>
                      <li>• Leia a explicação detalhada no painel lateral</li>
                      <li>• Use estes termos para compreender documentos legais</li>
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
                  <CardTitle>Detalhes do Termo</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                      <ArrowLeft className="w-8 h-8 text-gray-400 transform rotate-180" />
                    </div>
                    <p className="text-gray-500 dark:text-gray-400">
                      Selecione um termo da lista para ver a explicação detalhada
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="bg-gray-900 text-white py-4 text-center">
        <p className="text-sm">All Rights Reserved©Liantek, 2025, Timor-Leste</p>
      </footer>
    </div>
  );
}
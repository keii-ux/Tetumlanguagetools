import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PortugueseGlossarySearch } from "@/components/PortugueseGlossarySearch";
import { TermDetail } from "@/components/TermDetail";
import type { DictionaryEntry } from "@shared/schema";

export default function PortugueseGlossaryModule() {
  const [selectedEntry, setSelectedEntry] = useState<DictionaryEntry | null>(null);

  const handleEntrySelect = (entry: DictionaryEntry) => {
    setSelectedEntry(entry);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar à página principal
            </Button>
          </Link>
          
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Glossário Jurídico Português
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Glossário abrangente com termos jurídicos importantes e definições claras em português. 
              Inclui terminologia do direito civil, penal, constitucional, administrativo e outras áreas do direito.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="text-blue-600 dark:text-blue-400">
                  Pesquisar Termos Jurídicos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <PortugueseGlossarySearch onEntrySelect={handleEntrySelect} />
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
                    Selecionar Termo
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">⚖️</div>
                    <p className="text-gray-500 dark:text-gray-400">
                      Selecione um termo jurídico da pesquisa para ver a definição detalhada
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
                Sobre Este Glossário
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                O Glossário Jurídico Português é uma coleção de termos jurídicos importantes com definições claras em português. 
                Ajuda estudantes de direito, advogados e cidadãos em geral a compreender a terminologia jurídica utilizada no sistema legal.
              </p>
              <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-300 space-y-1">
                <li>Termos jurídicos com definições detalhadas</li>
                <li>Terminologia do direito civil e penal</li>
                <li>Termos do direito constitucional</li>
                <li>Terminologia do direito administrativo</li>
                <li>Pesquisa avançada com previsão</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-purple-600 dark:text-purple-400">
                Como Usar
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
                <div className="flex items-start gap-3">
                  <div className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                    1
                  </div>
                  <p>Digite o termo jurídico que procura na caixa de pesquisa</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                    2
                  </div>
                  <p>Selecione o termo da lista de sugestões que aparecem</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                    3
                  </div>
                  <p>Leia a definição detalhada no painel da direita</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                    4
                  </div>
                  <p>Use as informações para estudos ou trabalho</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
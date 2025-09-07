import { useState } from "react";
import { ArrowLeft, Stethoscope } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MedicalDictionarySearch } from "@/components/MedicalDictionarySearch";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useDictionaryStats } from "@/lib/search";
import { DictionaryEntry } from "@shared/schema";

export default function MedicalDictionaryModule() {
  const [selectedEntry, setSelectedEntry] = useState<DictionaryEntry | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const { data: stats } = useDictionaryStats();

  const handleEntrySelect = (entry: DictionaryEntry) => {
    setSelectedEntry(entry);
  };

  

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center space-x-2 hover:bg-slate-100"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Dictionary</span>
                </Button>
              </Link>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <Stethoscope className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-slate-900">Tetum Medical Dictionary</h1>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                Bilingual
              </Badge>
              <LanguageSwitcher 
                selectedLanguage={selectedLanguage}
                onLanguageChange={setSelectedLanguage}
              />
            </div>
          </div>
        </div>
      </div>
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <MedicalDictionarySearch 
          onEntrySelect={handleEntrySelect} 
          selectedLanguage={selectedLanguage}
        />
      </div>
      
      {/* Footer */}
      <footer className="bg-gray-900 text-white py-4 text-center">
        <p className="text-sm">All Rights Reserved©Liantek, 2025, Timor-Leste</p>
      </footer>
    </div>
  );
}
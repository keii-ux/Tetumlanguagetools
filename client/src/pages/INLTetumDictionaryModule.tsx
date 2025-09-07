import { useState } from "react";
import { ArrowLeft, BookOpen, Info } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { INLTetumDictionarySearch } from "@/components/INLTetumDictionarySearch";
import { TermDetail } from "@/components/TermDetail";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useINLTetumEntries } from "@/lib/search";
import type { DictionaryEntry } from "@shared/schema";

export default function INLTetumDictionaryModule() {
  const [selectedEntry, setSelectedEntry] = useState<DictionaryEntry | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState("tet");
  const { data: inlEntries = [] } = useINLTetumEntries();

  const handleEntrySelect = (entry: DictionaryEntry) => {
    setSelectedEntry(entry);
  };

  const handleCloseDetail = () => {
    setSelectedEntry(null);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Clean Header */}
      <div className="sticky top-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/">
                <Button variant="ghost" size="sm" className="p-2">
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              </Link>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Tetum Dictionary</h1>
            </div>
            <LanguageSwitcher 
              selectedLanguage={selectedLanguage}
              onLanguageChange={setSelectedLanguage}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4">
        {/* Search Section */}
        <div className="py-8">
          <INLTetumDictionarySearch onEntrySelect={handleEntrySelect} />
        </div>

        {/* Selected Word Detail */}
        {selectedEntry && (
          <div className="pb-8">
            <TermDetail
              entry={selectedEntry}
              onClose={handleCloseDetail}
              userId="guest"
            />
          </div>
        )}
      </div>
      
      {/* Footer */}
      <footer className="bg-gray-900 text-white py-4 text-center">
        <p className="text-sm">All Rights Reserved©Liantek, 2025, Timor-Leste</p>
      </footer>
    </div>
  );
}
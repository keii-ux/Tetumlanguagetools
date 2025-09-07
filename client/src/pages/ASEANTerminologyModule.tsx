import { useState } from "react";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Globe, Languages, Zap } from "lucide-react";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { ASEANTerminologySearch } from "@/components/ASEANTerminologySearch";
import { TermDetail } from "@/components/TermDetail";
import { DictionaryEntry } from "@shared/schema";

const DEFAULT_USER_ID = "demo-user";

export default function ASEANTerminologyModule() {
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [selectedEntry, setSelectedEntry] = useState<DictionaryEntry | null>(null);

  const handleEntrySelect = (entry: DictionaryEntry) => {
    setSelectedEntry(entry);
  };

  const handleCloseDetail = () => {
    setSelectedEntry(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center space-x-2 hover:bg-gray-100 text-gray-600"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Dictionary</span>
                </Button>
              </Link>
              <div className="flex items-center space-x-3">
                <div className="p-1.5 bg-blue-100 rounded">
                  <Globe className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">ASEAN Terminology</h1>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <LanguageSwitcher 
                selectedLanguage={selectedLanguage}
                onLanguageChange={setSelectedLanguage}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Search Section */}
          <div className="lg:col-span-2">
            <ASEANTerminologySearch onEntrySelect={handleEntrySelect} />
          </div>

          {/* Selected Term Detail */}
          <div className="lg:col-span-1">
            {selectedEntry ? (
              <div className="sticky top-20">
                <TermDetail
                  entry={selectedEntry}
                  onClose={handleCloseDetail}
                  userId={DEFAULT_USER_ID}
                />
              </div>
            ) : null}
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
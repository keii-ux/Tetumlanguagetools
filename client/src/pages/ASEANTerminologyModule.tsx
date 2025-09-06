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
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
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
                  <span>Back to Dictionary</span>
                </Button>
              </Link>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Globe className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-slate-900">ASEAN Terminology for Tetum↔English</h1>
                  <p className="text-sm text-slate-600">ASEAN abbreviations and terminology</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                AI Powered
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
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Search Section */}
          <div className="lg:col-span-2">
            <ASEANTerminologySearch onEntrySelect={handleEntrySelect} />
            
            {/* Info Section */}
            <Card className="mt-8">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Languages className="h-5 w-5" />
                  <span>About ASEAN Terminology</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-gray-700">
                    This module provides comprehensive ASEAN (Association of Southeast Asian Nations) 
                    abbreviations and terminology with Google Translate integration for authentic Tetum translations.
                  </p>
                  
                  <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                    <h4 className="font-semibold text-green-800 mb-2 flex items-center">
                      <Zap className="h-4 w-4 mr-2" />
                      Google Translate Features:
                    </h4>
                    <ul className="text-sm text-green-700 space-y-1">
                      <li>• Authentic Tetum translations using Google Translate API</li>
                      <li>• Professional ASEAN terminology database</li>
                      <li>• Support for English, Tetum, and Portuguese</li>
                      <li>• Comprehensive A-Z abbreviation explanations</li>
                    </ul>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                    <h4 className="font-semibold text-blue-800 mb-2">
                      How to use:
                    </h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Search for ASEAN abbreviations or terms</li>
                      <li>• Click on terms to see detailed explanations</li>
                      <li>• Use Google Translate for authentic Tetum translations</li>
                      <li>• Access professional diplomatic terminology</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Selected Term Detail */}
          <div>
            {selectedEntry ? (
              <TermDetail
                entry={selectedEntry}
                onClose={handleCloseDetail}
                userId={DEFAULT_USER_ID}
              />
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
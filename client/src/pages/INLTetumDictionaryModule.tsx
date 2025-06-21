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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Dictionary
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-blue-600" />
              <h1 className="text-2xl font-bold text-foreground">Tetum Dictionary (INL)</h1>
            </div>
          </div>
          <LanguageSwitcher 
            selectedLanguage={selectedLanguage}
            onLanguageChange={setSelectedLanguage}
          />
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Search Area */}
          <div className="lg:col-span-2">
            <INLTetumDictionarySearch onEntrySelect={handleEntrySelect} />

            {/* About Section */}
            <Card className="mt-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="w-5 h-5" />
                  About INL Tetum Dictionary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <CardDescription>
                  The INL (Instituto Nacional de Linguística) Tetum Dictionary is a comprehensive 
                  resource for Tetum language learners and speakers. This dictionary contains 
                  thousands of Tetum words with detailed explanations and grammatical classifications.
                </CardDescription>
                
                <div className="space-y-2">
                  <h4 className="font-medium text-foreground">Features:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                    <li>• Comprehensive Tetum vocabulary</li>
                    <li>• Detailed word explanations</li>
                    <li>• Grammatical classifications (Substantivu, Adjetivu, Verbu, etc.)</li>
                    <li>• Real-time search with predictive results</li>
                    <li>• Clean, easy-to-use interface</li>
                  </ul>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    <strong>Tip:</strong> Start typing any Tetum word to see instant search results. 
                    The dictionary will show matching words and their explanations as you type.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Term Detail Sidebar */}
          <div className="lg:col-span-1">
            {selectedEntry ? (
              <TermDetail
                entry={selectedEntry}
                onClose={handleCloseDetail}
                userId="guest"
              />
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Word Details</CardTitle>
                  <CardDescription>
                    Select a word from search results to view detailed information
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      Search and select a word to see its detailed definition, 
                      word class, and usage information.
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
import { useState } from "react";
import { ArrowLeft, BookOpen, Languages, FileText, BookMarked } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { TetumMonolingualSearch } from "@/components/TetumMonolingualSearch";
import { TermDetail } from "@/components/TermDetail";
import { useDictionaryStats } from "@/lib/search";
import { DictionaryEntry } from "@shared/schema";

export default function TetumMonolingualModule() {
  const [selectedEntry, setSelectedEntry] = useState<DictionaryEntry | null>(null);
  const { data: stats } = useDictionaryStats();

  const handleEntrySelect = (entry: DictionaryEntry) => {
    setSelectedEntry(entry);
  };

  const tetumMonoCount = stats?.["tetum-monolingual"] || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dictionary
              </Button>
            </Link>
            <div className="h-6 w-px bg-slate-300" />
            <div className="flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-orange-600" />
              <h1 className="text-2xl font-bold text-slate-900">Tetum Monolingual Dictionary</h1>
            </div>
          </div>
          <Badge variant="secondary" className="bg-orange-100 text-orange-800">
            {tetumMonoCount.toLocaleString()} entries
          </Badge>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="bg-white border-orange-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Languages className="w-8 h-8 text-orange-600" />
                <div>
                  <div className="text-2xl font-bold text-slate-900">
                    {tetumMonoCount.toLocaleString()}
                  </div>
                  <div className="text-sm text-slate-600">Tetum Definitions</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white border-orange-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <FileText className="w-8 h-8 text-orange-600" />
                <div>
                  <div className="text-2xl font-bold text-slate-900">100%</div>
                  <div className="text-sm text-slate-600">Tetum Language</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white border-orange-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <BookMarked className="w-8 h-8 text-orange-600" />
                <div>
                  <div className="text-2xl font-bold text-slate-900">Native</div>
                  <div className="text-sm text-slate-600">Definitions</div>
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
                <TetumMonolingualSearch onEntrySelect={handleEntrySelect} />
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
                        Select a Tetum Word
                      </h3>
                      <p className="text-slate-600 text-sm">
                        Search and click on any Tetum word to view its detailed definition and usage examples in Tetum language.
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
                  About Tetum Monolingual Dictionary
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  This comprehensive dictionary provides Tetum word definitions and explanations 
                  entirely in the Tetum language. It's designed to help native speakers and 
                  advanced learners understand words within their cultural and linguistic context.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-3">
                  Features
                </h3>
                <ul className="text-slate-600 text-sm space-y-1">
                  <li>• Native Tetum definitions</li>
                  <li>• Word class identification</li>
                  <li>• Usage examples and context</li>
                  <li>• Cultural and linguistic notes</li>
                  <li>• Advanced search capabilities</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
import { useState } from "react";
import { ArrowLeft, BookOpen, Stethoscope } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MedicalDictionarySearch } from "@/components/MedicalDictionarySearch";
import { useDictionaryStats } from "@/lib/search";
import { DictionaryEntry } from "@shared/schema";

interface MedicalDictionaryModuleProps {
  onBack?: () => void;
}

export default function MedicalDictionaryModule({ onBack }: MedicalDictionaryModuleProps) {
  const [selectedEntry, setSelectedEntry] = useState<DictionaryEntry | null>(null);
  const { data: stats } = useDictionaryStats();

  const handleEntrySelect = (entry: DictionaryEntry) => {
    setSelectedEntry(entry);
  };

  const medicalTermCount = stats?.medical || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              {onBack && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onBack}
                  className="flex items-center space-x-2 hover:bg-slate-100"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back to Dictionary</span>
                </Button>
              )}
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <Stethoscope className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-slate-900">Medical Dictionary</h1>
                  <p className="text-sm text-slate-600">Tetum-English Medical Terminology</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                {medicalTermCount} Terms
              </Badge>
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                Bilingual
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                  <span>Medical Dictionary Features</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 text-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Predictive Search</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Tetum ↔ English</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Audio Pronunciation</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Copy to Clipboard</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Medical Context</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Usage Examples</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-200">
                  <h4 className="font-medium text-slate-900 mb-2">Quick Stats</h4>
                  <div className="space-y-2 text-sm text-slate-600">
                    <div className="flex justify-between">
                      <span>Total Terms:</span>
                      <span className="font-medium">{medicalTermCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Languages:</span>
                      <span className="font-medium">2</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Category:</span>
                      <span className="font-medium">Medical</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Search Area */}
          <div className="lg:col-span-3">
            <MedicalDictionarySearch onEntrySelect={handleEntrySelect} />
          </div>
        </div>
      </div>
    </div>
  );
}
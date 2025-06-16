import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Search, BookOpen, Globe, Loader2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface MedicalTranslation {
  term: string;
  translation: string;
  definition: string;
  medicalContext: string;
  sources: string[];
  pronunciation?: string;
  etymology?: string;
  relatedTerms: string[];
}

export function GeneralHealthVocabulary() {
  const [tetumTerm, setTetumTerm] = useState("");
  const [englishTerm, setEnglishTerm] = useState("");
  const [tetumResult, setTetumResult] = useState<MedicalTranslation | null>(null);
  const [englishResult, setEnglishResult] = useState<MedicalTranslation | null>(null);
  const [tetumLoading, setTetumLoading] = useState(false);
  const [englishLoading, setEnglishLoading] = useState(false);

  const translateTerm = async (term: string, fromLang: "tetum" | "english", setResult: (result: MedicalTranslation | null) => void, setLoading: (loading: boolean) => void) => {
    if (!term.trim()) return;
    
    setLoading(true);
    try {
      const toLang = fromLang === "tetum" ? "english" : "tetum";
      const response = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          term: term.trim(),
          fromLanguage: fromLang,
          toLanguage: toLang
        })
      });
      
      const result = await response.json();
      setResult(result);
    } catch (error) {
      console.error("Translation error:", error);
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const handleTetumSearch = () => {
    translateTerm(tetumTerm, "tetum", setTetumResult, setTetumLoading);
  };

  const handleEnglishSearch = () => {
    translateTerm(englishTerm, "english", setEnglishResult, setEnglishLoading);
  };

  const renderTranslationResult = (result: MedicalTranslation | null, loading: boolean) => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Generating medical translation...</span>
        </div>
      );
    }

    if (!result) return null;

    return (
      <div className="space-y-4">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Globe className="h-4 w-4 text-blue-600" />
            <span className="font-semibold text-blue-900">Translation</span>
          </div>
          <p className="text-lg font-medium text-gray-900">{result.translation}</p>
          {result.pronunciation && (
            <p className="text-sm text-gray-600 mt-1">Pronunciation: [{result.pronunciation}]</p>
          )}
        </div>

        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <BookOpen className="h-4 w-4 text-green-600" />
            <span className="font-semibold text-green-900">Medical Definition</span>
          </div>
          <p className="text-gray-800">{result.definition}</p>
        </div>

        <div className="bg-purple-50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <span className="font-semibold text-purple-900">Clinical Context</span>
          </div>
          <p className="text-gray-800">{result.medicalContext}</p>
        </div>

        {result.etymology && (
          <div className="bg-yellow-50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <span className="font-semibold text-yellow-900">Etymology</span>
            </div>
            <p className="text-gray-800">{result.etymology}</p>
          </div>
        )}

        {result.relatedTerms.length > 0 && (
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <span className="font-semibold text-gray-900">Related Terms</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {result.relatedTerms.map((term, index) => (
                <Badge key={index} variant="secondary">{term}</Badge>
              ))}
            </div>
          </div>
        )}

        <div className="bg-orange-50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <span className="font-semibold text-orange-900">Medical Sources</span>
          </div>
          <ul className="space-y-1">
            {result.sources.map((source, index) => (
              <li key={index} className="text-sm text-gray-700">
                • {source}
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-gray-900 mb-2 pt-[23px] pb-[23px] text-[26px] font-medium">General Health Vocabulary</h2>
        <p className="text-gray-600">AI-powered medical translations with comprehensive definitions from reliable sources.</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Tetum to English Translation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <span className="text-lg">🇹🇱 Tetum → English</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex space-x-2">
              <Input
                type="text"
                placeholder="Enter Tetum medical term..."
                value={tetumTerm}
                onChange={(e) => setTetumTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleTetumSearch()}
                className="flex-1"
              />
              <Button 
                onClick={handleTetumSearch}
                disabled={tetumLoading || !tetumTerm.trim()}
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>
            {renderTranslationResult(tetumResult, tetumLoading)}
          </CardContent>
        </Card>

        {/* English to Tetum Translation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <span className="text-lg">🇺🇸 English → Tetum</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex space-x-2">
              <Input
                type="text"
                placeholder="Enter English medical term..."
                value={englishTerm}
                onChange={(e) => setEnglishTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleEnglishSearch()}
                className="flex-1"
              />
              <Button 
                onClick={handleEnglishSearch}
                disabled={englishLoading || !englishTerm.trim()}
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>
            {renderTranslationResult(englishResult, englishLoading)}
          </CardContent>
        </Card>
      </div>
      <div className="text-center text-sm text-gray-500">
        <p>Powered by AI with medical sources from authoritative textbooks, journals, and medical references</p>
      </div>
    </div>
  );
}
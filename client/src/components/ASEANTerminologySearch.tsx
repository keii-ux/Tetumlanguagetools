import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Globe, Languages, Zap, Loader2 } from "lucide-react";
import { useSearchEntries } from "@/lib/search";
import { DictionaryEntry, SearchQuery } from "@shared/schema";
import { buildSearchQuery } from "@/lib/dictionaries";
import { useToast } from "@/hooks/use-toast";

interface ASEANTerminologySearchProps {
  onEntrySelect: (entry: DictionaryEntry) => void;
}

export function ASEANTerminologySearch({ onEntrySelect }: ASEANTerminologySearchProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("all");
  const [translationText, setTranslationText] = useState("");
  const [fromLanguage, setFromLanguage] = useState("en");
  const [toLanguage, setToLanguage] = useState("tet");
  const [translationResult, setTranslationResult] = useState("");
  const [isTranslating, setIsTranslating] = useState(false);
  const { toast } = useToast();

  const searchQuery: SearchQuery = buildSearchQuery({
    query: searchTerm,
    dictionaryType: "asean",
    language: selectedLanguage === "all" ? "all" : selectedLanguage as any
  });

  const { data: searchResults = [], isLoading } = useSearchEntries(searchQuery);

  const handleSearch = (query: string) => {
    setSearchTerm(query);
  };

  const handleTranslate = async () => {
    if (!translationText.trim()) {
      toast({
        title: "Translation Error",
        description: "Please enter text to translate",
        variant: "destructive"
      });
      return;
    }

    setIsTranslating(true);
    setTranslationResult("");

    try {
      const response = await fetch("/api/asean/translate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          text: translationText,
          fromLanguage,
          toLanguage
        })
      });

      if (!response.ok) {
        throw new Error("Translation failed");
      }

      const data = await response.json();
      setTranslationResult(data.translation || "Translation not available");
      
      toast({
        title: "Translation Complete",
        description: "AI translation generated successfully"
      });
    } catch (error) {
      console.error("Translation error:", error);
      toast({
        title: "Translation Failed",
        description: "Unable to translate text. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsTranslating(false);
    }
  };

  const filteredResults = searchResults.filter(entry => entry.dictionaryType === "asean");

  return (
    <div className="space-y-6">
      {/* Combined Search & Translation Section */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <Globe className="h-5 w-5 text-green-600" />
                  <h2 className="text-lg font-semibold">ASEAN Terminology & AI Translation</h2>
                </div>
                <Badge variant="secondary" className="bg-blue-50 text-blue-700">
                  Powered by OpenRouter
                </Badge>
              </div>
            </div>

            {/* Search Bar */}
            <div className="flex space-x-4">
              <div className="flex-1">
                <Input
                  type="text"
                  placeholder="Search ASEAN abbreviations and terms..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full"
                />
              </div>
              <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Languages</SelectItem>
                  <SelectItem value="english">English</SelectItem>
                  <SelectItem value="tetum">Tetum</SelectItem>
                  <SelectItem value="portuguese">Portuguese</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* AI Translation Section */}
            <div className="border-t pt-6">
              <div className="flex items-center space-x-2 mb-4">
                <Zap className="h-5 w-5 text-blue-600" />
                <h3 className="text-base font-medium">AI Translation</h3>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">Text to translate</label>
                  <textarea
                    value={translationText}
                    onChange={(e) => setTranslationText(e.target.value)}
                    placeholder="Enter ASEAN terminology to translate..."
                    className="w-full h-20 p-3 border border-gray-300 rounded-md resize-none text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">Translation result</label>
                  <div className="w-full h-20 p-3 border border-gray-200 rounded-md bg-gray-50 overflow-y-auto text-sm">
                    {isTranslating ? (
                      <div className="flex items-center space-x-2 text-gray-500">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Translating...</span>
                      </div>
                    ) : (
                      <p className="text-gray-700">{translationResult || "Translation will appear here"}</p>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <Select value={fromLanguage} onValueChange={setFromLanguage}>
                  <SelectTrigger className="w-28">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="tet">Tetum</SelectItem>
                    <SelectItem value="pt">Portuguese</SelectItem>
                  </SelectContent>
                </Select>
                
                <Languages className="h-4 w-4 text-gray-400" />
                
                <Select value={toLanguage} onValueChange={setToLanguage}>
                  <SelectTrigger className="w-28">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="tet">Tetum</SelectItem>
                    <SelectItem value="pt">Portuguese</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button 
                  onClick={handleTranslate} 
                  disabled={isTranslating || !translationText.trim()}
                  className="bg-blue-600 hover:bg-blue-700"
                  size="sm"
                >
                  {isTranslating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Translating...
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4 mr-2" />
                      Translate
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search Results */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Search Results</h3>
            <Badge variant="outline">
              {filteredResults.length} terms found
            </Badge>
          </div>
          
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
              <span className="ml-2 text-gray-500">Searching...</span>
            </div>
          ) : filteredResults.length > 0 ? (
            <div className="space-y-3">
              {filteredResults.map((entry, index) => (
                <div
                  key={`${entry.id}-${index}`}
                  onClick={() => onEntrySelect(entry)}
                  className="p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 cursor-pointer transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">
                        {entry.english || entry.explanation || "Unknown Term"}
                      </h4>
                      {entry.notes && (
                        <p className="text-sm text-blue-600 mt-1">
                          {entry.notes}
                        </p>
                      )}
                      {entry.explanation && entry.explanation !== entry.english && (
                        <p className="text-sm text-gray-600 mt-2">
                          {entry.explanation}
                        </p>
                      )}
                    </div>
                    <Badge variant="secondary" className="ml-4 bg-green-100 text-green-700">
                      ASEAN
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : searchTerm ? (
            <div className="text-center py-8">
              <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No ASEAN terms found for "{searchTerm}"</p>
              <p className="text-sm text-gray-400 mt-2">
                Try searching for ASEAN abbreviations like "ASEAN", "AFTA", "AEC", etc.
              </p>
            </div>
          ) : (
            <div className="text-center py-8">
              <Globe className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Enter a search term to find ASEAN terminology</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
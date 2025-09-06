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
  const [unifiedInput, setUnifiedInput] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("all");
  const [fromLanguage, setFromLanguage] = useState("en");
  const [toLanguage, setToLanguage] = useState("tet");
  const [translationResult, setTranslationResult] = useState("");
  const [isTranslating, setIsTranslating] = useState(false);
  const { toast } = useToast();

  const searchQuery: SearchQuery = buildSearchQuery({
    query: unifiedInput,
    dictionaryType: "asean",
    language: selectedLanguage === "all" ? "all" : selectedLanguage as any
  });

  const { data: searchResults = [], isLoading } = useSearchEntries(searchQuery);

  const handleUnifiedInput = (value: string) => {
    setUnifiedInput(value);
  };

  const handleTranslate = async () => {
    if (!unifiedInput.trim()) {
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
          text: unifiedInput,
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
      {/* Unified Search & Translation Interface */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Globe className="h-5 w-5 text-green-600" />
                <h2 className="text-lg font-semibold">ASEAN Terminology & AI Translation</h2>
                <Badge variant="secondary" className="bg-blue-50 text-blue-700">
                  <Zap className="h-3 w-3 mr-1" />
                  AI Powered
                </Badge>
              </div>
            </div>

            {/* Unified Search Bar with Translation Controls */}
            <div className="space-y-4">
              <div className="flex space-x-2">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search ASEAN terms or enter text to translate..."
                    value={unifiedInput}
                    onChange={(e) => handleUnifiedInput(e.target.value)}
                    className="pl-10 w-full"
                  />
                </div>
                <Select value={fromLanguage} onValueChange={setFromLanguage}>
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">EN</SelectItem>
                    <SelectItem value="tet">TET</SelectItem>
                    <SelectItem value="pt">PT</SelectItem>
                  </SelectContent>
                </Select>
                <Languages className="h-4 w-4 text-gray-400 mt-3" />
                <Select value={toLanguage} onValueChange={setToLanguage}>
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">EN</SelectItem>
                    <SelectItem value="tet">TET</SelectItem>
                    <SelectItem value="pt">PT</SelectItem>
                  </SelectContent>
                </Select>
                <Button 
                  onClick={handleTranslate} 
                  disabled={isTranslating || !unifiedInput.trim()}
                  className="bg-blue-600 hover:bg-blue-700"
                  size="sm"
                >
                  {isTranslating ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Zap className="h-4 w-4" />
                  )}
                </Button>
              </div>

              {/* Translation Result */}
              {(translationResult || isTranslating) && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Zap className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-800">AI Translation Result</span>
                  </div>
                  {isTranslating ? (
                    <div className="flex items-center space-x-2 text-blue-600">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm">Translating...</span>
                    </div>
                  ) : (
                    <p className="text-blue-700 text-sm">{translationResult}</p>
                  )}
                </div>
              )}

              {/* Language Filter */}
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Filter results:</span>
                <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                  <SelectTrigger className="w-36">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Languages</SelectItem>
                    <SelectItem value="english">English</SelectItem>
                    <SelectItem value="tetum">Tetum</SelectItem>
                    <SelectItem value="portuguese">Portuguese</SelectItem>
                  </SelectContent>
                </Select>
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
                      {entry.tetum && entry.tetum !== entry.english?.split(':')[0] && (
                        <p className="text-sm text-green-600 mt-1">
                          <span className="font-medium">Tetum:</span> {entry.tetum}
                        </p>
                      )}
                      {entry.source && (
                        <p className="text-sm text-gray-500 mt-1">
                          <span className="font-medium">Source:</span> {entry.source}
                        </p>
                      )}
                      {entry.notes && (
                        <p className="text-sm text-blue-600 mt-1">
                          {entry.notes}
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
          ) : unifiedInput ? (
            <div className="text-center py-8">
              <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No ASEAN terms found for "{unifiedInput}"</p>
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
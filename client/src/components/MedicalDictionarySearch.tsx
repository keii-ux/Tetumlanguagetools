import { useState, useEffect, useRef } from "react";
import { Search, Volume2, Copy, Menu } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useSearchEntries } from "@/lib/search";
import { DictionaryEntry } from "@shared/schema";

interface MedicalDictionarySearchProps {
  onEntrySelect?: (entry: DictionaryEntry) => void;
}

interface PredictiveDropdownProps {
  searchTerm: string;
  entries: DictionaryEntry[];
  onSelect: (entry: DictionaryEntry) => void;
  onClose: () => void;
  isVisible: boolean;
}

function PredictiveDropdown({ 
  searchTerm, 
  entries, 
  onSelect, 
  onClose, 
  isVisible 
}: PredictiveDropdownProps) {
  if (!isVisible || !searchTerm || entries.length === 0) return null;

  const filteredEntries = entries
    .filter(entry => {
      const searchField = entry.tetum || entry.english;
      return searchField && searchField.toLowerCase().includes(searchTerm.toLowerCase());
    })
    .sort((a, b) => {
      const aField = a.tetum || a.english;
      const bField = b.tetum || b.english;
      
      const aStartsWith = aField?.toLowerCase().startsWith(searchTerm.toLowerCase());
      const bStartsWith = bField?.toLowerCase().startsWith(searchTerm.toLowerCase());
      
      if (aStartsWith && !bStartsWith) return -1;
      if (!aStartsWith && bStartsWith) return 1;
      
      return (aField || "").localeCompare(bField || "");
    })
    .slice(0, 10);

  return (
    <Card className="absolute top-full left-0 right-0 z-50 mt-1 max-h-80 overflow-auto border-slate-200 shadow-lg">
      <CardContent className="p-0">
        {filteredEntries.map((entry, index) => {
          const displayTerm = entry.tetum || entry.english;
          const translation = entry.english || entry.tetum;
          
          return (
            <div
              key={`${entry.id}-${index}`}
              className="p-3 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-b-0"
              onClick={() => {
                onSelect(entry);
                onClose();
              }}
            >
              <div className="font-medium text-slate-900">{displayTerm}</div>
              <div className="text-sm text-slate-600 mt-1">{translation}</div>
              {entry.source && (
                <div className="text-xs text-slate-400 mt-1">Source: {entry.source}</div>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

export function MedicalDictionarySearch({ onEntrySelect }: MedicalDictionarySearchProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEntry, setSelectedEntry] = useState<DictionaryEntry | null>(null);
  const [showPredictive, setShowPredictive] = useState(false);
  const [activeTab, setActiveTab] = useState("definitions");
  const searchRef = useRef<HTMLDivElement>(null);

  const { data: searchResults = [], isLoading } = useSearchEntries({
    query: searchTerm,
    dictionaryType: "medical",
    language: "all",
    exactMatch: false,
    includeDefinitions: true,
    caseSensitive: false,
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowPredictive(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setShowPredictive(value.length > 0);
    if (!value) {
      setSelectedEntry(null);
    }
  };

  const handleEntrySelect = (entry: DictionaryEntry) => {
    setSelectedEntry(entry);
    setSearchTerm(entry.tetum || entry.english || "");
    setShowPredictive(false);
    onEntrySelect?.(entry);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-800 mb-2">
            Access Millions of Trusted
          </h1>
          <h2 className="text-4xl font-bold text-slate-800">
            Definitions
          </h2>
        </div>

        {/* Main Container */}
        <div className="bg-white rounded-3xl shadow-lg border border-slate-200 overflow-hidden">
          {/* Search Bar Section */}
          <div className="p-6 border-b border-slate-100">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" className="p-2">
                <Menu className="h-5 w-5 text-slate-600" />
              </Button>
              
              <div className="flex-1 relative" ref={searchRef}>
                <Input
                  placeholder="Search a word or phrase"
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  onFocus={() => setShowPredictive(searchTerm.length > 0)}
                  className="w-full border-2 border-slate-300 rounded-full px-6 py-3 text-lg focus:border-blue-500 focus:ring-0"
                />
                <Button
                  size="sm"
                  variant="ghost"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 rounded-full bg-blue-500 hover:bg-blue-600 text-white px-4"
                  onClick={() => handleSearchChange(searchTerm)}
                >
                  <Search className="h-4 w-4" />
                </Button>

                <PredictiveDropdown
                  searchTerm={searchTerm}
                  entries={searchResults}
                  onSelect={handleEntrySelect}
                  onClose={() => setShowPredictive(false)}
                  isVisible={showPredictive}
                />
              </div>
            </div>
          </div>

          {/* Word Display Area */}
          {selectedEntry && (
            <div className="p-6">
              {/* Word Title with Audio and Share */}
              <div className="flex items-center gap-4 mb-4">
                <h1 className="text-4xl font-bold text-slate-900">
                  {selectedEntry.tetum || selectedEntry.english}
                </h1>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => speakText(selectedEntry.tetum || selectedEntry.english || "")}
                  className="p-2 hover:bg-slate-100"
                >
                  <Volume2 className="h-5 w-5 text-slate-600" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => copyToClipboard(selectedEntry.tetum || selectedEntry.english || "")}
                  className="p-2 hover:bg-slate-100"
                >
                  <Copy className="h-5 w-5 text-slate-600" />
                </Button>
              </div>

              {/* Pronunciation Guide */}
              <div className="flex items-center gap-6 mb-6 text-sm text-slate-600">
                <div className="flex items-center gap-2">
                  <span className="font-medium">[ {selectedEntry.tetum || selectedEntry.english} ]</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
                    <span>Phonetic (standard)</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-slate-300 rounded-full border border-slate-400"></div>
                    <span>IPA</span>
                  </div>
                </div>
              </div>

              {/* Navigation Tabs */}
              <div className="border-b border-slate-200 mb-6">
                <nav className="-mb-px flex space-x-8">
                  {[
                    { id: "definitions", label: "Definitions" },
                    { id: "thesaurus", label: "Thesaurus" },
                    { id: "examples", label: "Examples" },
                    { id: "idioms", label: "Idioms" },
                    { id: "grammar", label: "Grammar" },
                    { id: "scientific", label: "Scientific" }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`py-3 px-1 border-b-2 font-medium text-sm ${
                        activeTab === tab.id
                          ? "border-blue-500 text-blue-600"
                          : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>

              {/* Tab Content */}
              <div className="min-h-96">
                {activeTab === "definitions" && (
                  <div className="space-y-6">
                    <div className="text-sm text-slate-600">
                      Definition for <strong>{selectedEntry.tetum || selectedEntry.english}</strong> (1 of 2)
                    </div>
                    
                    <div className="space-y-4">
                      <div className="font-semibold text-slate-900">noun</div>
                      <div className="text-sm text-slate-600 italic">
                        Plural {selectedEntry.tetum || selectedEntry.english}s {selectedEntry.english || selectedEntry.tetum}s
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-start space-x-3">
                          <span className="font-medium text-slate-700 mt-1">1</span>
                          <div className="flex-1">
                            <div className="text-slate-900 leading-relaxed">
                              {selectedEntry.english || selectedEntry.tetum}
                            </div>
                            {selectedEntry.explanation && (
                              <div className="text-slate-600 mt-2 text-sm italic">
                                {selectedEntry.explanation}
                              </div>
                            )}
                            {selectedEntry.usageExamples && selectedEntry.usageExamples.length > 0 && (
                              <div className="text-slate-600 mt-2 text-sm italic">
                                {selectedEntry.usageExamples.join("; ")}
                              </div>
                            )}
                          </div>
                        </div>

                        {selectedEntry.notes && (
                          <div className="flex items-start space-x-3">
                            <span className="font-medium text-slate-700 mt-1">2</span>
                            <div className="text-slate-900 leading-relaxed">
                              {selectedEntry.notes}
                            </div>
                          </div>
                        )}

                        <div className="flex items-start space-x-3">
                          <span className="font-medium text-slate-700 mt-1">3</span>
                          <div className="text-slate-900 leading-relaxed">
                            <em>Medical.</em> a medical term used in healthcare contexts, particularly relevant in clinical practice and patient care.
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "thesaurus" && (
                  <div className="text-slate-600">
                    {selectedEntry.relatedTerms && selectedEntry.relatedTerms.length > 0 ? (
                      <div className="space-y-3">
                        <div className="font-semibold">Related Terms:</div>
                        <div className="flex flex-wrap gap-2">
                          {selectedEntry.relatedTerms.map((term, index) => (
                            <Badge key={index} variant="outline">{term}</Badge>
                          ))}
                        </div>
                      </div>
                    ) : (
                      "No thesaurus entries available for this medical term."
                    )}
                  </div>
                )}

                {activeTab === "examples" && (
                  <div className="text-slate-600">
                    {selectedEntry.usageExamples && selectedEntry.usageExamples.length > 0 ? (
                      <div className="space-y-3">
                        {selectedEntry.usageExamples.map((example, index) => (
                          <div key={index} className="p-3 bg-slate-50 rounded-lg">
                            <div className="text-slate-900">{example}</div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      "No examples available for this medical term."
                    )}
                  </div>
                )}

                {activeTab === "idioms" && (
                  <div className="text-slate-600">
                    No idioms available for this medical term.
                  </div>
                )}

                {activeTab === "grammar" && (
                  <div className="text-slate-600">
                    {selectedEntry.wordClass ? (
                      <div className="space-y-2">
                        <div><strong>Word Class:</strong> {selectedEntry.wordClass}</div>
                        {selectedEntry.pronunciation && (
                          <div><strong>Pronunciation:</strong> {selectedEntry.pronunciation}</div>
                        )}
                        {selectedEntry.etymology && (
                          <div><strong>Etymology:</strong> {selectedEntry.etymology}</div>
                        )}
                      </div>
                    ) : (
                      "No grammatical information available for this medical term."
                    )}
                  </div>
                )}

                {activeTab === "scientific" && (
                  <div className="text-slate-600">
                    <div className="space-y-3">
                      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="font-semibold text-blue-900 mb-2">Medical Context</div>
                        <div className="text-blue-800">
                          This term is part of the medical terminology used in Tetum-speaking regions, 
                          particularly in healthcare settings in Timor-Leste.
                        </div>
                      </div>
                      {selectedEntry.source && (
                        <div className="text-sm">
                          <strong>Source:</strong> {selectedEntry.source}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Second Definition Entry */}
          {selectedEntry && activeTab === "definitions" && (
            <div className="px-6 pb-6">
              <Separator className="mb-6" />
              <div className="space-y-4">
                <div className="text-sm text-slate-600">
                  Definition for <strong>{selectedEntry.english || selectedEntry.tetum}</strong> (2 of 2)
                </div>
                
                <div className="flex items-center gap-4 mb-4">
                  <h2 className="text-3xl font-bold text-slate-900">
                    {selectedEntry.english || selectedEntry.tetum}
                  </h2>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => speakText(selectedEntry.english || selectedEntry.tetum || "")}
                    className="p-2 hover:bg-slate-100"
                  >
                    <Volume2 className="h-5 w-5 text-slate-600" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard(selectedEntry.english || selectedEntry.tetum || "")}
                    className="p-2 hover:bg-slate-100"
                  >
                    <Copy className="h-5 w-5 text-slate-600" />
                  </Button>
                </div>

                <div className="flex items-center gap-6 mb-4 text-sm text-slate-600">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">[ {selectedEntry.english || selectedEntry.tetum} ]</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
                      <span>Phonetic (standard)</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-slate-300 rounded-full border border-slate-400"></div>
                      <span>IPA</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
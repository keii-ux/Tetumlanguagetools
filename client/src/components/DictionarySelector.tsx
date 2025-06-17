import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Scale, Stethoscope, Book, Globe, Bookmark, History, Download, ExternalLink } from "lucide-react";
import { Link } from "wouter";
import { SearchQuery } from "@shared/schema";
import { useDictionaryStats } from "@/lib/search";

interface DictionarySelectorProps {
  selectedType: string;
  onTypeSelect: (type: string) => void;
  languageFilter: string[];
  onLanguageToggle: (language: string) => void;
  onShowBookmarks: () => void;
  onShowHistory: () => void;
  onExportTerms: () => void;
}

const DICTIONARY_CONFIG = [
  {
    type: "legal",
    name: "Legal Dictionary",
    icon: Scale,
    color: "bg-blue-500",
    description: "Legal terminology and jurisprudence",
  },
  {
    type: "medical", 
    name: "Medical Dictionary",
    icon: Stethoscope,
    color: "bg-red-500",
    description: "Medical terms and conditions",
  },
  {
    type: "asean",
    name: "ASEAN Glossary",
    icon: Globe,
    color: "bg-green-500", 
    description: "Regional terminology",
  },
  {
    type: "general",
    name: "General Dictionary",
    icon: Book,
    color: "bg-purple-500",
    description: "General vocabulary",
  },
];

export function DictionarySelector({
  selectedType,
  onTypeSelect,
  languageFilter,
  onLanguageToggle,
  onShowBookmarks,
  onShowHistory,
  onExportTerms,
}: DictionarySelectorProps) {
  const { data: stats } = useDictionaryStats();

  const getTermCount = (type: string) => {
    if (!stats) return 0;
    return stats[type as keyof typeof stats] || 0;
  };

  return (
    <aside className="w-80 bg-white rounded-xl border border-slate-200 h-fit">
      <div className="p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">
          Dictionary Categories
        </h2>

        {/* Dictionary Selection */}
        <div className="space-y-2 mb-6">
          {DICTIONARY_CONFIG.map((dict) => {
            const Icon = dict.icon;
            const isSelected = selectedType === dict.type;
            const termCount = getTermCount(dict.type);

            // Special handling for medical dictionary
            if (dict.type === "medical") {
              return (
                <div key={dict.type} className="space-y-2">
                  <div
                    onClick={() => onTypeSelect(dict.type)}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      isSelected
                        ? "bg-primary/5 border-primary/20"
                        : "hover:bg-slate-50 border-transparent hover:border-slate-200"
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 ${dict.color} rounded-md flex items-center justify-center`}>
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-slate-900">{dict.name}</h3>
                        <p className="text-xs text-slate-500">
                          {termCount.toLocaleString()} terms
                        </p>
                      </div>
                    </div>
                  </div>
                  <Link href="/medical-dictionary">
                    <Button variant="outline" size="sm" className="w-full text-xs">
                      <ExternalLink className="w-3 h-3 mr-1" />
                      Advanced Medical Dictionary
                    </Button>
                  </Link>
                </div>
              );
            }

            return (
              <div
                key={dict.type}
                onClick={() => onTypeSelect(dict.type)}
                className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                  isSelected
                    ? "bg-primary/5 border-primary/20"
                    : "hover:bg-slate-50 border-transparent hover:border-slate-200"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 ${dict.color} rounded-md flex items-center justify-center`}>
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-slate-900">{dict.name}</h3>
                    <p className="text-xs text-slate-500">
                      {termCount.toLocaleString()} terms
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Language Filter */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-slate-900 mb-3">Language Filter</h3>
          <div className="space-y-2">
            {[
              { key: "tetum", label: "Tetum" },
              { key: "portuguese", label: "Portuguese" },
              { key: "english", label: "English" },
            ].map((lang) => (
              <div key={lang.key} className="flex items-center space-x-2">
                <Checkbox
                  id={lang.key}
                  checked={languageFilter.includes(lang.key)}
                  onCheckedChange={() => onLanguageToggle(lang.key)}
                />
                <Label htmlFor={lang.key} className="text-sm text-slate-700">
                  {lang.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <h3 className="text-sm font-medium text-slate-900 mb-3">Quick Actions</h3>
          <div className="space-y-2">
            <Button
              variant="ghost"
              className="w-full justify-start text-sm text-slate-600 hover:text-primary"
              onClick={onShowBookmarks}
            >
              <Bookmark className="w-4 h-4 mr-2" />
              My Bookmarks
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-sm text-slate-600 hover:text-primary"
              onClick={onShowHistory}
            >
              <History className="w-4 h-4 mr-2" />
              Search History
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-sm text-slate-600 hover:text-primary"
              onClick={onExportTerms}
            >
              <Download className="w-4 h-4 mr-2" />
              Export Terms
            </Button>
          </div>
        </div>

        {/* Statistics */}
        {stats && (
          <div className="mt-6 pt-6 border-t border-slate-200">
            <h3 className="text-sm font-medium text-slate-900 mb-3">Statistics</h3>
            <div className="text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Total entries:</span>
                <span className="font-medium">{stats.total.toLocaleString()}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}

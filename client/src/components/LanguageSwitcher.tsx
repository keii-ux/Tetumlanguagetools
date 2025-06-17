import { useState } from "react";
import { Globe, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const LANGUAGE_OPTIONS = [
  { code: "en", label: "English", flag: "🇺🇸" },
  { code: "pt", label: "Português", flag: "🇵🇹" },
  { code: "tet", label: "Tetum", flag: "🇹🇱" },
];

interface LanguageSwitcherProps {
  selectedLanguage?: string;
  onLanguageChange?: (language: string) => void;
  className?: string;
}

export function LanguageSwitcher({ 
  selectedLanguage = "en", 
  onLanguageChange, 
  className = "" 
}: LanguageSwitcherProps) {
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);

  const currentLanguage = LANGUAGE_OPTIONS.find(lang => lang.code === selectedLanguage) || LANGUAGE_OPTIONS[0];

  const handleLanguageSelect = (langCode: string) => {
    setShowLanguageDropdown(false);
    onLanguageChange?.(langCode);
  };

  return (
    <div className={`relative ${className}`}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
        className="flex items-center gap-2"
      >
        <Globe className="h-4 w-4" />
        <span>{currentLanguage.flag}</span>
        <span className="hidden md:inline">{currentLanguage.label}</span>
        <ChevronDown className="h-3 w-3" />
      </Button>

      {showLanguageDropdown && (
        <Card className="absolute top-full right-0 z-50 mt-1 min-w-32 border shadow-lg bg-white dark:bg-gray-800">
          <CardContent className="p-1">
            {LANGUAGE_OPTIONS.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageSelect(lang.code)}
                className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 rounded ${
                  selectedLanguage === lang.code ? 'bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-400' : ''
                }`}
              >
                <span>{lang.flag}</span>
                <span>{lang.label}</span>
              </button>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
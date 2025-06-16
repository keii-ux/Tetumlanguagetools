import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Search, 
  BookOpen, 
  Globe, 
  Brain, 
  Languages, 
  FileText, 
  Settings, 
  User,
  ChevronDown,
  Home as HomeIcon
} from "lucide-react";

// Language options for website interface
const LANGUAGE_OPTIONS = [
  { code: "en", label: "English", flag: "🇺🇸" },
  { code: "pt", label: "Português", flag: "🇵🇹" },
  { code: "tet", label: "Tetum", flag: "🇹🇱" },
];

const TOOLS = [
  {
    id: "dictionary",
    title: "Medical Dictionary",
    description: "Comprehensive medical terminology in Tetum, Portuguese, and English",
    icon: BookOpen,
    color: "bg-blue-500",
    hoverColor: "hover:bg-blue-600",
    link: "/dictionary"
  },
  {
    id: "translator",
    title: "Language Translator",
    description: "Translate between Tetum, Portuguese, and English",
    icon: Languages,
    color: "bg-green-500",
    hoverColor: "hover:bg-green-600",
    link: "/translator"
  },
  {
    id: "legal-terms",
    title: "Legal Terminology",
    description: "Legal terms and concepts for professional use",
    icon: FileText,
    color: "bg-purple-500",
    hoverColor: "hover:bg-purple-600",
    link: "/legal"
  },
  {
    id: "general-vocab",
    title: "General Vocabulary",
    description: "Everyday vocabulary and common expressions",
    icon: Globe,
    color: "bg-orange-500",
    hoverColor: "hover:bg-orange-600",
    link: "/general"
  },
  {
    id: "learning-tools",
    title: "Learning Tools",
    description: "Interactive tools for language learning",
    icon: Brain,
    color: "bg-pink-500",
    hoverColor: "hover:bg-pink-600",
    link: "/learning"
  },
  {
    id: "search",
    title: "Advanced Search",
    description: "Powerful search across all dictionaries",
    icon: Search,
    color: "bg-teal-500",
    hoverColor: "hover:bg-teal-600",
    link: "/search"
  }
];

export default function Home() {
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-blue-100">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <HomeIcon className="h-8 w-8 text-blue-600" />
                <span className="text-xl font-bold text-gray-900">LianTek Pro Tools</span>
              </div>
            </div>

            {/* Language Selector */}
            <div className="relative">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
                className="flex items-center space-x-2 text-[#050505] hover:text-blue-700 border-blue-200 bg-blue-50"
              >
                <span>{LANGUAGE_OPTIONS.find(lang => lang.code === selectedLanguage)?.flag}</span>
                <span className="hidden sm:inline">{LANGUAGE_OPTIONS.find(lang => lang.code === selectedLanguage)?.label}</span>
                <ChevronDown className="w-4 h-4" />
              </Button>
              
              {showLanguageDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                  <div className="py-1">
                    {LANGUAGE_OPTIONS.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          setSelectedLanguage(lang.code);
                          setShowLanguageDropdown(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center space-x-3 ${
                          selectedLanguage === lang.code ? "bg-blue-50 text-blue-600" : "text-gray-700"
                        }`}
                      >
                        <span>{lang.flag}</span>
                        <span>{lang.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
            Professional Language Tools
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Comprehensive linguistic resources for Tetum language research and professional terminology across legal, medical, and general domains.
          </p>
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {TOOLS.map((tool) => {
            const IconComponent = tool.icon;
            return (
              <Link key={tool.id} href={tool.link}>
                <Card className="h-full transition-all duration-300 hover:shadow-lg hover:scale-105 cursor-pointer border-blue-100 hover:border-blue-200">
                  <CardHeader className="pb-4">
                    <div className={`w-12 h-12 rounded-lg ${tool.color} ${tool.hoverColor} flex items-center justify-center mb-4 transition-colors`}>
                      <IconComponent className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-lg font-semibold text-gray-900">
                      {tool.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-gray-600">
                      {tool.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        {/* Stats Section */}
        <div className="bg-white rounded-xl shadow-lg p-8 border border-blue-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Database Statistics
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">1,942</div>
              <div className="text-gray-600">Medical Terms</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">0</div>
              <div className="text-gray-600">Legal Terms</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600 mb-2">0</div>
              <div className="text-gray-600">General Terms</div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-12 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">
            Key Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Languages className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Multilingual</h3>
              <p className="text-sm text-gray-600">Support for Tetum, Portuguese, and English</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <Search className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Advanced Search</h3>
              <p className="text-sm text-gray-600">Powerful search with predictive text</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <BookOpen className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Professional</h3>
              <p className="text-sm text-gray-600">Academic-grade terminology database</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                <Brain className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Learning Tools</h3>
              <p className="text-sm text-gray-600">Interactive learning resources</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
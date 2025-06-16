import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ChevronDown,
  ChevronRight,
  Heart,
  Scale,
  BookOpen,
  Globe
} from "lucide-react";
import { useDictionaryStats } from "@/lib/search";
import logoTransp from "@assets/logo transp_1750045871999.png";

import logo_transp from "@assets/logo transp.png";

// Language options for website interface
const LANGUAGE_OPTIONS = [
  { code: "en", label: "English", flag: "🇺🇸" },
  { code: "pt", label: "Português", flag: "🇵🇹" },
  { code: "tet", label: "Tetum", flag: "🇹🇱" },
];

export default function Home() {
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const { data: stats } = useDictionaryStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-800 via-blue-700 to-blue-900">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-sm border-b border-white/20">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <img 
                src={logo_transp} 
                alt="LianTek Logo" 
                className="w-10 h-10 object-contain ml-[25px] mr-[25px] mt-[20px] mb-[20px] pl-[15px] pr-[15px] pt-[12px] pb-[12px]"
              />
              <span className="text-white font-medium">LianTek</span>
            </div>

            {/* Language Selector */}
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
                className="flex items-center space-x-2 text-white hover:bg-white/10 border border-white/30"
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
      <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 py-16">
        <div className="flex flex-col lg:flex-row items-start gap-12">
          {/* Left Side - Hero Content */}
          <div className="flex-1">
            

            {/* Main Heading */}
            <h1 className="text-5xl lg:text-6xl font-bold text-white mb-8 leading-tight">
              Technical <span className="text-green-400">Tetum</span><br />
              Glossaries <span className="text-white/80">&</span><br />
              Dictionaries
            </h1>

            {/* Description */}
            <p className="text-white/80 text-lg mb-12 max-w-xl leading-relaxed">
              Specialized terminology and tools for healthcare, legal, educational, and linguistic professionals working with Tetum, Portuguese, and English.
            </p>

            {/* Stats */}
            <div className="flex items-center space-x-8 text-center text-[14px]">
              <div>
                <div className="text-3xl font-bold text-white">{stats?.total || 1757}</div>
                <div className="text-white/60 text-sm">Total Terms</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-white">4</div>
                <div className="text-white/60 text-sm">Dictionaries</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-white">3</div>
                <div className="text-white/60 text-sm">Languages</div>
              </div>
            </div>
          </div>

          {/* Right Side - Tools Panel */}
          <div className="flex-1 max-w-md">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 text-[23px] pl-[31px] pr-[31px] pt-[40px] pb-[40px] font-normal text-left">
              {/* Panel Header */}
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-green-400 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">A</span>
                </div>
                <div>
                  <h3 className="text-white font-semibold">All-in-one multilingual language tools</h3>
                  <p className="text-white/60 text-sm">Professional Terminology</p>
                </div>
              </div>

              {/* Tool Options */}
              <div className="space-y-3">
                <div className="flex items-center space-x-3 text-white/90">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-sm">Tetum ↔ Portuguese ↔ English</span>
                </div>
                <div className="flex items-center space-x-3 text-white/90">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span className="text-sm">Legal & Medical Terminology</span>
                </div>
                <div className="flex items-center space-x-3 text-white/90">
                  <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                  <span className="text-sm">Professional Reference Resources</span>
                </div>
                <div className="flex items-center space-x-3 text-white/90">
                  <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                  <span className="text-sm">ASEAN Professional Glossary</span>
                </div>
                <div className="flex items-center space-x-3 text-white/90">
                  <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                  <span className="text-sm">AI-Powered Language Resources</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Bottom Section - Tool Selection */}
      <div className="bg-white">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Choose Your Professional Tool</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Access specialized dictionaries and glossaries designed for professional use across multiple languages and domains.
            </p>
          </div>

          {/* Tool Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Medical Glossary */}
            <Link href="/dictionary">
              <Card className="group cursor-pointer transition-all duration-300 hover:shadow-lg border-gray-200 hover:border-red-200">
                <CardHeader className="flex flex-row items-center space-y-0 pb-4">
                  <div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center mr-4 group-hover:bg-red-100 transition-colors">
                    <Heart className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg font-semibold text-gray-900">Medical Glossary</CardTitle>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">Healthcare</span>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-red-600 transition-colors" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600 mb-4">
                    Comprehensive Tetum medical terminology with Portuguese and English translations
                  </CardDescription>
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl font-bold text-green-600">{stats?.medical || 0}</span>
                    <span className="text-gray-500 text-sm">terms</span>
                  </div>
                </CardContent>
              </Card>
            </Link>

            {/* Legal Glossary */}
            <Card className="group cursor-pointer transition-all duration-300 hover:shadow-lg border-gray-200 hover:border-blue-200">
              <CardHeader className="flex flex-row items-center space-y-0 pb-4">
                <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mr-4 group-hover:bg-blue-100 transition-colors">
                  <Scale className="h-6 w-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg font-semibold text-gray-900">Legal Glossary</CardTitle>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">Legal</span>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600 mb-4">
                  Legal terminology in Tetum with Portuguese and English equivalents
                </CardDescription>
                <div className="flex items-center space-x-2">
                  <span className="text-2xl font-bold text-green-600">1,510</span>
                  <span className="text-gray-500 text-sm">terms</span>
                </div>
              </CardContent>
            </Card>

            {/* Portuguese-English Dictionary */}
            <Card className="group cursor-pointer transition-all duration-300 hover:shadow-lg border-gray-200 hover:border-green-200">
              <CardHeader className="flex flex-row items-center space-y-0 pb-4">
                <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center mr-4 group-hover:bg-green-100 transition-colors">
                  <BookOpen className="h-6 w-6 text-green-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg font-semibold text-gray-900">Portuguese-English Dictionary</CardTitle>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Translation</span>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-green-600 transition-colors" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600 mb-4">
                  Comprehensive dictionary with translations between Portuguese and English
                </CardDescription>
                <div className="flex items-center space-x-2">
                  <span className="text-2xl font-bold text-green-600">247</span>
                  <span className="text-gray-500 text-sm">terms</span>
                </div>
              </CardContent>
            </Card>

            {/* Tetum Dictionary (INL) */}
            <Card className="group cursor-pointer transition-all duration-300 hover:shadow-lg border-gray-200 hover:border-orange-200">
              <CardHeader className="flex flex-row items-center space-y-0 pb-4">
                <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center mr-4 group-hover:bg-orange-100 transition-colors">
                  <Globe className="h-6 w-6 text-orange-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg font-semibold text-gray-900">Tetum Dictionary (INL)</CardTitle>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">Reference</span>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-orange-600 transition-colors" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600 mb-4">
                  Instituto Nacional de Linguística Tetum dictionary with comprehensive entries
                </CardDescription>
                <div className="flex items-center space-x-2">
                  <span className="text-2xl font-bold text-green-600">0</span>
                  <span className="text-gray-500 text-sm">terms</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
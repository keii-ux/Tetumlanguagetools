import { useState } from "react";
import { ArrowLeft, Scale, BookOpen, FileText, Globe } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LegalDictionarySearch } from "@/components/LegalDictionarySearch";
import { TetumGlossarySearch } from "@/components/TetumGlossarySearch";
import { PortugueseGlossarySearch } from "@/components/PortugueseGlossarySearch";
import { useDictionaryStats } from "@/lib/search";
import { DictionaryEntry } from "@shared/schema";

export default function LegalDictionaryModule() {
  const [selectedEntry, setSelectedEntry] = useState<DictionaryEntry | null>(null);
  const [activeSection, setActiveSection] = useState("dictionary");
  const { data: stats } = useDictionaryStats();

  const handleEntrySelect = (entry: DictionaryEntry) => {
    setSelectedEntry(entry);
  };

  const sections = [
    {
      id: "dictionary",
      title: "Legal Dictionary",
      subtitle: "Tetum-English-Portuguese Legal Terms",
      description: "Comprehensive legal terminology from the Constitution and legal codes",
      icon: Scale,
      color: "blue",
      count: stats?.legal || 0,
    },
    {
      id: "tetum-glossary",
      title: "Tetum Glossary",
      subtitle: "Legal Terms in Tetum with Explanations",
      description: "Detailed explanations of legal concepts in Tetum language",
      icon: BookOpen,
      color: "green",
      count: 0, // Will be updated when we load the data
    },
    {
      id: "portuguese-glossary",
      title: "Portuguese Glossary",
      subtitle: "Portuguese Legal Terminology",
      description: "Portuguese legal terms with definitions and explanations",
      icon: FileText,
      color: "purple",
      count: 0, // Will be updated when we load the data
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center space-x-2 hover:bg-slate-100"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back to Dictionary</span>
                </Button>
              </Link>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Scale className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-slate-900">Legal Module</h1>
                  <p className="text-sm text-slate-600">Comprehensive Legal Terminology & Glossaries</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                Trilingual
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Section Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {sections.map((section) => {
            const Icon = section.icon;
            const isActive = activeSection === section.id;
            return (
              <Card
                key={section.id}
                className={`cursor-pointer transition-all duration-200 ${
                  isActive
                    ? "ring-2 ring-blue-500 bg-blue-50"
                    : "hover:shadow-lg border-gray-200"
                }`}
                onClick={() => setActiveSection(section.id)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className={`w-12 h-12 bg-${section.color}-100 rounded-xl flex items-center justify-center`}>
                      <Icon className={`w-6 h-6 text-${section.color}-600`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {section.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">
                        {section.subtitle}
                      </p>
                      <p className="text-xs text-gray-500 mb-3">
                        {section.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-blue-600">
                          {section.count.toLocaleString()}
                        </span>
                        <span className="text-xs text-gray-400">terms</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Content Sections */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <Tabs value={activeSection} onValueChange={setActiveSection} className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-gray-50 rounded-t-lg">
              <TabsTrigger value="dictionary" className="flex items-center space-x-2">
                <Scale className="w-4 h-4" />
                <span className="hidden sm:inline">Legal Dictionary</span>
                <span className="sm:hidden">Dictionary</span>
              </TabsTrigger>
              <TabsTrigger value="tetum-glossary" className="flex items-center space-x-2">
                <BookOpen className="w-4 h-4" />
                <span className="hidden sm:inline">Tetum Glossary</span>
                <span className="sm:hidden">Tetum</span>
              </TabsTrigger>
              <TabsTrigger value="portuguese-glossary" className="flex items-center space-x-2">
                <FileText className="w-4 h-4" />
                <span className="hidden sm:inline">Portuguese Glossary</span>
                <span className="sm:hidden">Portuguese</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="dictionary" className="p-0">
              <LegalDictionarySearch onEntrySelect={handleEntrySelect} />
            </TabsContent>

            <TabsContent value="tetum-glossary" className="p-0">
              <TetumGlossarySearch onEntrySelect={handleEntrySelect} />
            </TabsContent>

            <TabsContent value="portuguese-glossary" className="p-0">
              <PortugueseGlossarySearch onEntrySelect={handleEntrySelect} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
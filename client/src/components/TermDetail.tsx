import { Button } from "@/components/ui/button";
import { X, Bookmark, BookmarkCheck } from "lucide-react";
import { DictionaryEntry } from "@shared/schema";
import { useCreateBookmark, useDeleteBookmark, useBookmarks } from "@/lib/search";

interface TermDetailProps {
  entry: DictionaryEntry | null;
  onClose: () => void;
  userId: string;
}

export function TermDetail({ entry, onClose, userId }: TermDetailProps) {
  const { data: bookmarks = [] } = useBookmarks(userId);
  const createBookmark = useCreateBookmark();
  const deleteBookmark = useDeleteBookmark();

  if (!entry) return null;

  const isBookmarked = bookmarks.some(b => b.entryId === entry.id);

  const handleBookmarkToggle = async () => {
    if (isBookmarked) {
      await deleteBookmark.mutateAsync({ userId, entryId: entry.id });
    } else {
      await createBookmark.mutateAsync({ userId, entryId: entry.id });
    }
  };

  const getDisplayTerm = () => {
    return entry.tetum || entry.portuguese || entry.english || "Unknown";
  };

  // Parse tri-lingual content if it exists
  const parseTrilingualContent = (explanation: string) => {
    // Check if it's a tri-lingual entry with structured content
    if (explanation.includes("**Portuguese:**") && explanation.includes("**Tetum:**") && explanation.includes("**English definition:**")) {
      const sections = explanation.split('\n\n');
      const parsed = {
        title: "",
        portuguese: { term: "", definitions: [] as string[] },
        tetum: { term: "", definitions: [] as string[] },
        english: { definitions: [] as string[] },
        examples: [] as string[],
        sources: ""
      };

      sections.forEach(section => {
        if (section.startsWith("**") && section.includes("** *(n.)*")) {
          parsed.title = section.replace(/\*\*/g, "").replace(" *(n.)*", "");
        } else if (section.startsWith("**Portuguese:**")) {
          const content = section.replace("**Portuguese:**", "").trim();
          const lines = content.split('\n');
          parsed.portuguese.term = lines[0].replace(/\*/g, "").trim();
          parsed.portuguese.definitions = lines.slice(1).filter(line => line.startsWith("•")).map(line => line.replace("•", "").trim());
        } else if (section.startsWith("**Tetum:**")) {
          const content = section.replace("**Tetum:**", "").trim();
          const lines = content.split('\n');
          parsed.tetum.term = lines[0].replace(/\*/g, "").trim();
          parsed.tetum.definitions = lines.slice(1).filter(line => line.startsWith("•")).map(line => line.replace("•", "").trim());
        } else if (section.startsWith("**English definition:**")) {
          const content = section.replace("**English definition:**", "").trim();
          parsed.english.definitions = content.split('\n').filter(line => line.startsWith("•")).map(line => line.replace("•", "").trim());
        } else if (section.startsWith("**Examples:**")) {
          const content = section.replace("**Examples:**", "").trim();
          parsed.examples = content.split('\n').filter(line => line.startsWith("•")).map(line => line.replace("•", "").trim());
        } else if (section.startsWith("**Sources:**")) {
          parsed.sources = section.replace("**Sources:**", "").trim();
        }
      });

      return parsed;
    }
    return null;
  };

  const trilingualContent = entry.explanation ? parseTrilingualContent(entry.explanation) : null;

  return (
    <div className="w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Word Details</h2>
        <Button variant="ghost" size="sm" onClick={onClose} className="p-2 rounded-full">
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="p-4 space-y-4">
        {/* Main Term */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{getDisplayTerm()}</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBookmarkToggle}
              className="p-2 rounded-full"
            >
              {isBookmarked ? (
                <BookmarkCheck className="h-5 w-5 text-yellow-500" />
              ) : (
                <Bookmark className="h-5 w-5 text-gray-400 hover:text-yellow-500" />
              )}
            </Button>
          </div>

          {/* Word Class Badge */}
          {entry.wordClass && (
            <span className="inline-block px-3 py-1 text-sm bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full mb-4">
              {entry.wordClass}
            </span>
          )}

          {/* Tri-lingual Definition Display */}
          {trilingualContent ? (
            <div className="space-y-4">
              {/* English Title */}
              <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-4 border-l-4 border-blue-500">
                <h4 className="text-lg font-bold text-blue-900 dark:text-blue-200 mb-2">
                  {trilingualContent.title} <span className="text-sm italic">(noun)</span>
                </h4>
              </div>

              {/* Portuguese Section */}
              <div className="bg-green-50 dark:bg-green-900/30 rounded-lg p-4 border-l-4 border-green-500">
                <h4 className="text-sm font-bold text-green-700 dark:text-green-300 mb-2 flex items-center">
                  🇵🇹 Portuguese
                </h4>
                <p className="font-semibold text-green-900 dark:text-green-200 mb-2">
                  {trilingualContent.portuguese.term}
                </p>
                <ul className="space-y-1">
                  {trilingualContent.portuguese.definitions.map((def, idx) => (
                    <li key={idx} className="text-green-800 dark:text-green-300 text-sm">
                      • {def}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Tetum Section */}
              <div className="bg-orange-50 dark:bg-orange-900/30 rounded-lg p-4 border-l-4 border-orange-500">
                <h4 className="text-sm font-bold text-orange-700 dark:text-orange-300 mb-2 flex items-center">
                  🇹🇱 Tetum
                </h4>
                <p className="font-semibold text-orange-900 dark:text-orange-200 mb-2">
                  {trilingualContent.tetum.term}
                </p>
                <ul className="space-y-1">
                  {trilingualContent.tetum.definitions.map((def, idx) => (
                    <li key={idx} className="text-orange-800 dark:text-orange-300 text-sm">
                      • {def}
                    </li>
                  ))}
                </ul>
              </div>

              {/* English Definition Section */}
              <div className="bg-purple-50 dark:bg-purple-900/30 rounded-lg p-4 border-l-4 border-purple-500">
                <h4 className="text-sm font-bold text-purple-700 dark:text-purple-300 mb-2 flex items-center">
                  🇺🇸 English Definition
                </h4>
                <ul className="space-y-1">
                  {trilingualContent.english.definitions.map((def, idx) => (
                    <li key={idx} className="text-purple-800 dark:text-purple-300 text-sm">
                      • {def}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Examples Section */}
              {trilingualContent.examples.length > 0 && (
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border-l-4 border-gray-400">
                  <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                    📝 Examples
                  </h4>
                  <ul className="space-y-1">
                    {trilingualContent.examples.map((example, idx) => (
                      <li key={idx} className="text-gray-800 dark:text-gray-300 text-sm">
                        • {example}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Sources */}
              {trilingualContent.sources && (
                <div className="text-xs text-gray-500 dark:text-gray-500 pt-2 border-t border-gray-200 dark:border-gray-600">
                  <span className="font-medium">Sources:</span> {trilingualContent.sources}
                </div>
              )}
            </div>
          ) : (
            /* Regular Definition Display */
            <>
              {entry.explanation && (
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Definition</h4>
                  <p className="text-gray-900 dark:text-white leading-relaxed whitespace-pre-wrap">{entry.explanation}</p>
                </div>
              )}
            </>
          )}

          {/* Usage Examples */}
          {entry.usageExamples && entry.usageExamples.length > 0 && (
            <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-4">
              <h4 className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-3">Usage Examples</h4>
              <ul className="space-y-2">
                {entry.usageExamples.map((example, idx) => (
                  <li key={idx} className="text-blue-800 dark:text-blue-200 text-sm italic">
                    "{example}"
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Related Terms */}
          {entry.relatedTerms && entry.relatedTerms.length > 0 && (
            <div className="bg-indigo-50 dark:bg-indigo-900/30 rounded-lg p-4">
              <h4 className="text-sm font-medium text-indigo-700 dark:text-indigo-300 mb-3">Related Terms</h4>
              <div className="flex flex-wrap gap-2">
                {entry.relatedTerms.map((term, idx) => (
                  <span key={idx} className="px-2 py-1 bg-indigo-100 dark:bg-indigo-800 text-indigo-800 dark:text-indigo-200 rounded text-sm">
                    {term}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {entry.notes && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Notes</h4>
              <p className="text-gray-600 dark:text-gray-400 text-sm">{entry.notes}</p>
            </div>
          )}

          {/* Source */}
          {entry.source && !trilingualContent && (
            <div className="text-xs text-gray-500 dark:text-gray-500 pt-2 border-t border-gray-200 dark:border-gray-600">
              Source: {entry.source}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
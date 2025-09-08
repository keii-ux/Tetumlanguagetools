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

  // Render trilingual content if available
  if (trilingualContent) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 relative">
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="absolute top-4 right-4 h-8 w-8 p-0 rounded-full"
        >
          <X className="w-4 h-4" />
        </Button>

        <div className="space-y-6">
          <div className="border-b border-gray-200 dark:border-gray-600 pb-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{trilingualContent.title}</h2>
          </div>

          {/* Portuguese Section */}
          {trilingualContent.portuguese.term && (
            <div>
              <h3 className="text-lg font-semibold text-blue-700 dark:text-blue-300 mb-2">Portuguese</h3>
              <p className="font-medium text-gray-900 dark:text-white mb-2">{trilingualContent.portuguese.term}</p>
              {trilingualContent.portuguese.definitions.map((def, index) => (
                <p key={index} className="text-gray-700 dark:text-gray-300 ml-4">• {def}</p>
              ))}
            </div>
          )}

          {/* Tetum Section */}
          {trilingualContent.tetum.term && (
            <div>
              <h3 className="text-lg font-semibold text-green-700 dark:text-green-300 mb-2">Tetum</h3>
              <p className="font-medium text-gray-900 dark:text-white mb-2">{trilingualContent.tetum.term}</p>
              {trilingualContent.tetum.definitions.map((def, index) => (
                <p key={index} className="text-gray-700 dark:text-gray-300 ml-4">• {def}</p>
              ))}
            </div>
          )}

          {/* English Section */}
          {trilingualContent.english.definitions.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-purple-700 dark:text-purple-300 mb-2">English</h3>
              {trilingualContent.english.definitions.map((def, index) => (
                <p key={index} className="text-gray-700 dark:text-gray-300 ml-4">• {def}</p>
              ))}
            </div>
          )}

          {/* Examples */}
          {trilingualContent.examples.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-orange-700 dark:text-orange-300 mb-2">Examples</h3>
              {trilingualContent.examples.map((example, index) => (
                <p key={index} className="text-gray-700 dark:text-gray-300 ml-4">• {example}</p>
              ))}
            </div>
          )}

          {/* Sources */}
          {trilingualContent.sources && (
            <div>
              <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">Sources</h3>
              <p className="text-gray-600 dark:text-gray-400">{trilingualContent.sources}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Render regular dictionary entry
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={onClose}
        className="absolute top-4 right-4 h-8 w-8 p-0 rounded-full"
      >
        <X className="w-4 h-4" />
      </Button>

      <div className="space-y-6">
        {/* Header with term and bookmark */}
        <div className="border-b border-gray-200 dark:border-gray-600 pb-4">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {getDisplayTerm()}
              </h2>
              {entry.wordClass && (
                <span className="inline-block mt-2 px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium">
                  {entry.wordClass}
                </span>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBookmarkToggle}
              className="h-10 w-10 p-0 rounded-full"
            >
              {isBookmarked ? (
                <BookmarkCheck className="w-5 h-5 text-yellow-600" />
              ) : (
                <Bookmark className="w-5 h-5 text-gray-400" />
              )}
            </Button>
          </div>
        </div>

        {/* Languages */}
        <div className="space-y-4">
          {entry.tetum && (
            <div>
              <h3 className="text-sm font-semibold text-green-700 dark:text-green-300 mb-1">Tetum</h3>
              <p className="text-lg text-gray-900 dark:text-white">{entry.tetum}</p>
            </div>
          )}

          {entry.english && (
            <div>
              <h3 className="text-sm font-semibold text-blue-700 dark:text-blue-300 mb-1">English</h3>
              <p className="text-lg text-gray-900 dark:text-white">{entry.english}</p>
            </div>
          )}

          {entry.portuguese && (
            <div>
              <h3 className="text-sm font-semibold text-purple-700 dark:text-purple-300 mb-1">Portuguese</h3>
              <p className="text-lg text-gray-900 dark:text-white">{entry.portuguese}</p>
            </div>
          )}
        </div>

        {/* Definition/Explanation */}
        {entry.explanation && (
          <div>
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Definition</h3>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{entry.explanation}</p>
          </div>
        )}

        {/* Notes */}
        {entry.notes && (
          <div>
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Notes</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">{entry.notes}</p>
          </div>
        )}

        {/* Source */}
        {entry.source && (
          <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Source: {entry.source}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
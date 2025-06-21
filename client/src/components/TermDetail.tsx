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

          {/* Definition */}
          {entry.explanation && (
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Definition</h4>
              <p className="text-gray-900 dark:text-white leading-relaxed">{entry.explanation}</p>
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
          {entry.source && (
            <div className="text-xs text-gray-500 dark:text-gray-500 pt-2 border-t border-gray-200 dark:border-gray-600">
              Source: {entry.source}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
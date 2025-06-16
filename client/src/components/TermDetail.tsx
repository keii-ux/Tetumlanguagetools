import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Share2, Flag, X, Bookmark, BookmarkCheck } from "lucide-react";
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

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${entry.tetum || entry.portuguese || entry.english} - LianTek Pro`,
          text: entry.explanation || `Dictionary entry for ${entry.tetum || entry.portuguese || entry.english}`,
          url: window.location.href,
        });
      } catch (error) {
        // Fallback to clipboard
        await navigator.clipboard.writeText(window.location.href);
      }
    } else {
      // Fallback for browsers without share API
      await navigator.clipboard.writeText(window.location.href);
    }
  };

  const getDisplayTerm = () => {
    return entry.tetum || entry.portuguese || entry.english || "Unknown";
  };

  return (
    <aside className="w-96 bg-white rounded-xl border border-slate-200 h-fit">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Term Details</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Main Term */}
        <div>
          <div className="flex items-center space-x-3 mb-3">
            <h3 className="text-xl font-bold text-slate-900">{getDisplayTerm()}</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBookmarkToggle}
              className="p-1"
            >
              {isBookmarked ? (
                <BookmarkCheck className="h-5 w-5 text-yellow-500" />
              ) : (
                <Bookmark className="h-5 w-5 text-slate-400 hover:text-yellow-500" />
              )}
            </Button>
          </div>

          {/* Category Badge */}
          <Badge variant="secondary" className="mb-4">
            {entry.category || entry.dictionaryType}
          </Badge>

          {/* Pronunciation Guide */}
          {entry.pronunciation && (
            <div className="bg-slate-50 rounded-lg p-3 mb-4">
              <div className="text-sm text-slate-600 mb-1">Pronunciation:</div>
              <div className="text-slate-900 font-medium">{entry.pronunciation}</div>
            </div>
          )}

          {/* Translations */}
          <div className="space-y-3">
            {entry.portuguese && (
              <div>
                <div className="text-sm font-medium text-slate-700 mb-1">Portuguese:</div>
                <div className="text-slate-900">{entry.portuguese}</div>
              </div>
            )}
            {entry.english && (
              <div>
                <div className="text-sm font-medium text-slate-700 mb-1">English:</div>
                <div className="text-slate-900">{entry.english}</div>
              </div>
            )}
            {entry.tetum && entry.tetum !== getDisplayTerm() && (
              <div>
                <div className="text-sm font-medium text-slate-700 mb-1">Tetum:</div>
                <div className="text-slate-900">{entry.tetum}</div>
              </div>
            )}
          </div>
        </div>

        <Separator />

        {/* Definition and Context */}
        {entry.explanation && (
          <div>
            <h4 className="text-sm font-semibold text-slate-900 mb-2">Definition</h4>
            <p className="text-slate-700 text-sm leading-relaxed">{entry.explanation}</p>
          </div>
        )}

        {/* Usage Examples */}
        {entry.usageExamples && entry.usageExamples.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-slate-900 mb-2">Usage Examples</h4>
            <div className="space-y-2">
              {entry.usageExamples.map((example, index) => (
                <div key={index} className="bg-slate-50 rounded-lg p-3">
                  <p className="text-sm text-slate-700">{example}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Word Class and Etymology */}
        {(entry.wordClass || entry.etymology) && (
          <div>
            <h4 className="text-sm font-semibold text-slate-900 mb-2">Linguistic Information</h4>
            <div className="space-y-2 text-sm">
              {entry.wordClass && (
                <div className="flex justify-between">
                  <span className="text-slate-600">Word Class:</span>
                  <span className="text-slate-900">{entry.wordClass}</span>
                </div>
              )}
              {entry.etymology && (
                <div className="flex justify-between">
                  <span className="text-slate-600">Etymology:</span>
                  <span className="text-slate-900">{entry.etymology}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Source Information */}
        <div>
          <h4 className="text-sm font-semibold text-slate-900 mb-2">Source Information</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-600">Source:</span>
              <span className="text-slate-900">{entry.source || "Unknown"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Category:</span>
              <span className="text-slate-900">{entry.category || entry.dictionaryType}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Type:</span>
              <span className="text-slate-900 capitalize">{entry.dictionaryType}</span>
            </div>
          </div>
        </div>

        {/* Related Terms */}
        {entry.relatedTerms && entry.relatedTerms.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-slate-900 mb-2">Related Terms</h4>
            <div className="space-y-1">
              {entry.relatedTerms.map((term, index) => (
                <Button
                  key={index}
                  variant="link"
                  className="h-auto p-0 text-sm text-left justify-start"
                >
                  {term}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Notes */}
        {entry.notes && (
          <div>
            <h4 className="text-sm font-semibold text-slate-900 mb-2">Notes</h4>
            <p className="text-sm text-slate-600">{entry.notes}</p>
          </div>
        )}

        <Separator />

        {/* Actions */}
        <div className="flex space-x-2">
          <Button className="flex-1" onClick={handleShare}>
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
          <Button variant="outline" className="flex-1">
            <Flag className="w-4 h-4 mr-2" />
            Report
          </Button>
        </div>
      </CardContent>
    </aside>
  );
}

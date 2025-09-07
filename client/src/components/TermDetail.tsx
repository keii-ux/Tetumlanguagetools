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

  return null;
}
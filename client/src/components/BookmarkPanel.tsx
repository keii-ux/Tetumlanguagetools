import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BookmarkCheck, Search, X, Trash2, ExternalLink } from "lucide-react";
import { useBookmarks, useDeleteBookmark, useEntry } from "@/lib/search";
import { DictionaryEntry } from "@shared/schema";

interface BookmarkPanelProps {
  userId: string;
  onClose: () => void;
  onEntrySelect: (entry: DictionaryEntry) => void;
}

function BookmarkItem({ 
  bookmarkId, 
  entryId, 
  userId, 
  onEntrySelect, 
  onDelete 
}: {
  bookmarkId: number;
  entryId: number;
  userId: string;
  onEntrySelect: (entry: DictionaryEntry) => void;
  onDelete: (bookmarkId: number) => void;
}) {
  const { data: entry, isLoading } = useEntry(entryId);

  if (isLoading) {
    return (
      <div className="p-3 border rounded-lg animate-pulse">
        <div className="h-4 bg-slate-200 rounded w-2/3 mb-2"></div>
        <div className="h-3 bg-slate-200 rounded w-1/2"></div>
      </div>
    );
  }

  if (!entry) {
    return (
      <div className="p-3 border rounded-lg bg-red-50">
        <p className="text-sm text-red-600">Entry not found</p>
        <Button
          size="sm"
          variant="outline"
          onClick={() => onDelete(bookmarkId)}
          className="mt-2"
        >
          Remove
        </Button>
      </div>
    );
  }

  const displayTerm = entry.tetum || entry.portuguese || entry.english || "Unknown";

  return (
    <div className="p-3 border rounded-lg hover:border-slate-300 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-1">
            <h4 className="font-medium text-slate-900">{displayTerm}</h4>
            <Badge variant="secondary" className="text-xs">
              {entry.category || entry.dictionaryType}
            </Badge>
          </div>
          
          <div className="space-y-1 text-sm">
            {entry.portuguese && entry.portuguese !== displayTerm && (
              <p className="text-slate-600">PT: {entry.portuguese}</p>
            )}
            {entry.english && entry.english !== displayTerm && (
              <p className="text-slate-600">EN: {entry.english}</p>
            )}
          </div>

          {entry.explanation && (
            <p className="text-xs text-slate-500 mt-2 truncate">
              {entry.explanation.substring(0, 100)}...
            </p>
          )}
        </div>

        <div className="flex items-center space-x-1 ml-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onEntrySelect(entry)}
            className="p-1"
          >
            <ExternalLink className="h-3 w-3" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onDelete(bookmarkId)}
            className="p-1 text-red-500 hover:text-red-700"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export function BookmarkPanel({ userId, onClose, onEntrySelect }: BookmarkPanelProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");

  const { data: bookmarks = [], isLoading } = useBookmarks(userId);
  const deleteBookmark = useDeleteBookmark();

  const handleDeleteBookmark = async (bookmarkId: number) => {
    const bookmark = bookmarks.find(b => b.id === bookmarkId);
    if (bookmark && bookmark.entryId !== null) {
      await deleteBookmark.mutateAsync({ userId, entryId: bookmark.entryId });
    }
  };

  const filteredBookmarks = bookmarks.filter(bookmark => {
    // This is a simplified filter - in a real implementation, you'd need to fetch
    // the entry data to filter by term content and type
    return true;
  });

  if (isLoading) {
    return (
      <Card className="w-96">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">My Bookmarks</CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="p-3 border rounded-lg animate-pulse">
                <div className="h-4 bg-slate-200 rounded w-2/3 mb-2"></div>
                <div className="h-3 bg-slate-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-96 max-h-[80vh] flex flex-col">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center space-x-2">
            <BookmarkCheck className="h-5 w-5 text-yellow-500" />
            <span>My Bookmarks</span>
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Search and Filter */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search bookmarks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="legal">Legal</SelectItem>
              <SelectItem value="medical">Medical</SelectItem>
              <SelectItem value="general">General</SelectItem>
              <SelectItem value="asean">ASEAN</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-y-auto">
        {bookmarks.length === 0 ? (
          <div className="text-center py-8">
            <BookmarkCheck className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 text-sm">No bookmarks yet</p>
            <p className="text-slate-400 text-xs mt-1">
              Bookmark terms while browsing to save them here
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredBookmarks.map((bookmark) => (
              bookmark.entryId !== null && (
                <BookmarkItem
                  key={bookmark.id}
                  bookmarkId={bookmark.id}
                  entryId={bookmark.entryId}
                  userId={userId}
                  onEntrySelect={onEntrySelect}
                  onDelete={handleDeleteBookmark}
                />
              )
            ))}
          </div>
        )}
      </CardContent>

      {bookmarks.length > 0 && (
        <div className="p-4 border-t">
          <p className="text-xs text-slate-500 text-center">
            {bookmarks.length} bookmark{bookmarks.length !== 1 ? 's' : ''} saved
          </p>
        </div>
      )}
    </Card>
  );
}

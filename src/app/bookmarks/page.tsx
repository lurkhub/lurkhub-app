"use client";

import BookmarkCard from "@/components/bookmarks/BookmarkCard";
import FilterableTagSelector from "@/components/common/FilterableTagSelector";
import LoadingMessage from "@/components/common/LoadingMessage";
import SearchBar from "@/components/common/SearchBar";
import { useBookmarks } from "@/hooks/useBookmarks";
import { useFilteredItems } from "@/hooks/useFilteredItems";
import { extractUniqueTags } from "@/utils/tagUtils";
import { useRouter } from "next/navigation";

export default function BookmarksPage() {
    const { bookmarks, loading, error } = useBookmarks();

    const {
        searchTerm,
        setSearchTerm,
        selectedTags,
        toggleTag,
        sortOrder,
        setSortOrder,
        filteredItems,
        availableTags,
    } = useFilteredItems(bookmarks);

    const uniqueTags = extractUniqueTags(bookmarks);
    const router = useRouter();

    const handleAddNew = () => router.push("/bookmarks/add");
    const handleArchive = () => router.push("/bookmarks/archives"); // Optional if you want it

    if (loading) {
        return <LoadingMessage text="Loading bookmarks..." />
    }

    if (error) {
        return (
            <div className="p-4 text-red-600 bg-red-100 rounded-lg">
                <p className="font-medium">Failed to load bookmarks</p>
                <p className="text-sm">{error.message}</p>
            </div>
        );
    }

    return (
        <div>
            <FilterableTagSelector
                allTags={uniqueTags}
                selectedTags={selectedTags}
                availableTags={availableTags}
                onToggle={toggleTag}
                searchTerm={searchTerm}
            />

            <SearchBar
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                sortOrder={sortOrder}
                setSortOrder={setSortOrder}
                onAddNew={handleAddNew}
                onArchive={handleArchive}
                placeholder="Search bookmarks"
            />

            <div className="space-y-4">
                {filteredItems.map((bookmark) => (
                    <BookmarkCard key={bookmark.id} bookmark={bookmark} />
                ))}
            </div>
        </div>
    );
}

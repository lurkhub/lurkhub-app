"use client";

import FilterableTagSelector from "@/components/common/FilterableTagSelector";
import LoadingMessage from "@/components/common/LoadingMessage";
import SearchBar from "@/components/common/SearchBar";
import FeedCard from "@/components/feeds/FeedCard";
import { useFeeds } from "@/hooks/useFeeds";
import { useFilteredItems } from "@/hooks/useFilteredItems";
import { extractUniqueTags } from "@/utils/tagUtils";
import { useRouter } from "next/navigation";

export default function FeedsPage() {
    const { feeds, loading, error } = useFeeds();
    const router = useRouter();

    const normalizedFeeds = feeds.map((feed) => ({
        ...feed,
        created: feed.lastPublished ?? feed.created,
    }));

    const {
        searchTerm,
        setSearchTerm,
        selectedTags,
        toggleTag,
        sortOrder,
        setSortOrder,
        filteredItems,
        availableTags,
    } = useFilteredItems(normalizedFeeds);

    const uniqueTags = extractUniqueTags(feeds);

    const handleAddNew = () => router.push("/feeds/add");
    const handleArchive = () => router.push("/feeds/archives"); // Optional

    if (loading) {
        return <LoadingMessage text="Loading feeds..." />
    }

    if (error) {
        return (
            <div className="p-4 text-red-600 bg-red-100 rounded-lg">
                <p className="font-medium">Failed to load feeds</p>
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
                placeholder="Search feeds"
            />

            <div className="space-y-4">
                {filteredItems.map((feed) => (
                    <FeedCard key={feed.id} feed={feed} />
                ))}
            </div>
        </div>
    );
}

"use client";

import FilterableTagSelector from "@/components/common/FilterableTagSelector";
import LoadingMessage from "@/components/common/LoadingMessage";
import SearchBar from "@/components/common/SearchBar";
import FeedCard from "@/components/feeds/FeedCard";
import { useFeedsArchived } from "@/hooks/useFeedsArchived";
import { useFilteredItems } from "@/hooks/useFilteredItems";
import { extractUniqueTags } from "@/utils/tagUtils";
import { useRouter } from "next/navigation";

export default function ArchivedFeedsPage() {
    const { feeds, loading, error } = useFeedsArchived();
    const router = useRouter();

    const {
        searchTerm,
        setSearchTerm,
        selectedTags,
        toggleTag,
        sortOrder,
        setSortOrder,
        filteredItems,
        availableTags,
    } = useFilteredItems(feeds);

    const uniqueTags = extractUniqueTags(feeds);

    const handleBackToFeeds = () => router.push("/feeds");

    if (loading) {
        return <LoadingMessage text="Loading archived feeds..." />;
    }

    if (error) {
        return (
            <div className="p-4 text-red-600 bg-red-100 rounded-lg">
                <p className="font-medium">Failed to load archived feeds</p>
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
                onCurrent={handleBackToFeeds}
                placeholder="Search archived feeds"
            />

            <div className="space-y-4">
                {filteredItems.map((feed) => (
                    <FeedCard key={feed.id} feed={feed} isArchived />
                ))}
            </div>
        </div>
    );
}

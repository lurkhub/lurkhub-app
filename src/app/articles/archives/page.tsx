"use client";

import ArticleCard from "@/components/articles/ArticleCard";
import FilterableTagSelector from "@/components/common/FilterableTagSelector";
import LoadingMessage from "@/components/common/LoadingMessage";
import SearchBar from "@/components/common/SearchBar";
import { useArticles } from "@/hooks/useArticles";
import { useFilteredItems } from "@/hooks/useFilteredItems";
import { extractUniqueTags } from "@/utils/tagUtils";
import { useRouter } from "next/navigation";

export default function ArchivedArticlesPage() {
    const { articles, loading, error } = useArticles({ archived: true });

    const {
        searchTerm,
        setSearchTerm,
        selectedTags,
        toggleTag,
        sortOrder,
        setSortOrder,
        filteredItems,
        availableTags,
    } = useFilteredItems(articles);

    const router = useRouter();
    const handleBackToArticles = () => router.push("/articles");

    const uniqueTags = extractUniqueTags(articles);

    if (loading) {
        return <LoadingMessage text="Loading archived articles..." />;
    }

    if (error) {
        return (
            <div className="p-4 text-red-600 bg-red-100 rounded-lg">
                <p className="font-medium">Failed to load archived articles</p>
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
                onCurrent={handleBackToArticles}
                placeholder="Search archived articles"
            />

            <div className="space-y-4">
                {filteredItems.map((article) => (
                    <ArticleCard key={article.id} article={article} isArchived />
                ))}
            </div>
        </div>
    );
}

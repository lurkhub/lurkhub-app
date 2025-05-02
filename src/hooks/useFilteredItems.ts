import { useMemo, useState } from "react";

interface TaggableItem {
    title: string;
    created: string;
    tags?: string;
}

export function useFilteredItems<T extends TaggableItem>(items: T[]) {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [sortOrder, setSortOrder] = useState<"asc" | "dsc">("dsc");

    const toggleTag = (tag: string) => {
        setSelectedTags((prev) =>
            prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
        );
    };

    const filteredItems = useMemo(() => {
        return items
            .filter((item) => {
                const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase());
                const itemTags = item.tags?.split(",").map((t) => t.trim()) || [];
                const matchesTags =
                    selectedTags.length === 0 || selectedTags.every((tag) => itemTags.includes(tag));
                return matchesSearch && matchesTags;
            })
            .sort((a, b) => {
                const aTime = new Date(a.created).getTime();
                const bTime = new Date(b.created).getTime();
                return sortOrder === "asc" ? aTime - bTime : bTime - aTime;
            });
    }, [items, searchTerm, selectedTags, sortOrder]);

    const availableTags = useMemo(() => {
        const tags = new Set<string>();
        filteredItems.forEach((item) =>
            item.tags?.split(",").map((tag) => tag.trim()).forEach((tag) => tags.add(tag))
        );
        return tags;
    }, [filteredItems]);

    return {
        searchTerm,
        setSearchTerm,
        selectedTags,
        toggleTag,
        sortOrder,
        setSortOrder,
        filteredItems,
        availableTags,
    };
}

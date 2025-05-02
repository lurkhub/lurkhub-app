import TagSelector from "./TagSelector";

interface FilterableTagSelectorProps {
    allTags: string[];
    selectedTags: string[];
    availableTags: Set<string>;
    onToggle: (tag: string) => void;
    searchTerm?: string;
}

export default function FilterableTagSelector({
    allTags,
    selectedTags,
    availableTags,
    onToggle,
    searchTerm = "",
}: FilterableTagSelectorProps) {
    const disabledTags = allTags.filter(
        (tag) =>
            !availableTags.has(tag) &&
            !selectedTags.includes(tag) &&
            (selectedTags.length > 0 || searchTerm.length > 0)
    );

    return (
        <TagSelector
            tags={allTags}
            selectedTags={selectedTags}
            onToggle={onToggle}
            disabledTags={disabledTags}
        />
    );
}

interface TagSelectorProps {
    tags: string[];
    selectedTags: string[];
    onToggle: (tag: string) => void;
    disabledTags?: string[];
}

export default function TagSelector({
    tags,
    selectedTags,
    onToggle,
    disabledTags = [],
}: TagSelectorProps) {
    return (
        <div className="tags mb-4">
            {tags.map((tag) => {
                const isSelected = selectedTags.includes(tag);
                const isDisabled = disabledTags.includes(tag);
                const baseClass =
                    "inline-block select-none px-3 py-1 mr-2 mb-2 rounded-full text-sm transition-colors";
                const clickableClass = "cursor-pointer";
                const selectedClass = "bg-blue-500 text-white";
                const normalClass = "bg-blue-100 text-blue-800";
                const disabledClass = "bg-gray-100 text-gray-400 cursor-not-allowed";

                return (
                    <span
                        key={tag}
                        onClick={() => !isDisabled && onToggle(tag)}
                        className={`${baseClass} ${isDisabled
                            ? disabledClass
                            : isSelected
                                ? selectedClass
                                : normalClass
                            } ${!isDisabled ? clickableClass : ""}`}
                    >
                        {tag}
                    </span>
                );
            })}
        </div>
    );
}

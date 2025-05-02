import { useEffect, useState } from "react";
import { Archive, ChevronsDown, ChevronsUp, CornerDownLeft, PlusCircle } from "react-feather";

interface SearchBarProps {
    searchTerm: string;
    setSearchTerm: (value: string) => void;
    sortOrder: "asc" | "dsc";
    setSortOrder: (value: "asc" | "dsc") => void;
    onAddNew?: () => void;
    onArchive?: () => void;
    onCurrent?: () => void;
    placeholder?: string;
}

export default function SearchBar({
    searchTerm,
    setSearchTerm,
    sortOrder,
    setSortOrder,
    onAddNew,
    onArchive,
    onCurrent,
    placeholder = "Search",
}: SearchBarProps) {
    const [localInput, setLocalInput] = useState(searchTerm);

    useEffect(() => {
        const timeout = setTimeout(() => {
            setSearchTerm(localInput.trim());
        }, 300);

        return () => clearTimeout(timeout);
    }, [localInput, setSearchTerm]);

    return (
        <div className="mb-4 flex flex-col space-y-2 md:flex-row md:items-center md:space-y-0 md:space-x-2">
            <input
                type="text"
                placeholder={placeholder}
                value={localInput}
                onChange={(e) => setLocalInput(e.target.value)}
                className="border p-2 rounded w-full md:w-auto flex-grow"
            />

            <div className="flex flex-row flex-wrap gap-2">
                <button
                    onClick={() =>
                        setSortOrder(sortOrder === "asc" ? "dsc" : "asc")
                    }
                    title="Toggle Sort Order"
                    className="flex-1 flex justify-center items-center bg-gray-500 text-white px-4 py-2 rounded"
                >
                    {sortOrder === "asc" ? <ChevronsUp /> : <ChevronsDown />}
                </button>

                {onArchive && (
                    <button
                        onClick={onArchive}
                        title="View Archives"
                        className="flex-1 flex justify-center items-center bg-gray-600 text-white px-4 py-2 rounded"
                    >
                        <Archive />
                    </button>
                )}

                {onCurrent && (
                    <button
                        onClick={onCurrent}
                        title="View Current"
                        className="flex-1 flex justify-center items-center bg-blue-600 text-white px-4 py-2 rounded"
                    >
                        <CornerDownLeft />
                    </button>
                )}

                {onAddNew && (
                    <button
                        onClick={onAddNew}
                        title="Add New"
                        className="flex-1 flex justify-center items-center bg-blue-600 text-white px-4 py-2 rounded"
                    >
                        <PlusCircle />
                    </button>
                )}
            </div>


        </div>
    );
}

import { Taggable } from "@/types/taggable";

export function extractUniqueTags<T extends Taggable>(items: T[]): string[] {
    const tagSet = new Set<string>();

    items.forEach(item => {
        item.tags
            ?.split(",")
            .map(tag => tag.trim())
            .filter(tag => tag.length > 0)
            .forEach(tag => tagSet.add(tag));
    });

    return Array.from(tagSet).sort((a, b) => a.localeCompare(b));
}

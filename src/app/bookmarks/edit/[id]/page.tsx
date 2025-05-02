'use client';

import TagSelector from '@/components/common/TagSelector';
import { pagePaths } from '@/constants/pagePaths';
import { getBookmarkById, getBookmarks, updateBookmark } from '@/services/bookmarkService';
import { Bookmark } from '@/types/bookmark';
import { extractUniqueTags } from '@/utils/tagUtils';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { CornerDownLeft, Save } from 'react-feather';

export const runtime = 'edge';

export default function Page() {
    const { id } = useParams();
    const router = useRouter();
    const [bookmark, setBookmark] = useState<Bookmark | null>(null);
    const [allTags, setAllTags] = useState<string[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const selectedTags = bookmark?.tags
        ?.split(',')
        .map(tag => tag.trim())
        .filter(Boolean) ?? [];

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [bookmarkResult, allBookmarks] = await Promise.all([
                    getBookmarkById(id as string),
                    getBookmarks(),
                ]);

                if (!bookmarkResult) {
                    setError(`Bookmark with id "${id}" not found.`);
                    return;
                }

                setBookmark(bookmarkResult);
                setAllTags(extractUniqueTags(allBookmarks));
            } catch (err: unknown) {
                setError((err as Error).message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        if (bookmark) {
            setBookmark({ ...bookmark, [name]: value });
        }
    };

    const toggleTag = (tag: string) => {
        if (!bookmark) return;

        const currentTags = selectedTags;
        const updatedTags = currentTags.includes(tag)
            ? currentTags.filter(t => t !== tag)
            : [...currentTags, tag];

        setBookmark({ ...bookmark, tags: updatedTags.join(', ') });
    };

    const handleSave = async () => {
        if (!bookmark) return;
        setSaving(true);

        try {
            const response = await updateBookmark(bookmark);

            if (!response.ok) {
                throw new Error('Failed to update bookmark');
            }

            router.push(pagePaths.bookmarks);
        } catch (err: unknown) {
            setError((err as Error).message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-4">Loading...</div>;
    if (error) return <div className="p-4 text-red-600">Error: {error}</div>;
    if (!bookmark) return null;

    return (
        <div className="p-6 max-w-xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">Edit Bookmark</h1>

            <form className="space-y-4" onSubmit={e => e.preventDefault()}>
                <div>
                    <label className="block font-medium">Title</label>
                    <input
                        type="text"
                        name="title"
                        value={bookmark.title}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded px-3 py-2"
                    />
                </div>

                <div>
                    <label className="block font-medium">URL</label>
                    <input
                        type="text"
                        name="url"
                        value={bookmark.url}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded px-3 py-2"
                    />
                </div>

                <div>
                    <label className="block font-medium">Tags (comma-separated)</label>
                    <input
                        type="text"
                        name="tags"
                        value={bookmark.tags}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded px-3 py-2"
                    />

                    <div className="mt-2">
                        <TagSelector
                            tags={allTags}
                            selectedTags={selectedTags}
                            onToggle={toggleTag}
                        />
                    </div>
                </div>

                <div className="flex justify-between mt-6">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="text-gray-700 border border-gray-300 px-4 py-2 rounded hover:bg-gray-100 flex items-center gap-2"
                    >
                        <CornerDownLeft size={18} />
                        Back
                    </button>

                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2"
                    >
                        <Save size={18} />
                        {saving ? 'Saving...' : 'Save'}
                    </button>
                </div>
            </form>
        </div>
    );
}

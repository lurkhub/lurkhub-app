'use client';
export const runtime = 'edge';

import { pagePaths } from '@/constants/pagePaths';
import { archiveBookmark, getBookmarkById } from '@/services/bookmarkService';
import { Bookmark } from '@/types/bookmark';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Page() {
    const { id } = useParams();
    const router = useRouter();
    const [bookmark, setBookmark] = useState<Bookmark | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [archiving, setArchiving] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const result = await getBookmarkById(id as string);
                if (!result) {
                    setError(`Bookmark with id "${id}" not found.`);
                } else {
                    setBookmark(result);
                }
            } catch (err: unknown) {
                setError((err as Error).message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    const handleArchive = async () => {
        if (!bookmark) return;
        setArchiving(true);

        try {
            const res = await archiveBookmark(bookmark);

            if (!res.ok) {
                throw new Error('Failed to archive bookmark');
            }

            router.push(pagePaths.bookmarks);
        } catch (err: unknown) {
            setError((err as Error).message);
        } finally {
            setArchiving(false);
        }
    };

    if (loading) return <div className="p-4">Loading...</div>;
    if (error) return <div className="p-4 text-red-600">Error: {error}</div>;
    if (!bookmark) return null;

    return (
        <div className="p-6 max-w-xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">Archive Bookmark</h1>
            <p className="text-gray-600 mb-4">Are you sure you want to archive this bookmark?</p>

            <div className="space-y-4">
                <div>
                    <label className="block font-medium">Title</label>
                    <input
                        type="text"
                        value={bookmark.title}
                        readOnly
                        className="w-full bg-gray-100 border border-gray-300 rounded px-3 py-2"
                    />
                </div>

                <div>
                    <label className="block font-medium">URL</label>
                    <input
                        type="text"
                        value={bookmark.url}
                        readOnly
                        className="w-full bg-gray-100 border border-gray-300 rounded px-3 py-2"
                    />
                </div>

                <div>
                    <label className="block font-medium">Tags</label>
                    <input
                        type="text"
                        value={bookmark.tags}
                        readOnly
                        className="w-full bg-gray-100 border border-gray-300 rounded px-3 py-2"
                    />
                </div>
            </div>

            <div className="mt-6 flex gap-4">
                <button
                    onClick={handleArchive}
                    disabled={archiving}
                    className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
                >
                    {archiving ? 'Archiving...' : 'Archive'}
                </button>
                <button
                    onClick={() => router.push('/artcles')}
                    className="px-4 py-2 border border-gray-400 rounded hover:bg-gray-100"
                >
                    Cancel
                </button>
            </div>
        </div>
    );
}

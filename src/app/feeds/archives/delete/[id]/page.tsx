'use client';
export const runtime = 'edge';

import { pagePaths } from '@/constants/pagePaths';
import { deleteArchivedFeed, getArchivedFeedById } from '@/services/feedService';
import { Feed } from '@/types/feeds/feed';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function DeleteArchivedFeedPage() {
    const { id } = useParams();
    const router = useRouter();
    const [feed, setFeed] = useState<Feed | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const result = await getArchivedFeedById(id as string);

                if (!result) {
                    setError(`Archived feed with id "${id}" not found.`);
                } else {
                    setFeed(result);
                }
            } catch (err: unknown) {
                setError((err as Error).message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    const handleDelete = async () => {
        if (!feed) return;
        setDeleting(true);

        try {
            const res = await deleteArchivedFeed(feed.id);

            if (!res.ok) {
                throw new Error('Failed to delete archived feed');
            }

            router.push(`${pagePaths.feeds}/archives`);
        } catch (err: unknown) {
            setError((err as Error).message);
        } finally {
            setDeleting(false);
        }
    };

    if (loading) return <div className="p-4">Loading...</div>;
    if (error) return <div className="p-4 text-red-600">Error: {error}</div>;
    if (!feed) return null;

    return (
        <div className="p-6 max-w-xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">Delete Archived Feed</h1>
            <p className="text-gray-600 mb-4">Are you sure you want to permanently delete this archived feed?</p>

            <div className="space-y-4">
                <div>
                    <label className="block font-medium">Title</label>
                    <input
                        type="text"
                        value={feed.title}
                        readOnly
                        className="w-full bg-gray-100 border border-gray-300 rounded px-3 py-2"
                    />
                </div>

                <div>
                    <label className="block font-medium">URL</label>
                    <input
                        type="text"
                        value={feed.url}
                        readOnly
                        className="w-full bg-gray-100 border border-gray-300 rounded px-3 py-2"
                    />
                </div>

                <div>
                    <label className="block font-medium">Tags</label>
                    <input
                        type="text"
                        value={feed.tags}
                        readOnly
                        className="w-full bg-gray-100 border border-gray-300 rounded px-3 py-2"
                    />
                </div>
            </div>

            <div className="mt-6 flex gap-4">
                <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                >
                    {deleting ? 'Deleting...' : 'Delete Permanently'}
                </button>
                <button
                    onClick={() => router.push(`${pagePaths.feeds}/archive`)}
                    className="px-4 py-2 border border-gray-400 rounded hover:bg-gray-100"
                >
                    Cancel
                </button>
            </div>
        </div>
    );
}

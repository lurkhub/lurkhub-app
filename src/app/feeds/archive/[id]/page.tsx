'use client';
export const runtime = 'edge';

import { pagePaths } from '@/constants/pagePaths';
import { archiveFeed, getFeedById } from '@/services/feedService';
import { Feed } from '@/types/feeds/feed';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Page() {
    const { id } = useParams();
    const router = useRouter();
    const [feed, setFeed] = useState<Feed | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [deleting, setArchiving] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const result = await getFeedById(id as string);
                if (!result) {
                    setError(`Feed with id "${id}" not found.`);
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

    const handleArchive = async () => {
        if (!feed) return;
        setArchiving(true);

        try {
            const res = await archiveFeed(feed);

            if (!res.ok) {
                throw new Error('Failed to archive feed');
            }

            router.push(pagePaths.feeds);
        } catch (err: unknown) {
            setError((err as Error).message);
        } finally {
            setArchiving(false);
        }
    };

    if (loading) return <div className="p-4">Loading...</div>;
    if (error) return <div className="p-4 text-red-600">Error: {error}</div>;
    if (!feed) return null;

    return (
        <div className="p-6 max-w-xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">Archive Feed</h1>
            <p className="text-gray-600 mb-4">Are you sure you want to archive this feed?</p>

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
                    onClick={handleArchive}
                    disabled={deleting}
                    className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
                >
                    {deleting ? 'Archiving...' : 'Archive'}
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

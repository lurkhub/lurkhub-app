"use client";

import { fetchFeed, fetchFeedItems } from '@/services/feedService';
import { Feed } from '@/types/feeds/feed';
import { FeedItem } from '@/types/feeds/feedItem';
import { formatSmartDate } from '@/utils/dateUtils';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export const runtime = 'edge';

export default function Page() {
    const { id } = useParams();
    const [feed, setFeed] = useState<Feed | null>(null);
    const [items, setItems] = useState<FeedItem[] | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const load = async () => {
            try {
                const feedData = await fetchFeed(id);
                setFeed(feedData);

                const feedItems = await fetchFeedItems(feedData.url);
                setItems(feedItems);
            } catch (err) {
                const message = err instanceof Error ? err.message : 'Unknown error';
                setError(message);
            } finally {
                setLoading(false);
            }
        };

        load();
    }, [id]);

    return (
        <div className="p-6 max-w-xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">Feed: {feed?.title}</h1>


            {loading && <div className="p-4 flex items-center justify-center h-40 text-gray-600">
                <svg className="animate-spin h-6 w-6 mr-2 text-blue-500" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Loading feeds...
            </div>}

            {error && <p className="text-red-600">Error: {error}</p>}

            {items && (
                <ul className="space-y-4">
                    {items.map((item, idx) => (
                        <li key={idx} className="border p-3 rounded">
                            <a
                                href={item.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline font-medium"
                            >
                                {item.title}
                            </a>
                            <p>
                                {item.published ? formatSmartDate(item.published) : "Unknown"}
                            </p>
                        </li>
                    ))}
                </ul>
            )}

        </div>
    );
}

import { fetchFeedInfo, getFeeds } from '@/services/feedService';
import { Feed } from '@/types/feeds/feed';
import { useEffect, useState } from 'react';

export function useFeeds() {
    const [feeds, setFeeds] = useState<Feed[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        let isCancelled = false;

        function getLocalFeedInfo(feedId: string): { lastPublished?: string; preview?: string } {
            const raw = localStorage.getItem(`feed_info_${feedId}`);
            if (!raw) return {};
            try {
                return JSON.parse(raw);
            } catch {
                return {};
            }
        }

        async function fetchData() {
            try {
                const baseFeeds = await getFeeds();
                if (isCancelled) return;

                const hydratedFeeds = baseFeeds.map((feed) => {
                    const localInfo = getLocalFeedInfo(feed.id);
                    return {
                        ...feed,
                        lastPublished: localInfo.lastPublished,
                        preview: localInfo.preview,
                    };
                });

                const sortedInitial = hydratedFeeds.sort((a, b) => {
                    const dateA = a.lastPublished ?? a.created;
                    const dateB = b.lastPublished ?? b.created;
                    return new Date(dateB).getTime() - new Date(dateA).getTime();
                });

                setFeeds(sortedInitial);
                setLoading(false);

                // Enrich in background
                baseFeeds.forEach(async (feed) => {
                    try {
                        const data = await fetchFeedInfo(feed.url);
                        if (!isCancelled && data) {
                            const infoToStore = {
                                lastPublished: data.lastPublished ?? undefined,
                                preview: data.preview ?? undefined,
                                previewLink: data.previewLink ?? undefined,
                            };
                            localStorage.setItem(`feed_info_${feed.id}`, JSON.stringify(infoToStore));

                            setFeeds((current) => {
                                const updated = current.map((f) =>
                                    f.id === feed.id
                                        ? {
                                            ...f,
                                            lastPublished: infoToStore.lastPublished ?? f.lastPublished,
                                            preview: infoToStore.preview ?? f.preview,
                                            previewLink: infoToStore.previewLink ?? f.previewLink,
                                        }
                                        : f
                                );

                                return updated.sort((a, b) => {
                                    const dateA = a.lastPublished ?? a.created;
                                    const dateB = b.lastPublished ?? b.created;
                                    return new Date(dateB).getTime() - new Date(dateA).getTime();
                                });
                            });
                        }
                    } catch (err) {
                        console.error(`Failed to enrich feed ${feed.id}`, err);
                    }
                });
            } catch (err) {
                if (!isCancelled) {
                    setError(err as Error);
                    setLoading(false);
                }
            }
        }

        fetchData();

        return () => {
            isCancelled = true;
        };
    }, []);

    return { feeds, loading, error };
}

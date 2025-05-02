import { getArchivedFeeds } from "@/services/feedService";
import { Feed } from "@/types/feeds/feed";
import { useEffect, useState } from "react";

export function useFeedsArchived() {
    const [feeds, setFeeds] = useState<Feed[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        async function load() {
            try {
                const data = await getArchivedFeeds();
                setFeeds(data);
            } catch (err) {
                setError(err as Error);
            } finally {
                setLoading(false);
            }
        }

        load();
    }, []);

    return { feeds, loading, error };
}

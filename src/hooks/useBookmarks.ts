import { getArchivedBookmarks, getBookmarks } from "@/services/bookmarkService";
import { Bookmark } from "@/types/bookmark";
import { useEffect, useState } from "react";

export function useBookmarks({ archived = false } = {}) {
    const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        async function load() {
            try {
                const data = archived
                    ? await getArchivedBookmarks()
                    : await getBookmarks();
                setBookmarks(data);
            } catch (err) {
                setError(err as Error);
            } finally {
                setLoading(false);
            }
        }

        load();
    }, [archived]);

    return { bookmarks, loading, error };
}


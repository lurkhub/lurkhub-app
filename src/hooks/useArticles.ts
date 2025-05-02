import { getArchivedArticles, getArticles } from '@/services/articleService';
import { Article } from '@/types/article';
import { useEffect, useState } from 'react';

export function useArticles({ archived = false } = {}) {
    const [articles, setArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        async function load() {
            try {
                const data = archived
                    ? await getArchivedArticles()
                    : await getArticles();
                setArticles(data);
            } catch (err) {
                setError(err as Error);
            } finally {
                setLoading(false);
            }
        }

        load();
    }, [archived]);

    return { articles, loading, error };
}
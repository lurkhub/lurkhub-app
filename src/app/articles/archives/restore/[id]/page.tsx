'use client';
export const runtime = 'edge';

import { pagePaths } from '@/constants/pagePaths';
import { getArchivedArticleById, restoreArticle } from '@/services/articleService';
import { Article } from '@/types/article';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function RestoreArticlePage() {
    const { id } = useParams();
    const router = useRouter();
    const [article, setArticle] = useState<Article | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [restoring, setRestoring] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const result = await getArchivedArticleById(id as string);

                if (!result) {
                    setError(`Archived article with id "${id}" not found.`);
                } else {
                    setArticle(result);
                }
            } catch (err: unknown) {
                setError((err as Error).message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    const handleRestore = async () => {
        if (!article) return;
        setRestoring(true);

        try {
            const res = await restoreArticle(article);

            if (!res.ok) {
                throw new Error('Failed to restore article');
            }

            router.push(pagePaths.articlesArchives);
        } catch (err: unknown) {
            setError((err as Error).message);
        } finally {
            setRestoring(false);
        }
    };

    if (loading) return <div className="p-4">Loading...</div>;
    if (error) return <div className="p-4 text-red-600">Error: {error}</div>;
    if (!article) return null;

    return (
        <div className="p-6 max-w-xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">Restore Article</h1>
            <p className="text-gray-600 mb-4">Are you sure you want to restore this article to the main list?</p>

            <div className="space-y-4">
                <div>
                    <label className="block font-medium">Title</label>
                    <input
                        type="text"
                        value={article.title}
                        readOnly
                        className="w-full bg-gray-100 border border-gray-300 rounded px-3 py-2"
                    />
                </div>

                <div>
                    <label className="block font-medium">URL</label>
                    <input
                        type="text"
                        value={article.url}
                        readOnly
                        className="w-full bg-gray-100 border border-gray-300 rounded px-3 py-2"
                    />
                </div>

                <div>
                    <label className="block font-medium">Tags</label>
                    <input
                        type="text"
                        value={article.tags}
                        readOnly
                        className="w-full bg-gray-100 border border-gray-300 rounded px-3 py-2"
                    />
                </div>
            </div>

            <div className="mt-6 flex gap-4">
                <button
                    onClick={handleRestore}
                    disabled={restoring}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                    {restoring ? 'Restoring...' : 'Restore'}
                </button>
                <button
                    onClick={() => router.push(`${pagePaths.articles}/archive`)}
                    className="px-4 py-2 border border-gray-400 rounded hover:bg-gray-100"
                >
                    Cancel
                </button>
            </div>
        </div>
    );
}

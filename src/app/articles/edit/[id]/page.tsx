'use client';

import TagSelector from '@/components/common/TagSelector';
import { pagePaths } from '@/constants/pagePaths';
import { getArticleById, getArticles, updateArticle } from '@/services/articleService';
import { Article } from '@/types/article';
import { extractUniqueTags } from '@/utils/tagUtils';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { CornerDownLeft, Save } from 'react-feather';

export const runtime = 'edge';

export default function EditItemPage() {
    const { id } = useParams();
    const router = useRouter();
    const [article, setArticle] = useState<Article | null>(null);
    const [allTags, setAllTags] = useState<string[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const selectedTags = article?.tags
        ?.split(",")
        .map(tag => tag.trim())
        .filter(Boolean) ?? [];

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [articleResult, allArticles] = await Promise.all([
                    getArticleById(id as string),
                    getArticles(),
                ]);

                if (!articleResult) {
                    setError(`Article with id "${id}" not found.`);
                    return;
                }

                setArticle(articleResult);
                setAllTags(extractUniqueTags(allArticles));
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
        if (article) {
            setArticle({ ...article, [name]: value });
        }
    };

    const toggleTag = (tag: string) => {
        if (!article) return;

        const currentTags = selectedTags;
        const updatedTags = currentTags.includes(tag)
            ? currentTags.filter(t => t !== tag)
            : [...currentTags, tag];

        setArticle({ ...article, tags: updatedTags.join(', ') });
    };

    const handleSave = async () => {
        if (!article) return;
        setSaving(true);

        try {
            const res = await updateArticle(article);

            if (!res.ok) {
                throw new Error('Failed to update article');
            }

            router.push(pagePaths.articles);
        } catch (err: unknown) {
            setError((err as Error).message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-4">Loading...</div>;
    if (error) return <div className="p-4 text-red-600">Error: {error}</div>;
    if (!article) return null;

    return (
        <div className="p-6 max-w-xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">Edit Article</h1>

            <form className="space-y-4" onSubmit={e => e.preventDefault()}>
                <div>
                    <label className="block font-medium">Title</label>
                    <input
                        type="text"
                        name="title"
                        value={article.title}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded px-3 py-2"
                    />
                </div>

                <div>
                    <label className="block font-medium">URL</label>
                    <input
                        type="text"
                        name="url"
                        value={article.url}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded px-3 py-2"
                    />
                </div>

                <div>
                    <label className="block font-medium">Tags (comma-separated)</label>
                    <input
                        type="text"
                        name="tags"
                        value={article.tags}
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

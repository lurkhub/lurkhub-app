'use client';

import TagSelector from '@/components/common/TagSelector';
import { pagePaths } from '@/constants/pagePaths';
import { createOrUpdateBookmark, getBookmarks } from '@/services/bookmarkService';
import { Bookmark } from '@/types/bookmark';
import { normalizeUrl } from '@/utils/misc';
import { extractUniqueTags } from '@/utils/tagUtils';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { CornerDownLeft, Save } from 'react-feather';

export default function Page() {
    const [title, setTitle] = useState('');
    const [url, setUrl] = useState('');
    const [tags, setTags] = useState('');
    const [allTags, setAllTags] = useState<string[]>([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [titleLoading, setTitleLoading] = useState(false);
    const [titlePlaceholder, setTitlePlaceholder] = useState('');

    const router = useRouter();

    useEffect(() => {
        const fetchTags = async () => {
            try {
                const bookmarks = await getBookmarks();
                setAllTags(extractUniqueTags(bookmarks));
            } catch (err) {
                console.warn('Failed to fetch bookmarks for tag suggestions:', err);
            }
        };

        fetchTags();
    }, []);

    const selectedTags = tags
        .split(',')
        .map(tag => tag.trim())
        .filter(Boolean);

    const toggleTag = (tag: string) => {
        const currentTags = selectedTags;
        const updatedTags = currentTags.includes(tag)
            ? currentTags.filter(t => t !== tag)
            : [...currentTags, tag];

        setTags(updatedTags.join(','));
    };

    const handleUrlBlur = async () => {
        const normalized = normalizeUrl(url);
        if (!normalized) {
            setError('Invalid URL format');
            return;
        }

        setUrl(normalized); // update input with normalized version
        try {
            setTitleLoading(true);
            setTitlePlaceholder('fetching title...');

            const res = await fetch('/api/page/title', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url }),
            });

            if (res.ok) {
                const data = await res.json() as { title: string };
                if (data.title) {
                    setTitle(data.title);
                }
            }
        } catch (err) {
            console.warn('Failed to fetch title:', err);
        } finally {
            setTitleLoading(false);
            setTitlePlaceholder('');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const tagList = tags.split(',').map(tag => tag.trim());
        const hasInvalidTag = tagList.some(tag => tag.includes(' '));
        if (hasInvalidTag) {
            setError('Tags cannot contain spaces. Use commas to separate tags.');
            return;
        }

        const normalized = normalizeUrl(url);
        if (!normalized) {
            setError('Invalid URL format');
            return;
        }

        try {
            setLoading(true);

            const bookmark: Bookmark = {
                id: '',
                title,
                url: normalized,
                tags: tagList.join(','),
                created: '',
            };

            const res = await createOrUpdateBookmark(bookmark);

            if (!res.ok) {
                throw new Error('Failed to save bookmark');
            }

            setError('');
            router.push(pagePaths.bookmarks);
        } catch (err) {
            console.error(err);
            setError('Something went wrong while saving the bookmark.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 max-w-xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">Create New Bookmark</h1>
            <form onSubmit={handleSubmit} className="space-y-4">

                <div>
                    <label className="block font-medium">URL</label>
                    <input
                        type="url"
                        value={url}
                        onChange={e => setUrl(e.target.value)}
                        onBlur={handleUrlBlur}
                        className="w-full border border-gray-300 rounded px-3 py-2"
                        required
                    />
                </div>

                <div>
                    <label className="block font-medium">Title</label>
                    <input
                        type="text"
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        placeholder={titlePlaceholder}
                        readOnly={titleLoading}
                        className="w-full border border-gray-300 rounded px-3 py-2"
                        required
                    />
                </div>

                <div>
                    <label className="block font-medium">Tags (comma-separated, no spaces)</label>
                    <input
                        type="text"
                        value={tags}
                        onChange={e => setTags(e.target.value)}
                        className="w-full border border-gray-300 rounded px-3 py-2"
                        placeholder="tag1,tag2,tag3"
                        required
                    />

                    <div className="mt-2">
                        <TagSelector
                            tags={allTags}
                            selectedTags={selectedTags}
                            onToggle={toggleTag}
                        />
                    </div>
                </div>

                {error && <p className="text-red-600 text-sm">{error}</p>}

                <div className="flex justify-between pt-2">
                    <button
                        type="button"
                        onClick={() => router.push(pagePaths.bookmarks)}
                        className="text-gray-700 border border-gray-300 px-4 py-2 rounded hover:bg-gray-100 flex items-center gap-2"
                    >
                        <CornerDownLeft size={18} />
                        Back
                    </button>

                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50"
                    >
                        <Save size={18} />
                        {loading ? 'Creating...' : 'Create'}
                    </button>
                </div>
            </form>
        </div>
    );
}

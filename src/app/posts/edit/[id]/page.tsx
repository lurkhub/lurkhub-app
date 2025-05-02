'use client';
export const runtime = 'edge';

import { getIndexPathForPage, getPostById, getPostConfig, getPostContent, getPreview, POSTS_PREVIEW_LENGTH, updatePost } from '@/services/postService';
import { Post } from '@/types/post';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function EditPostPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { id } = useParams();
    const [content, setContent] = useState('');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [post, setPost] = useState<Post | null>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const page = parseInt(searchParams.get('page') || '1', 10);

    useEffect(() => {
        const fetchPost = async () => {
            try {
                if (typeof id !== 'string') throw new Error('Missing or invalid post ID');

                const postConfig = await getPostConfig();

                if (postConfig) {
                    const indexPath = getIndexPathForPage(page, postConfig.totalIndexes);
                    const existingPost = await getPostById(indexPath, id);

                    if (!existingPost) throw new Error('Post not found');

                    const fullContent = await getPostContent(id) || "";
                    setPost(existingPost);
                    setContent(fullContent);
                }
            } catch (err) {
                setError((err as Error).message);
            }
        };

        fetchPost();
    }, [id, page]);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setContent(e.target.value);
        const el = textareaRef.current;
        if (el) {
            el.style.height = 'auto';
            const scrollHeight = Math.min(el.scrollHeight, 192);
            el.style.height = `${scrollHeight}px`;
        }
    };

    const handleSubmit = async () => {
        if (!post) return;
        setSaving(true);
        setError(null);

        try {
            const postConfig = await getPostConfig();
            if (!postConfig) throw new Error('Post config not found');

            const indexPath = getIndexPathForPage(page, postConfig.totalIndexes);

            const updatedPost: Post = {
                ...post,
                preview: getPreview(content),
                more: content.trim().length > POSTS_PREVIEW_LENGTH ? "true" : "false",
            };

            await updatePost(indexPath, updatedPost, content);
            router.push('/posts');
        } catch (err) {
            setError((err as Error).message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="flex flex-col h-screen">
            <h1 className="text-1xl font-bold ps-6 py-4">Edit Post</h1>

            <div className="flex px-6 gap-4 h-[calc(100vh-300px)]">
                <div className="w-full md:w-1/2 h-full flex flex-col">
                    <textarea
                        ref={textareaRef}
                        value={content}
                        onChange={handleChange}
                        placeholder="Edit your post..."
                        className="flex-1 w-full border border-gray-300 rounded px-3 py-2 resize-none overflow-y-auto"
                        style={{ minHeight: 0 }}
                    />
                </div>

                <div className="hidden md:block w-1/2 h-full overflow-y-auto border border-gray-200 rounded p-4 bg-white">
                    <div className="prose prose-sm max-w-none">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {content}
                        </ReactMarkdown>
                    </div>
                </div>
            </div>

            {error && (
                <div className="px-6 py-2 text-sm text-red-600 bg-red-100 rounded">
                    {error}
                </div>
            )}

            <div className="flex justify-between items-center px-6 py-4">
                <button
                    onClick={() => router.push('/posts')}
                    className="px-4 py-2 border border-gray-400 rounded hover:bg-gray-100"
                >
                    Back
                </button>
                <button
                    onClick={handleSubmit}
                    disabled={saving || content.trim() === ''}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                >
                    {saving ? 'Saving...' : 'Save'}
                </button>
            </div>
        </div>
    );
}

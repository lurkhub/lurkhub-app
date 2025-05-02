'use client';
export const runtime = 'edge';

import { deletePostById, getIndexPathForPage, getPostById, getPostConfig } from '@/services/postService';
import { Post } from '@/types/post';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function DeletePostPage() {
    const { id } = useParams();
    const searchParams = useSearchParams();
    const router = useRouter();

    const [post, setPost] = useState<Post | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState(false);

    const pageNumber = parseInt(searchParams.get('page') || '1', 10);

    useEffect(() => {
        const fetchPost = async () => {
            try {
                if (typeof id !== 'string') throw new Error('Invalid post ID');

                const postConfig = await getPostConfig();

                if (postConfig) {
                    const indexPath = getIndexPathForPage(pageNumber, postConfig.totalIndexes);
                    const result = await getPostById(indexPath, id);

                    if (!result) {
                        setError(`Post with id "${id}" not found.`);
                    } else {
                        setPost(result);
                    }
                }
            } catch (err) {
                setError((err as Error).message);
            } finally {
                setLoading(false);
            }
        };

        fetchPost();
    }, [id, pageNumber]);

    const handleDelete = async () => {
        if (!post) return;
        setDeleting(true);

        try {
            await deletePostById(pageNumber, post);
            router.push('/posts');
        } catch (err) {
            setError((err as Error).message);
        } finally {
            setDeleting(false);
        }
    };

    if (loading) return <div className="p-4">Loading...</div>;
    if (error) return <div className="p-4 text-red-600">Error: {error}</div>;
    if (!post) return null;

    return (
        <div className="p-6 max-w-xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">Delete Post</h1>
            <p className="text-gray-600 mb-4">Are you sure you want to delete this post?</p>

            <div className="space-y-4">
                <div>
                    <label className="block font-medium">ID</label>
                    <input
                        type="text"
                        value={post.id}
                        readOnly
                        className="w-full bg-gray-100 border border-gray-300 rounded px-3 py-2"
                    />
                </div>

                <div>
                    <label className="block font-medium">Created</label>
                    <input
                        type="text"
                        value={new Date(Number(post.id)).toLocaleString()}
                        readOnly
                        className="w-full bg-gray-100 border border-gray-300 rounded px-3 py-2"
                    />
                </div>

                <div>
                    <label className="block font-medium">Preview</label>
                    <textarea
                        value={post.preview}
                        readOnly
                        className="w-full bg-gray-100 border border-gray-300 rounded px-3 py-2"
                    />
                </div>
            </div>

            <div className="mt-6 flex gap-4">
                <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                >
                    {deleting ? 'Deleting...' : 'Delete'}
                </button>
                <button
                    onClick={() => router.push('/posts')}
                    className="px-4 py-2 border border-gray-400 rounded hover:bg-gray-100"
                >
                    Cancel
                </button>
            </div>
        </div>
    );
}

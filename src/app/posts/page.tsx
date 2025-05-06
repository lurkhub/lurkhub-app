'use client';

import LoadingMessage from '@/components/common/LoadingMessage';
import { getPagedPosts, getPostDate, POSTS_PER_PAGE } from '@/services/postService';
import { fetchUser } from '@/services/userService';
import { Post } from '@/types/post';
import { User } from '@/types/user';
import { formatSmartDate } from '@/utils/dateUtils';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { Edit, Trash2 } from 'react-feather';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

function PostsContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pageParam = searchParams.get('page');
    const pageNumber = pageParam ? parseInt(pageParam, 10) || 1 : 1;

    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        async function load() {
            try {
                window.scrollTo(0, 0);
                setLoading(true);

                fetchUser()
                    .then(setUser)
                    .catch((err: unknown) => {
                        console.error("Error fetching user:", err);
                        setError(new Error("Failed to load user"));
                    });

                const data = await getPagedPosts(pageNumber, null);
                setPosts(data);
            } catch (err) {
                setError(err as Error);
            } finally {
                setLoading(false);
            }
        }

        load();
    }, [pageNumber]);

    const handlePageChange = (page: number) => {
        router.push(`/posts?page=${page}`);
    };

    if (loading) {
        return <LoadingMessage text={`Loading posts (Page ${pageNumber})...`} />;
    }

    if (error) {
        return (
            <div className="p-4 text-red-600 bg-red-100 rounded-lg">
                <p className="font-medium">Failed to load posts</p>
                <p className="text-sm">{error.message}</p>
            </div>
        );
    }

    return (
        <>
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-xl font-semibold">Posts (Page {pageNumber})</h1>
                    <p className="text-sm text-gray-500">
                        Posts are publically available at{' '}
                        <a href={"/@" + user?.login} target="_blank" className="text-blue-500 hover:underline">
                            lurkhub.com/@{user?.login}
                        </a>
                    </p>
                </div>
                <a
                    href="/posts/create"
                    className="bg-blue-600 text-white text-sm px-4 py-2 rounded hover:bg-blue-700 transition"
                >
                    New Post
                </a>
            </div>

            {posts.length === 0 ? (
                <div className="p-4 text-gray-600 italic">
                    No posts found on this page.
                </div>
            ) : (
                <div className="space-y-4">
                    {posts.map((post) => {
                        const postDate = getPostDate(post);
                        const postDateIso = postDate.toISOString();
                        const showMore = post.more === 'true';

                        return (
                            <div
                                key={post.id}
                                className="bg-white border border-gray-200 rounded-2xl shadow p-4 hover:shadow-md transition"
                            >
                                <div className="prose prose-sm max-w-none">
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                        {showMore ? `${post.preview.trim()}…` : post.preview}
                                    </ReactMarkdown>
                                </div>

                                <div className="flex flex-wrap items-center text-sm text-gray-500 gap-2 pt-2">
                                    {postDate ? (
                                        <span title={postDateIso}>
                                            {formatSmartDate(postDateIso)}
                                        </span>
                                    ) : (
                                        'Unknown'
                                    )}
                                    <span className="text-gray-500">|</span>
                                    <a
                                        href={`/posts/edit/${post.id}?page=${pageNumber}`}
                                        className="hover:underline"
                                        title="Edit article"
                                    >
                                        <Edit size={16} />
                                    </a>
                                    <span className="text-gray-500">|</span>
                                    <a
                                        href={`/posts/delete/${post.id}?page=${pageNumber}`}
                                        className="hover:underline"
                                        title="Delete article"
                                    >
                                        <Trash2 size={16} />
                                    </a>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {posts.length > 0 && (
                <div className="flex justify-between items-center pt-6">
                    {pageNumber > 1 ? (
                        <button
                            className="px-3 py-1 text-sm rounded bg-gray-200 hover:bg-gray-300"
                            onClick={() => handlePageChange(pageNumber - 1)}
                        >
                            Previous
                        </button>
                    ) : (
                        <span className="px-3 py-1" />
                    )}

                    <span className="text-sm font-medium">Page {pageNumber}</span>

                    {posts.length >= POSTS_PER_PAGE ? (
                        <button
                            className="px-3 py-1 text-sm rounded bg-gray-200 hover:bg-gray-300"
                            onClick={() => handlePageChange(pageNumber + 1)}
                        >
                            Next
                        </button>
                    ) : (
                        <span className="px-3 py-1" />
                    )}
                </div>
            )}
        </>
    );
}

export default function PostsPage() {
    return (
        <div className="max-w-xl mx-auto p-4 space-y-4">
            <Suspense fallback={<LoadingMessage text="Loading posts..." />}>
                <PostsContent />
            </Suspense>
        </div>
    );
}

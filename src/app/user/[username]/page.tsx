'use client';

import LoadingMessage from '@/components/common/LoadingMessage';
import {
    getPagedPosts,
    getPostDate,
    getPostPathFromId,
    getPublicPostConfig,
    POSTS_PER_PAGE
} from '@/services/postService';
import { Post } from '@/types/post';
import { formatSmartDate } from '@/utils/dateUtils';
import { format } from 'date-fns';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export const runtime = 'edge';

function ProfileContent() {
    const { username } = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const pageParam = searchParams.get('page');
    const pageNumber = pageParam ? parseInt(pageParam, 10) || 1 : 1;

    const [posts, setPosts] = useState<Post[]>([]);
    const [fullname, setFullname] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const getMonthYear = (dateStr: string) => format(new Date(dateStr), 'MMMM yyyy');

    useEffect(() => {
        async function fetchData() {
            try {
                window.scrollTo(0, 0);
                setLoading(true);

                if (typeof username !== 'string') {
                    throw new Error('Missing or invalid username param');
                }

                const postConfig = await getPublicPostConfig(username);
                if (postConfig) {
                    const postsData = await getPagedPosts(pageNumber, username);
                    setPosts(postsData);
                    setFullname(postConfig.fullname);
                } else {
                    setPosts([]);
                }
            } catch (err) {
                console.error('Failed to fetch data:', err);
                setError(err as Error);
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, [username, pageNumber]);

    const handlePageChange = (page: number) => {
        router.push(`/@${username}?page=${page}`);
    };

    if (loading) {
        return <LoadingMessage text={`Loading posts for @${username} (Page ${pageNumber})...`} />;
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
        <div className="max-w-xl mx-auto p-4">
            <div className="flex items-center space-x-4 mb-6">
                <img
                    src={`https://github.com/${username}.png`}
                    alt="User Avatar"
                    className="w-16 h-16 rounded-full"
                />
                <div>
                    <h1 className="text-2xl font-bold">{fullname || username}</h1>
                    <p className="text-gray-500">@{username}</p>
                </div>
            </div>

            <div className="space-y-10 relative">
                {posts.map((post, index) => {
                    const postDate = getPostDate(post);
                    const postDateIso = postDate.toISOString();
                    const showMore = post.more === 'true';
                    const currentMonth = postDate ? getMonthYear(postDateIso) : '';
                    const prevMonth = index > 0
                        ? getMonthYear(getPostDate(posts[index - 1]).toISOString() ?? '')
                        : null;
                    const isNewMonth = currentMonth !== prevMonth;

                    return (
                        <div key={post.id} className="space-y-6">
                            {isNewMonth && currentMonth && (
                                <div className="flex items-center my-8">
                                    <div className="flex-grow border-t border-gray-200" />
                                    <span className="px-4 text-sm text-gray-500 whitespace-nowrap">
                                        {currentMonth}
                                    </span>
                                    <div className="flex-grow border-t border-gray-200" />
                                </div>
                            )}

                            <div className="p-4 rounded-2xl shadow flex flex-col space-y-2 border border-blue-100 hover:border hover:border-blue-300 transition">
                                <div className="prose prose-sm max-w-none">
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                        {showMore ? `${post.preview.trim()}…` : post.preview}
                                    </ReactMarkdown>
                                </div>

                                {showMore && (
                                    <div className="pt-2">
                                        <a
                                            href={`/@${username}/${getPostPathFromId(post.id)}`}
                                            className="text-blue-600 text-sm font-medium hover:underline"
                                        >
                                            Continue reading →
                                        </a>
                                    </div>
                                )}

                                <div className="flex flex-wrap items-center text-sm text-gray-500 gap-2 pt-2">
                                    {postDate ? (
                                        <span title={postDate.toLocaleTimeString()}>
                                            {formatSmartDate(postDateIso)}
                                        </span>
                                    ) : (
                                        'Unknown'
                                    )}
                                    <span className="text-gray-500">|</span>
                                    <a
                                        href={`/@${username}/${getPostPathFromId(post.id)}`}
                                        className="hover:underline"
                                        title="View Post"
                                    >
                                        View Post
                                    </a>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {posts.length > 0 && (
                <div className="flex justify-between items-center pt-6">
                    <button
                        className="px-3 py-1 text-sm rounded disabled:opacity-50 bg-gray-200 hover:bg-gray-300"
                        onClick={() => handlePageChange(pageNumber - 1)}
                        disabled={pageNumber <= 1}
                    >
                        Previous
                    </button>

                    <span className="text-sm font-medium">Page {pageNumber}</span>

                    <button
                        className="px-3 py-1 text-sm rounded bg-gray-200 hover:bg-gray-300"
                        onClick={() => handlePageChange(pageNumber + 1)}
                        disabled={posts.length < POSTS_PER_PAGE}
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
}

export default function ProfilePage() {
    return (
        <Suspense fallback={<LoadingMessage text="Loading posts..." />}>
            <ProfileContent />
        </Suspense>
    );
}

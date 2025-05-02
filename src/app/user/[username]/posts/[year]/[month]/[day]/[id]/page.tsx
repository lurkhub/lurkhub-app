'use client';

import { getPublicPostConfig, getPublicPostContent } from '@/services/postService';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export const runtime = 'edge';

export default function ProfilePage() {
    const { username, id } = useParams();
    const [fullname, setFullname] = useState<string | null>(null);
    const [postContent, setPostContent] = useState<string | null>(null);

    if (typeof username !== 'string' || typeof id !== 'string') {
        throw new Error('Missing or invalid route params');
    }

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [postConfig, content] = await Promise.all([
                    getPublicPostConfig(username),
                    getPublicPostContent(username, id)
                ]);

                if (postConfig) {
                    setFullname(postConfig.fullname);
                }
                setPostContent(content);
            } catch (err) {
                console.error('Failed to fetch data:', err);
            }
        };

        fetchData();
    }, [username, id]);

    return (
        <div className="max-w-xl mx-auto p-4">
            <div className="flex items-center space-x-4 mb-6">
                <img
                    src={`https://github.com/${username}.png`}
                    alt="User Avatar"
                    className="w-16 h-16 rounded-full"
                />
                <div>
                    <h1 className="text-2xl font-bold">
                        <a href={`/@${username}`}>
                            {fullname || username}
                        </a>
                    </h1>
                    <p className="text-gray-500">
                        <a href={`/@${username}`}>
                            @{username}
                        </a>
                    </p>
                </div>
            </div>

            <div className="p-4 rounded-2xl shadow flex flex-col space-y-2 border border-blue-100 hover:border hover:border-blue-300 transition">
                <div className="prose prose-sm max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {postContent || 'Loading...'}
                    </ReactMarkdown>
                </div>
            </div>
        </div>
    );
}

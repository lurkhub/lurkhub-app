'use client';

import { fetchRawGithubFile } from '@/services/fileService';
import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export function About() {
    const [content, setContent] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchRawGithubFile('lurkhub', 'lurkhub-content', 'main', 'about.md')
            .then(setContent)
            .catch((err) => {
                console.error(err);
                setError('Failed to load content');
            });
    }, []);

    return (
        <div className="p-4 rounded-2xl shadow flex flex-col space-y-2 border border-gray-200 bg-white">
            <div className="prose prose-sm max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {error ? error : (content ?? 'Loading...')}
                </ReactMarkdown>
            </div>
        </div>
    );
}

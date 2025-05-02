'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { Bookmark, FileText, Rss, User } from 'react-feather';

export default function SearchPage() {
    const [query, setQuery] = useState('');
    const router = useRouter();
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, []);

    const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && query.trim() !== '') {
            const duckDuckGoUrl = `https://www.duckduckgo.com/?q=${encodeURIComponent(query)}`;
            router.push(duckDuckGoUrl);
        }
    };

    const features = [
        { icon: <Bookmark size={28} />, label: 'Bookmarks', path: '/bookmarks' },
        { icon: <FileText size={28} />, label: 'Articles', path: '/articles' },
        { icon: <Rss size={28} />, label: 'Feeds', path: '/feeds' },
        { icon: <User size={28} />, label: 'Profile', path: '/profile' },
    ];

    return (
        <div className="flex flex-col items-center justify-center p-4">
            <div className="grid grid-cols-4 gap-6 mb-6">
                {features.map((feature, index) => (
                    <Link
                        key={index}
                        href={feature.path}
                        className="flex flex-col items-center text-center group"
                    >
                        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center shadow group-hover:bg-gray-200 transition">
                            {feature.icon}
                        </div>
                        <span className="mt-2 text-sm text-gray-700 group-hover:text-black">
                            {feature.label}
                        </span>
                    </Link>
                ))}
            </div>
            <h1 className="text-2xl font-bold mb-4">DuckDuckGo Search</h1>
            <input
                ref={inputRef}
                type="text"
                placeholder="Search DuckDuckGo..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleSearch}
                className="w-full max-w-md p-3 border rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
        </div>
    );
}

'use client';

import { repos } from '@/constants/repos';
import { useRouter } from 'next/navigation';

export const runtime = 'edge';

export default function SetupPage() {
    const router = useRouter();

    const handleLogin = () => {
        router.push('/api/auth/login');
    };

    return (
        <main className="flex items-center justify-center p-6">
            <div className="max-w-xl w-full bg-white rounded-2xl shadow-lg p-8">
                <h1 className="text-2xl font-bold mb-4">Welcome to LurkHub</h1>
                <p className="mb-4 text-gray-700">
                    Please create the following repositories on your GitHub account before continuing:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6">
                    <li><strong>{repos.data}:</strong> a private repo for bookmarks, articles, and feeds</li>
                    <li><strong>{repos.posts}:</strong> a public repo for posting</li>
                </ul>
                <p className="mb-4 text-gray-700">
                    Once you have created these repositories, click the button below to log in.
                </p>
                <div className="flex justify-between">
                    <span></span>
                    <button
                        onClick={handleLogin}
                        className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
                    >
                        Login
                    </button>
                </div>
            </div>
        </main>
    );
}

'use client';

import { repos } from '@/constants/repos';
import { fetchUser } from '@/services/userService';
import { RepoAccessResult } from '@/types/repoAccessResult';
import { User } from '@/types/user';
import { clearSetupCookie } from '@/utils/misc';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export const runtime = 'edge';

export default function SetupPage() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [creating, setCreating] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const init = async () => {
            try {
                const user = await fetchUser();
                setUser(user);

                if (!user) {
                    setError("Failed to load user data");
                    return;
                }

                const checkRepo = async (repo: string) => {
                    const res = await fetch(`/api/repo/info?owner=${user.login}&repo=${repo}`);
                    const data = await res.json() as RepoAccessResult;
                    return data.exists && data.hasWriteAccess;
                };

                const hasDataRepo = await checkRepo(repos.data);
                const hasPostsRepo = await checkRepo(repos.posts);

                if (hasDataRepo && hasPostsRepo) {
                    clearSetupCookie(); // ✅ clear setup flag
                    router.replace('/');
                    return;
                }
            } catch (err) {
                console.error("Setup check error:", err);
                setError("Failed to load user or check repos");
            } finally {
                setLoading(false);
            }
        };

        init();
    }, [router]);

    const handleProceed = async () => {
        if (!user) return;

        setCreating(true);
        setError(null);

        const createRepo = async (name: string, isPrivate: boolean, description: string) => {
            const res = await fetch('/api/repo/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, description, private: isPrivate }),
            });

            return res.ok;
        };

        const createdDataRepo = await createRepo(repos.data, true, "Private repo for bookmarks, feeds and articles");
        const createdPostsRepo = await createRepo(repos.posts, false, "Public repo for posting");

        if (createdDataRepo && createdPostsRepo) {
            clearSetupCookie();
            router.push('/');
        } else {
            setError("Failed to create one or more repositories.");
            setCreating(false);
        }
    };

    return (
        <main className="flex items-center justify-center p-6">
            {loading && <p className="text-gray-500">Loading user...</p>}
            {error && <p className="text-red-600">{error}</p>}

            {!loading && !error && (
                <div className="max-w-xl w-full bg-white rounded-2xl shadow-lg p-8">
                    <h1 className="text-2xl font-bold mb-4">Welcome to LurkHub</h1>
                    <p className="mb-4 text-gray-700">
                        LurkHub will create two repositories on your GitHub account
                        {user?.login && <strong className="ml-1">@{user.login}</strong>}.
                        These repositories will be used to store all your data.
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6">
                        <li><strong>{repos.data}:</strong> a private repo for bookmarks, articles and feeds</li>
                        <li><strong>{repos.posts}:</strong> a public repo for posting</li>
                    </ul>
                    <div className="flex justify-between">
                        <Link
                            href="/api/auth/logout"
                            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 transition"
                        >
                            Logout
                        </Link>
                        <button
                            onClick={handleProceed}
                            disabled={creating}
                            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition disabled:opacity-50"
                        >
                            {creating ? "Creating..." : "Proceed"}
                        </button>
                    </div>
                </div>
            )}
        </main>
    );
}

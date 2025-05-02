'use client';

import { useState } from 'react';
import { GitHub } from 'react-feather';

export const Login = () => {
    const [showPatForm, setShowPatForm] = useState(false);
    const [token, setToken] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const res = await fetch('/api/auth/pat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token }),
            });

            if (!res.ok) {
                throw new Error('Invalid token or failed to authenticate');
            }

            window.location.href = '/';
        } catch (err) {
            console.error(err);
            setError('Failed to login with token. Please check your PAT.');
        }
    };

    return (
        <div>

            <a
                href="/api/auth/login"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-black text-white font-semibold rounded-lg hover:bg-gray-800 transition"
            >
                <GitHub size={20} />
                Login with GitHub
            </a>


            <div className="mt-6">
                <button
                    type="button"
                    onClick={() => setShowPatForm(!showPatForm)}
                    className="text-sm text-gray-500 hover:text-gray-700 underline"
                >
                    {showPatForm ? 'Hide token login' : 'Use a personal access token instead'}
                </button>
            </div>

            {
                showPatForm && (
                    <form onSubmit={handleSubmit} className="mt-4 text-left space-y-3">
                        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 text-sm rounded p-4">
                            <p className="font-semibold mb-1">Logging in to your GitHub acccount with a personal access token requires you to manually create the repos and create a token with access to them:</p>
                            <ol className="list-decimal list-inside space-y-1">
                                <li>Create a private repo called <code className="bg-yellow-100 px-1 rounded">lurkhub-data</code></li>
                                <li>Create a public repo called <code className="bg-yellow-100 px-1 rounded">lurkhub-posts</code></li>
                                <li>Create a Personal Access Token with access to both repos</li>
                                <li>Once ready enter your token below to login</li>
                            </ol>
                        </div>

                        <label className="block text-sm font-medium text-gray-700">
                            GitHub Personal Access Token
                        </label>
                        <input
                            type="password"
                            value={token}
                            onChange={e => setToken(e.target.value)}
                            className="w-full border border-gray-300 rounded px-3 py-2"
                            placeholder="ghp_..."
                            required
                        />
                        {error && <p className="text-sm text-red-600">{error}</p>}
                        <button
                            type="submit"
                            className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg text-sm font-medium"
                        >
                            Login with Token
                        </button>
                    </form>
                )
            }

        </div>
    );
};

'use client';

import { useParams } from 'next/navigation';

export const runtime = 'edge';

export default function ProfilePage() {
    const { username } = useParams();

    return (
        <div className="max-w-xl mx-auto p-4">
            <div className="flex items-center space-x-4 mb-6">
                <img
                    src={`https://github.com/${username}.png`}
                    alt="User Avatar"
                    className="w-16 h-16 rounded-full"
                />
                <div>
                    <h1 className="text-2xl font-bold">Contact Test</h1>
                </div>

                <p className="text-gray-500">@{username}</p>
            </div>

        </div>
    );
}

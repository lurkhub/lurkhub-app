'use client';

import { Login } from '@/components/common/Login';

export default function LoginPage() {
    return (
        <div className="max-w-md w-full mx-auto mt-16 p-8 border border-gray-200 rounded-2xl shadow-sm text-center">
            <h1 className="text-2xl font-bold mb-4">Welcome to LurkHub</h1>
            <p className="text-gray-700 mb-6">
                Please log in with your GitHub account to continue.
            </p>
            <Login />
        </div>
    );
}

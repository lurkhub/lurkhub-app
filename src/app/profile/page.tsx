"use client";

import { fetchUser } from "@/services/userService";
import { User } from "@/types/user";
import Link from "next/link";
import { useEffect, useState } from "react";
import { GitHub, Info, LogOut } from "react-feather";

export default function UserPage() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchUser()
            .then(setUser)
            .catch((err: unknown) => {
                console.error("Error fetching user:", err);
                setError("Failed to load user");
            })
            .finally(() => setLoading(false));
    }, []);

    return (
        <main className="flex items-center justify-center">
            <div className="bg-white p-6 rounded shadow-md w-full max-w-sm text-center">
                {loading && <p className="text-gray-500">Loading user...</p>}
                {error && <p className="text-red-600">{error}</p>}

                {user && (
                    <>
                        <img
                            alt="user avatar"
                            src={user.avatar_url}
                            width="64"
                            className="mx-auto rounded-full mb-4"
                        />
                        <h1 className="text-2xl font-bold mb-4">{user.login}</h1>

                        <div className="bg-blue-100 text-blue-800 p-4 rounded mb-6 text-sm text-left">
                            <p className="font-medium mb-1">Thank you for using LurkHub. Feel free to contact me at <a href="mailto:leslielurker@gmail.com" className="underline">leslielurker@gmail.com</a></p>
                        </div>

                        <div className="flex flex-col gap-3">
                            <Link
                                href="/about"
                                className="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                            >
                                <Info size={18} />
                                About
                            </Link>
                            <a
                                href="https://github.com/lurkhub/lurkhub-app"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center gap-2 bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-900 transition"
                            >
                                <GitHub size={18} />
                                Source Code
                            </a>
                            <a
                                href="/api/auth/logout"
                                className="flex items-center justify-center gap-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
                            >
                                <LogOut size={18} />
                                Log out
                            </a>
                        </div>
                    </>
                )}
            </div>
        </main>
    );
}

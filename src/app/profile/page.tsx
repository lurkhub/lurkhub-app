"use client";

import { fetchUser } from "@/services/userService";
import { User } from "@/types/user";
import { useEffect, useState } from "react";
import styles from "./page.module.css";

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
        <main>
            {loading && <p className="text-gray-500">Loading user...</p>}
            {error && <p className="text-red-600">{error}</p>}

            {user && (
                <>
                    <img alt="user avatar" src={user.avatar_url} width="64" />
                    <h1 className="text-2xl font-bold">
                        {user.login}
                    </h1>
                    <div className={styles.userDetails}>
                        <div><strong>Login:</strong> {user.login}</div>
                        <div><strong>Name:</strong> {user.name ?? "N/A"}</div>
                    </div>
                    <a
                        href="/api/auth/logout"
                        className="mt-4 inline-block bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
                    >
                        Log out
                    </a>
                </>
            )}
        </main>
    );
}

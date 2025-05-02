"use client";

import { fetchUser } from "@/services/userService";
import { User } from "@/types/user";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Anchor } from "react-feather";

export default function NavBar() {
    const [user, setUser] = useState<User | null>(null);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const pathname = usePathname();

    const devSuffix = process.env.NEXT_PUBLIC_DEV_SUFFIX;

    useEffect(() => {
        fetchUser()
            .then(setUser)
            .catch((error) => console.error("Error fetching user:", error));
    }, []);

    const getNavLinkClass = (path: string) =>
        `text-blue-800 hover:text-gray-800 ${pathname === path
            ? "underline underline-offset-4 decoration-2 decoration-blue-400"
            : ""
        }`;

    return (
        <>
            <nav className="bg-white shadow-md w-full fixed top-0 left-0 z-50">
                <div className="flex justify-between items-center px-6 py-2">
                    <div className="flex items-center space-x-6">
                        <Link
                            href="/"
                            className="flex items-center space-x-2 text-2xl font-bold text-blue-800"
                        >
                            <Anchor />
                            <span className="flex items-center">
                                LurkHub
                                {devSuffix && (
                                    <span className="ml-2 text-sm font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded">
                                        [DEV {devSuffix}]
                                    </span>
                                )}
                            </span>
                        </Link>

                        {/* Hide on small screens */}
                        <div className="hidden sm:flex items-center space-x-6">
                            <Link href="/bookmarks" className={getNavLinkClass("/bookmarks")}>
                                Bookmarks
                            </Link>
                            <Link href="/articles" className={getNavLinkClass("/articles")}>
                                Articles
                            </Link>
                            <Link href="/feeds" className={getNavLinkClass("/feeds")}>
                                Feeds
                            </Link>
                            <Link href="/posts" className={getNavLinkClass("/posts")}>
                                Posts
                            </Link>
                        </div>
                    </div>

                    {user ? (
                        <>
                            {/* Desktop avatar */}
                            <Link
                                href="/profile"
                                className="hidden sm:block text-gray-600 hover:text-gray-800"
                            >
                                <img
                                    src={user.avatar_url}
                                    alt={user.login}
                                    className="w-12 h-12 rounded-full border-2 border-blue-600"
                                />
                            </Link>

                            {/* Mobile avatar */}
                            <button
                                className="block sm:hidden"
                                onClick={() => setMobileMenuOpen((prev) => !prev)}
                            >
                                <img
                                    src={user.avatar_url}
                                    alt={user.login}
                                    className="w-12 h-12 rounded-full border-2 border-blue-600"
                                />
                            </button>
                        </>
                    ) : (
                        <Link
                            href="/login"
                            className="text-gray-600 hover:text-gray-800"
                        >
                            Login
                        </Link>
                    )}
                </div>

                {mobileMenuOpen && (
                    <div className="sm:hidden absolute top-full left-0 w-full bg-white border-t border-gray-200 shadow-md z-50">
                        <div className="flex flex-col px-6 py-4 space-y-2">
                            <Link
                                href="/bookmarks"
                                className={getNavLinkClass("/bookmarks") + " py-2 px-3 rounded hover:bg-blue-50"}
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Bookmarks
                            </Link>
                            <Link
                                href="/articles"
                                className={getNavLinkClass("/articles") + " py-2 px-3 rounded hover:bg-blue-50"}
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Articles
                            </Link>
                            <Link
                                href="/feeds"
                                className={getNavLinkClass("/feeds") + " py-2 px-3 rounded hover:bg-blue-50"}
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Feeds
                            </Link>
                            <Link
                                href="/posts"
                                className={getNavLinkClass("/posts") + " py-2 px-3 rounded hover:bg-blue-50"}
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Posts
                            </Link>
                            <Link
                                href="/profile"
                                className={getNavLinkClass("/profile") + " py-2 px-3 rounded hover:bg-blue-50"}
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Profile
                            </Link>
                        </div>
                    </div>
                )}
            </nav>
            <div className="pt-16"></div>
        </>
    );
}

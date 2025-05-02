'use client';

import { Bookmark } from "@/types/bookmark";
import { formatSmartDate } from "@/utils/dateUtils";
import { getFaviconUrl } from "@/utils/misc";
import { Archive, Edit, RotateCcw, Trash2 } from "react-feather";

export default function BookmarkCard({
    bookmark,
    isArchived = false,
}: {
    bookmark: Bookmark;
    isArchived?: boolean;
}) {
    const url = new URL(bookmark.url);
    const faviconUrl = getFaviconUrl(url);
    const domain = url.hostname.replace(/^www\./, "");
    const created = new Date(bookmark.created);
    const createdYmd = created.toISOString().slice(0, 10).replace(/-/g, '');

    const tagList = bookmark.tags?.split(",").map(tag => tag.trim()).filter(Boolean) || [];

    return (
        <div
            className={
                isArchived
                    ? "bg-gray-50 p-4 rounded-2xl shadow flex flex-col space-y-2 border border-gray-100 hover:bg-gray-100 hover:border hover:border-gray-300 transition"
                    : "bg-blue-50 p-4 rounded-2xl shadow flex flex-col space-y-2 border border-blue-100 hover:bg-blue-100 hover:border hover:border-blue-300 transition"
            }
        >
            <div className="flex items-start space-x-2">
                <img
                    src={faviconUrl}
                    alt=""
                    width="16"
                    height="16"
                    className="shrink-0 mt-[7px]"
                    loading="lazy"
                    onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = '/globe.svg';
                    }}
                />
                <a
                    href={bookmark.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={
                        (isArchived
                            ? "text-lg font-medium text-gray-700"
                            : "text-lg font-medium text-blue-700") +
                        " hover:underline break-words whitespace-pre-wrap w-full"
                    }
                >
                    {bookmark.title}
                </a>
            </div>

            <div className="flex flex-wrap items-center text-sm text-gray-500 gap-2">
                <a
                    href={`https://${domain}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="hover:underline"
                >
                    {domain}
                </a>

                <span className="text-gray-500">|</span>
                <a
                    href={`https://archive.is/${createdYmd}/${bookmark.url}`}
                    className="hover:underline"
                >
                    {bookmark.created ? formatSmartDate(bookmark.created) : "Unknown"}
                </a>

                <span className="text-gray-500">|</span>

                {isArchived ? (
                    <>
                        <a
                            href={`/bookmarks/archives/restore/${bookmark.id}`}
                            className="hover:underline"
                            title="Restore bookmark"
                        >
                            <RotateCcw size={16} />
                        </a>
                        <span className="text-gray-500">|</span>
                        <a
                            href={`/bookmarks/archives/delete/${bookmark.id}`}
                            className="hover:underline"
                            title="Delete permanently"
                        >
                            <Trash2 size={16} />
                        </a>
                    </>
                ) : (
                    <>
                        <a
                            href={`/bookmarks/edit/${bookmark.id}`}
                            className="hover:underline"
                            title="Edit bookmark"
                        >
                            <Edit size={16} />
                        </a>
                        <span className="text-gray-500">|</span>
                        <a
                            href={`/bookmarks/archive/${bookmark.id}`}
                            className="hover:underline"
                            title="Archive bookmark"
                        >
                            <Archive size={16} />
                        </a>
                        <span className="text-gray-500">|</span>
                        <a
                            href={`/bookmarks/delete/${bookmark.id}`}
                            className="hover:underline"
                            title="Delete bookmark"
                        >
                            <Trash2 size={16} />
                        </a>
                    </>
                )}

                {tagList.length > 0 && <span className="text-gray-500">|</span>}

                {tagList.length > 0 && (
                    <span>{tagList.map(tag => `${tag}`).join(', ')}</span>
                )}
            </div>
        </div>
    );
}

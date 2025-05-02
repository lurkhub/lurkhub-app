import { apiPaths } from '@/constants/apiPaths';
import { filePaths } from '@/constants/filePaths';
import { repos } from '@/constants/repos';
import { fetchDataset } from '@/services/datasetService';
import { Bookmark } from '@/types/bookmark';
import { createId } from '@/utils/createId';
import { normalizeUrl } from '@/utils/misc';

async function getAll(path: string): Promise<Bookmark[]> {
    const dataset = await fetchDataset(repos.data, path);
    return dataset.values.map(([id, title, url, tags, created]) => ({
        id, title, url, tags, created
    }));
}

async function getById(path: string, id: string): Promise<Bookmark | null> {
    const bookmarks = await getAll(path);
    return bookmarks.find(b => b.id === id) ?? null;
}

async function createOrUpdate(path: string, bookmark: Bookmark): Promise<Response> {
    const bookmarks = await getAll(path);
    const normalized = normalizeUrl(bookmark.url);
    const now = new Date().toISOString();
    const existing = bookmarks.find(b => normalizeUrl(b.url) === normalized);

    bookmark.id = existing?.id || bookmark.id || createId();
    bookmark.url = normalized;
    bookmark.created = now;

    return existing
        ? await update(path, bookmark)
        : await create(path, bookmark);
}

async function create(path: string, bookmark: Bookmark): Promise<Response> {
    return fetch(`${apiPaths.dataset}?repo=${repos.data}&path=${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookmark),
    });
}

async function update(path: string, bookmark: Bookmark): Promise<Response> {
    return fetch(`${apiPaths.dataset}?repo=${repos.data}&path=${path}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(Object.values(bookmark)),
    });
}

async function deleteById(path: string, id: string): Promise<Response> {
    return fetch(`${apiPaths.dataset}?repo=${repos.data}&path=${path}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
    });
}

// Paths
const bookmarkPath = filePaths.bookmarks;
const archivePath = filePaths.bookmarksArchive(1);

// Bookmark Functions

export const getBookmarks = () => getAll(bookmarkPath);
export const getBookmarkById = (id: string) => getById(bookmarkPath, id);
export const createOrUpdateBookmark = (b: Bookmark) => createOrUpdate(bookmarkPath, b);
export const createBookmark = (b: Bookmark) => create(bookmarkPath, b);
export const updateBookmark = (b: Bookmark) => update(bookmarkPath, b);
export const deleteBookmark = (id: string) => deleteById(bookmarkPath, id);

// Archived Bookmark Functions
export const getArchivedBookmarks = () => getAll(archivePath);
export const getArchivedBookmarkById = (id: string) => getById(archivePath, id);
export const createOrUpdateArchivedBookmark = (b: Bookmark) => createOrUpdate(archivePath, b);
export const createArchivedBookmark = (b: Bookmark) => create(archivePath, b);
export const updateArchivedBookmark = (b: Bookmark) => update(archivePath, b);
export const deleteArchivedBookmark = (id: string) => deleteById(archivePath, id);

export async function archiveBookmark(bookmark: Bookmark): Promise<Response> {
    const resCreate = await createArchivedBookmark(bookmark);
    if (!resCreate.ok) return resCreate;

    return deleteBookmark(bookmark.id);
}

export async function restoreBookmark(bookmark: Bookmark): Promise<Response> {
    const resCreate = await createOrUpdateBookmark(bookmark);
    if (!resCreate.ok) return resCreate;

    return deleteArchivedBookmark(bookmark.id);
}

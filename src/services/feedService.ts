import { apiPaths } from "@/constants/apiPaths";
import { cacheNames } from "@/constants/cacheNames";
import { filePaths } from "@/constants/filePaths";
import { repos } from "@/constants/repos";
import { Feed } from "@/types/feeds/feed";
import { FeedInfo } from "@/types/feeds/feedInfo";
import { FeedItem } from "@/types/feeds/feedItem";
import { createId } from "@/utils/createId";
import { normalizeUrl } from "@/utils/misc";
import { fetchDataset } from "./datasetService";

async function getAll(path: string): Promise<Feed[]> {
    const dataset = await fetchDataset(repos.data, path);
    return dataset.values.map(([id, title, url, tags, created]) => ({
        id, title, url, tags, created
    }));
}

async function getById(path: string, id: string): Promise<Feed | null> {
    const items = await getAll(path);
    return items.find(i => i.id === id) ?? null;
}

async function createOrUpdate(path: string, feed: Feed): Promise<Response> {
    const items = await getAll(path);
    const normalized = normalizeUrl(feed.url);
    const now = new Date().toISOString();
    const existing = items.find(i => normalizeUrl(i.url) === normalized);

    feed.id = existing?.id || feed.id || createId();
    feed.url = normalized;
    feed.created = now;

    return existing
        ? await update(path, feed)
        : await create(path, feed);
}

async function create(path: string, feed: Feed): Promise<Response> {
    return fetch(`${apiPaths.dataset}?repo=${repos.data}&path=${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(feed),
    });
}

async function update(path: string, feed: Feed): Promise<Response> {
    return fetch(`${apiPaths.dataset}?repo=${repos.data}&path=${path}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(Object.values(feed)),
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
const feedPath = filePaths.feeds;
const archivePath = filePaths.feedsArchive(1);

// Regular Feed Functions

export const getFeeds = () => getAll(feedPath);
export const getFeedById = (id: string) => getById(feedPath, id);
export const createOrUpdateFeed = (f: Feed) => createOrUpdate(feedPath, f);
export const createFeed = (f: Feed) => create(feedPath, f);
export const updateFeed = (f: Feed) => update(feedPath, f);
export const deleteFeed = (id: string) => deleteById(feedPath, id);

// Archived Feed Functions
export const getArchivedFeeds = () => getAll(archivePath);
export const getArchivedFeedById = (id: string) => getById(archivePath, id);
export const createOrUpdateArchivedFeed = (f: Feed) => createOrUpdate(archivePath, f);
export const createArchivedFeed = (f: Feed) => create(archivePath, f);
export const updateArchivedFeed = (f: Feed) => update(archivePath, f);
export const deleteArchivedFeed = (id: string) => deleteById(archivePath, id);

export async function archiveFeed(feed: Feed): Promise<Response> {
    const resCreate = await createArchivedFeed(feed);
    if (!resCreate.ok) return resCreate;

    return deleteFeed(feed.id);
}

export async function restoreFeed(feed: Feed): Promise<Response> {
    const resCreate = await createOrUpdateFeed(feed);
    if (!resCreate.ok) return resCreate;

    return deleteArchivedFeed(feed.id);
}





// --- Feed Details Functions ---

export async function fetchFeed(id: string | string[] | undefined) {
    const dataset = await fetchDataset(repos.data, filePaths.feeds);

    const idIndex = dataset.fields.indexOf('id');
    if (idIndex === -1) throw new Error('ID field not found in dataset');

    const matchedRow = dataset.values.find(row => row[idIndex] === id);

    if (!matchedRow) {
        throw new Error(`Feed with id "${id}" not found.`);
    } else {
        const feedObject: Feed = dataset.fields.reduce((acc, field, index) => {
            acc[field as keyof Feed] = matchedRow[index];
            return acc;
        }, {} as Feed);

        return feedObject;
    }
}

export async function fetchFeedItems(feedUrl: string): Promise<FeedItem[]> {
    const cache = await caches.open(cacheNames.feed);
    const apiUrl = `/api/feed/items?url=${encodeURIComponent(feedUrl)}`;

    const cachedResponse = await cache.match(apiUrl);
    let etag = '', lastModified = '';

    if (cachedResponse) {
        etag = cachedResponse.headers.get('etag') ?? '';
        lastModified = cachedResponse.headers.get('last-modified') ?? '';
    }

    const res = await fetch(apiUrl, {
        headers: {
            'If-None-Match': etag,
            'If-Modified-Since': lastModified
        }
    });

    if (res.status === 200) {
        await cache.put(apiUrl, res.clone());
        return res.json() as Promise<FeedItem[]>;
    }

    if (res.status === 304 && cachedResponse) {
        return cachedResponse.json() as Promise<FeedItem[]>;
    }

    throw new Error(`Fetch failed with status ${res.status}`);
}


export async function fetchFeedInfo(feedUrl: string): Promise<FeedInfo | null> {
    const cache = await caches.open(cacheNames.feed);
    const apiUrl = `/api/feed/info?url=${encodeURIComponent(feedUrl)}`;

    const cachedResponse = await cache.match(apiUrl);
    let etag = '';
    let lastModified = '';

    if (cachedResponse) {
        etag = cachedResponse.headers.get('etag') ?? '';
        lastModified = cachedResponse.headers.get('last-modified') ?? '';
    }

    const res = await fetch(apiUrl, {
        headers: {
            ...(etag ? { 'If-None-Match': etag } : {}),
            ...(lastModified ? { 'If-Modified-Since': lastModified } : {}),
        },
    });

    if (res.status === 200) {
        await cache.put(apiUrl, res.clone());
        return res.json();
    }

    if (res.status === 304 && cachedResponse) {
        return cachedResponse.json();
    }

    return null;
}
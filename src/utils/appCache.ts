// Stores arbitrary data in the browser's cache storage

const CACHE_NAME = 'app-cache';
const CACHE_PREFIX = '/cache/';

export async function putToCache(key: string, data: unknown): Promise<void> {
    const cacheKey = new Request(CACHE_PREFIX + key);
    const response = new Response(JSON.stringify(data), {
        headers: { 'Content-Type': 'application/json' }
    });

    const cache = await caches.open(CACHE_NAME);
    await cache.put(cacheKey, response);
}

export async function getFromCache<T = unknown>(key: string): Promise<T | null> {
    const cacheKey = new Request(CACHE_PREFIX + key);
    const cache = await caches.open(CACHE_NAME);
    const response = await cache.match(cacheKey);

    if (!response) return null;

    try {
        return await response.json() as T;
    } catch {
        return null;
    }
}

export async function clearCacheEntry(key: string): Promise<boolean> {
    const cacheKey = new Request(CACHE_PREFIX + key);
    const cache = await caches.open(CACHE_NAME);
    return cache.delete(cacheKey);
}

export async function clearAllCache(): Promise<void> {
    await caches.delete(CACHE_NAME);
}

export async function listCacheKeys(): Promise<string[]> {
    const cache = await caches.open(CACHE_NAME);
    const requests = await cache.keys();
    return requests.map(req => req.url);
}

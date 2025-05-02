import { apiPaths } from "@/constants/apiPaths";
import { cacheNames } from "@/constants/cacheNames";
import { Dataset } from "@/types/dataset";

export async function fetchDataset(repo: string, path: string): Promise<Dataset> {
    const cache = await caches.open(cacheNames.github);

    const baseUrl = apiPaths.dataset;
    const queryParam = `repo=${repo}&path=${path}`;
    const url = `${baseUrl}?${queryParam}`;

    const cachedResponse = await cache.match(url);
    const etag = cachedResponse?.headers.get("etag") ?? "";

    const res = await fetch(url, {
        headers: {
            ...(etag ? { "If-None-Match": etag } : {}),
        },
    });

    if (res.status === 200) {
        await cache.put(url, res.clone());
        return res.json() as Promise<Dataset>;
    }

    if (res.status === 304 && cachedResponse) {
        return cachedResponse.json() as Promise<Dataset>;
    }

    throw new Error(`Failed to fetch dataset ${path} (status ${res.status})`);
}

export async function fetchPublicDataset(url: string): Promise<Dataset> {
    const cache = await caches.open(cacheNames.github);

    const cachedResponse = await cache.match(url);
    const etag = cachedResponse?.headers.get("etag") ?? "";

    const res = await fetch(url, {
        headers: {
            ...(etag ? { "If-None-Match": etag } : {}),
        },
    });

    if (res.status === 200) {
        await cache.put(url, res.clone());
        return res.json() as Promise<Dataset>;
    }

    if (res.status === 304 && cachedResponse) {
        return cachedResponse.json() as Promise<Dataset>;
    }

    throw new Error(`Failed to fetch public dataset from ${url} (status ${res.status})`);
}

export async function fetchPublicDatasetFromApi(username: string, repo: string, path: string): Promise<Dataset> {

    const url = `https://api.github.com/repos/${username}/${repo}/contents/${path}`;

    const cache = await caches.open(cacheNames.github);

    const cachedResponse = await cache.match(url);
    const etag = cachedResponse?.headers.get('etag') ?? '';

    const res = await fetch(url, {
        headers: {
            Accept: 'application/vnd.github.v3.raw',
            ...(etag ? { 'If-None-Match': etag } : {}),
        },
    });

    if (res.status === 200) {
        await cache.put(url, res.clone());
        return res.json() as Promise<Dataset>;
    }

    if (res.status === 304 && cachedResponse) {
        return cachedResponse.json() as Promise<Dataset>;
    }

    if (res.status === 404) {
        return { fields: [], values: [] }; // ✅ Empty but valid Dataset
    }

    throw new Error(`Failed to fetch dataset from GitHub API (status ${res.status})`);
}

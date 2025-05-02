import { apiPaths } from "@/constants/apiPaths";
import { cacheNames } from "@/constants/cacheNames";

export async function fetchUserFile(repo: string, path: string): Promise<string | null> {
    const cache = await caches.open(cacheNames.github);

    const baseUrl = apiPaths.file;
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
        return res.text();
    }

    if (res.status === 304 && cachedResponse) {
        return cachedResponse.text();
    }

    if (res.status === 404) {
        return null;
    }

    if (!res.ok) {
        throw new Error(`Failed to fetch file: ${res.status}`);
    }

    throw new Error(`Failed to fetch ${path} (status ${res.status})`);
}

export async function fetchUserJson<T>(repo: string, path: string): Promise<T | null> {
    const content = await fetchUserFile(repo, path);

    if (!content) {
        return null;
    }

    return JSON.parse(content) as T;
}

export async function fetchPublicApiFile(username: string, repo: string, path: string): Promise<string | null> {
    const url = `https://api.github.com/repos/${username}/${repo}/contents/${path}`;

    const cache = await caches.open(cacheNames.github);

    const cachedResponse = await cache.match(url);
    const etag = cachedResponse?.headers.get("etag") ?? "";

    const res = await fetch(url, {
        headers: {
            Accept: "application/vnd.github.v3.raw",
            ...(etag ? { "If-None-Match": etag } : {}),
        },
    });

    if (res.status === 200) {
        const text = await res.text();
        await cache.put(url, new Response(text, res));
        return text;
    }

    if (res.status === 304 && cachedResponse) {
        return cachedResponse.text();
    }

    if (res.status === 404) {
        return null;
    }

    throw new Error(`Failed to fetch file from GitHub API (status ${res.status})`);
}

export async function fetchRawGithubFile(username: string, repo: string, branch: string, path: string): Promise<string | null> {
    const url = `https://raw.githubusercontent.com/${username}/${repo}/refs/heads/${branch}/${path}`;

    const cache = await caches.open('github-raw');

    const cachedResponse = await cache.match(url);
    const etag = cachedResponse?.headers.get('etag') ?? '';

    const res = await fetch(url, {
        headers: {
            ...(etag ? { 'If-None-Match': etag } : {}),
        },
    });

    if (res.status === 200) {
        const text = await res.text();
        await cache.put(url, new Response(text, res));
        return text;
    }

    if (res.status === 304 && cachedResponse) {
        return cachedResponse.text();
    }

    if (res.status === 404) {
        return null;
    }

    throw new Error(`Failed to fetch file from GitHub raw (status ${res.status})`);
}



export async function fetchPublicJson<T>(username: string, repo: string, path: string): Promise<T | null> {
    const content = await fetchPublicApiFile(username, repo, path);

    if (!content) {
        return null;
    }

    return JSON.parse(content) as T;
}

// export async function fetchPublicJsonFromApi<T>(username: string, repo: string, path: string): Promise<T> {
//     const url = `https://api.github.com/repos/${username}/${repo}/contents/${path}`;

//     const cache = await caches.open(cacheNames.github);

//     const cachedResponse = await cache.match(url);
//     const etag = cachedResponse?.headers.get('etag') ?? '';

//     const res = await fetch(url, {
//         headers: {
//             Accept: 'application/vnd.github.v3.raw',
//             ...(etag ? { 'If-None-Match': etag } : {}),
//         },
//     });

//     if (res.status === 200) {
//         await cache.put(url, res.clone());
//         return res.json() as Promise<T>;
//     }

//     if (res.status === 304 && cachedResponse) {
//         return cachedResponse.json() as Promise<T>;
//     }

//     if (res.status === 404) {
//         // or
//         // Return empty object cast as T
//         //return {} as T;
//         throw new Error(`File not found in GitHub repo at path: ${path}`);
//     }

//     throw new Error(`Failed to fetch data from GitHub API (status ${res.status})`);
// }


export async function createFileInRepo(repo: string, path: string, content: string) {
    const baseUrl = apiPaths.file;
    const queryParam = `repo=${repo}&path=${path}`;
    const url = `${baseUrl}?${queryParam}`;

    // TODO: Better alternative for URL construction?
    // const url = new URL("/api/github/file", window.location.origin);
    // url.searchParams.set("repo", repo);
    // url.searchParams.set("path", path);

    const res = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "text/plain",
        },
        body: content
    });

    if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw `Failed to create file: ${res.status} ${error}`;
    }

    return res;
}

export async function updateFileInRepo(repo: string, path: string, content: string) {
    const baseUrl = apiPaths.file;
    const queryParam = `repo=${repo}&path=${path}`;
    const url = `${baseUrl}?${queryParam}`;

    const res = await fetch(url, {
        method: "PUT",
        headers: {
            "Content-Type": "text/plain",
        },
        body: content,
    });

    if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw `Failed to update file: ${res.status} ${error}`;
    }

    return res;
}

export async function deleteFileInRepo(repo: string, path: string) {
    const baseUrl = apiPaths.file;
    const queryParam = `repo=${repo}&path=${path}`;
    const url = `${baseUrl}?${queryParam}`;

    const res = await fetch(url, {
        method: "DELETE",
    });

    if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw `Failed to delete file: ${res.status} ${error}`;
    }

    return res;
}



// TODO: test fetch from api with fallback to raw
export async function fetchGithubFile(username: string, repo: string, branch: string, path: string,
): Promise<string | null> {
    try {
        const apiResult = await fetchPublicApiFile(username, repo, path);

        if (apiResult !== null) return apiResult;

        return fetchRawGithubFile(username, repo, branch, path);
    } catch {
        return fetchRawGithubFile(username, repo, branch, path);
    }

    throw new Error(`Failed to fetch file from GitHub`);
}


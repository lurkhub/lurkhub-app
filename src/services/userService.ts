import { apiPaths } from "@/constants/apiPaths";
import { cacheNames } from "@/constants/cacheNames";
import { User } from "@/types/user";

export async function fetchUser(): Promise<User | null> {
    const cache = await caches.open(cacheNames.github);
    const cachedRes = await cache.match(apiPaths.user);
    const etag = cachedRes?.headers.get("etag") ?? "";

    const res = await fetch(apiPaths.user, {
        headers: {
            ...(etag ? { "If-None-Match": etag } : {}),
        },
        credentials: "include",
    });

    if (res.status === 200) {
        await cache.put(apiPaths.user, res.clone());
        return res.json();
    }

    if (res.status === 304 && cachedRes) {
        return cachedRes.json();
    }

    return null;
}

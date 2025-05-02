export function generateCacheControlHeader(
    expireMinutes: number,
    staggerMinutes: number
): string {
    const expireSeconds = expireMinutes * 60;
    const staggerSeconds = Math.floor(Math.random() * (staggerMinutes * 60 + 1));
    const totalMaxAge = expireSeconds + staggerSeconds;

    return `public, max-age=${totalMaxAge}, stale-while-revalidate=300`;
}

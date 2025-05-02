export function normalizeUrl(input: string): string {
    try {
        // If the URL already has a scheme, return as-is
        const url = new URL(input);
        return url.toString();
    } catch {
        // If it fails, try adding https:// as default scheme
        try {
            const withScheme = new URL(`https://${input}`);
            return withScheme.toString();
        } catch {
            // Still invalid
            return '';
        }
    }
}

export function getFaviconUrl(url: URL): string {
    return `https://icons.duckduckgo.com/ip3/${url.hostname}.ico`;
}

export function getUnixTime() {
    return Math.floor(Date.now() / 1000);
}

export function clearSetupCookie(): void {
    document.cookie = "setup=; Max-Age=0; Path=/";
}

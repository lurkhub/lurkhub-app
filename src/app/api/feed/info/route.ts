import { AtomFeed } from '@/types/feeds/atomFeed';
import { FeedInfo } from '@/types/feeds/feedInfo';
import { RssFeed } from '@/types/feeds/rssFeed';
import { generateCacheControlHeader } from '@/utils/cacheUtils';
import { parseAtomInfo, parseRssInfo } from '@/utils/feedUtils';
import { XMLParser } from 'fast-xml-parser';
import type { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const feedUrl = searchParams.get('url');

    if (!feedUrl) {
        return new Response(JSON.stringify({ error: 'Missing `url` query parameter' }), {
            status: 400,
        });
    }

    try {
        // Extract ETag and Last-Modified from the incoming request
        const ifNoneMatch = request.headers.get('if-none-match');
        const ifModifiedSince = request.headers.get('if-modified-since');

        // Forward those headers to the upstream feed
        const res = await fetch(feedUrl, {
            headers: {
                ...(ifNoneMatch ? { 'If-None-Match': ifNoneMatch } : {}),
                ...(ifModifiedSince ? { 'If-Modified-Since': ifModifiedSince } : {}),
            },
        });

        // If upstream says it's not modified, return 304 directly
        if (res.status === 304) {
            return new Response(null, {
                status: 304,
                headers: {
                    ...(res.headers.get('etag') ? { 'ETag': res.headers.get('etag')! } : {}),
                    ...(res.headers.get('last-modified') ? { 'Last-Modified': res.headers.get('last-modified')! } : {}),
                },
            });
        }

        if (!res.ok) {
            throw new Error(`Unable to fetch feed: ${res.statusText}`);
        }

        const xml = await res.text();

        const parser = new XMLParser({
            ignoreAttributes: false,
            attributeNamePrefix: '',
        });

        const data = parser.parse(xml);

        let info: FeedInfo;

        if ('rss' in data && 'channel' in data.rss) {
            info = parseRssInfo(data as RssFeed);
        } else if ('feed' in data && 'entry' in data.feed) {
            info = parseAtomInfo(data as AtomFeed);
        } else {
            return new Response(JSON.stringify({ error: 'Unknown feed format' }), {
                status: 400,
            });
        }

        const cacheControl = generateCacheControlHeader(5, 10);

        return new Response(JSON.stringify(info), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': cacheControl,
                ...(res.headers.get('etag') ? { 'ETag': res.headers.get('etag')! } : {}),
                ...(res.headers.get('last-modified') ? { 'Last-Modified': res.headers.get('last-modified')! } : {}),
            },
        });
    } catch (err: unknown) {
        return new Response(JSON.stringify({ error: (err as Error).message }), {
            status: 500,
        });
    }
}

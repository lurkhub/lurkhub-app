import { AtomFeed } from "@/types/feeds/atomFeed";
import { FeedItem } from "@/types/feeds/feedItem";
import { RssFeed } from "@/types/feeds/rssFeed";
import { parseAtomFeed, parseRssFeed } from "@/utils/feedUtils";
import { XMLParser } from "fast-xml-parser";
import { NextRequest } from "next/server";

export const runtime = 'edge';


// new version with etag conditional fetch caching stuff

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const feedUrl = searchParams.get('url');

    if (!feedUrl) {
        return new Response(JSON.stringify({ error: 'Missing `url` query parameter' }), {
            status: 400,
        });
    }

    try {
        // Extract conditional headers
        const ifNoneMatch = request.headers.get('if-none-match');
        const ifModifiedSince = request.headers.get('if-modified-since');

        // Forward headers to the upstream feed
        const res = await fetch(feedUrl, {
            headers: {
                ...(ifNoneMatch ? { 'If-None-Match': ifNoneMatch } : {}),
                ...(ifModifiedSince ? { 'If-Modified-Since': ifModifiedSince } : {}),
            },
        });

        // If upstream says content is unchanged
        if (res.status === 304) {
            return new Response(null, {
                status: 304,
                headers: {
                    'ETag': res.headers.get('etag') || '',
                    'Last-Modified': res.headers.get('last-modified') || '',
                },
            });
        }

        const xml = await res.text();

        const parser = new XMLParser({
            ignoreAttributes: false,
            attributeNamePrefix: '',
        });

        const data = parser.parse(xml);

        let items: FeedItem[] = [];

        if ('rss' in data && 'channel' in data.rss) {
            items = parseRssFeed(data as RssFeed);
        } else if ('feed' in data && 'entry' in data.feed) {
            items = parseAtomFeed(data as AtomFeed);
        } else {
            return new Response(JSON.stringify({ error: 'Unknown feed format' }), {
                status: 400,
            });
        }

        // turn off cacheControl for feeds for now
        //const cacheControl = generateCacheControlHeader(5, 10);

        return new Response(JSON.stringify(items), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                //'Cache-Control': cacheControl,
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

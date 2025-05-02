import { FeedDiscovery } from '@/types/feeds/feedDiscovery';
import * as cheerio from 'cheerio';
import { XMLParser } from 'fast-xml-parser';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '',
});

async function getFeedInfo(url: string): Promise<FeedDiscovery | null> {
    try {
        const res = await fetch(url);
        if (!res.ok) return null;

        const text = await res.text();
        const parsed = parser.parse(text);

        if (parsed?.rss?.channel?.title) {
            return { feedUrl: url, title: parsed.rss.channel.title };
        } else if (parsed?.feed?.title) {
            return { feedUrl: url, title: parsed.feed.title };
        }

        return null;
    } catch {
        return null;
    }
}

async function discoverFeedFromHtml(pageUrl: string): Promise<string | null> {
    try {
        const res = await fetch(pageUrl);
        if (!res.ok) return null;

        const html = await res.text();
        const $ = cheerio.load(html);

        const feedLink = $('link[rel="alternate"]').filter((_, el) => {
            const type = $(el).attr('type') || '';
            return type.includes('rss') || type.includes('atom');
        }).first();

        const href = feedLink.attr('href');
        if (!href) return null;

        return new URL(href, pageUrl).toString();
    } catch {
        return null;
    }
}

export async function POST(req: NextRequest) {
    try {
        const { url } = await req.json() as { url: string };
        if (!url || typeof url !== 'string') {
            return new Response(JSON.stringify({ error: 'Missing or invalid URL' }), { status: 400 });
        }

        // Try direct feed URL first
        const directFeed = await getFeedInfo(url);
        if (directFeed) {
            return Response.json(directFeed);
        }

        // Try discovering a feed
        const discovered = await discoverFeedFromHtml(url);
        if (discovered) {
            const discoveredFeed = await getFeedInfo(discovered);
            if (discoveredFeed) {
                return Response.json(discoveredFeed);
            }
        }

        return new Response(JSON.stringify({ error: 'No valid RSS/Atom feed found' }), { status: 404 });
    } catch (err) {
        return new Response(JSON.stringify({ error: 'Server error', details: err }), { status: 500 });
    }
}

export const runtime = 'edge'

import * as cheerio from 'cheerio';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const { url } = await req.json() as { url: string };

        if (!url || typeof url !== 'string') {
            return NextResponse.json({ error: 'Invalid or missing URL' }, { status: 400 });
        }

        const response = await fetch(url, {
            method: 'GET',
        });

        if (!response.ok) {
            return NextResponse.json({ error: 'Failed to fetch the URL' }, { status: 500 });
        }

        const html = await response.text();
        const $ = cheerio.load(html);

        // Try og:title first
        const ogTitle = $('meta[property="og:title"]').attr('content');
        if (ogTitle) {
            return NextResponse.json({ title: ogTitle });
        }

        // Fallback to <title>
        const titleTag = $('title').first().text();
        if (titleTag) {
            return NextResponse.json({ title: titleTag });
        }

        return NextResponse.json({ error: 'Title not found on the page' }, { status: 404 });

    } catch (error: unknown) {
        return NextResponse.json(
            { error: 'Failed to extract title', details: (error as Error).message },
            { status: 500 }
        );
    }
}
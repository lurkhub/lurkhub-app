import { AtomFeed } from "@/types/feeds/atomFeed";
import { FeedInfo } from "@/types/feeds/feedInfo";
import { FeedItem } from "@/types/feeds/feedItem";
import { RssFeed } from "@/types/feeds/rssFeed";

export function parseRssFeed(data: RssFeed): FeedItem[] {
    return data.rss.channel.item.map((item) => ({
        title: item.title,
        link: item.link,
        published: item.pubDate ?? null,
    }));
}

export function parseAtomFeed(data: AtomFeed): FeedItem[] {
    return data.feed.entry.map((entry) => {
        const title =
            typeof entry.title === 'object' ? entry.title['#text'] : entry.title;

        let link = '';
        if (Array.isArray(entry.link)) {
            const alternate = entry.link.find((l) => l.rel === 'alternate');
            link = alternate?.href || entry.link[0].href;
        } else {
            link = entry.link.href;
        }

        return {
            title,
            link,
            published: entry.published || entry.updated || null,
        };
    });
}

export function parseRssInfo(data: RssFeed): FeedInfo {
    const channel = data.rss.channel;
    const title = channel.title ?? 'Untitled RSS Feed';

    let preview = '';
    let previewLink = '';

    if (Array.isArray(channel.item) && channel.item.length > 0) {
        const firstItem = channel.item[0];
        preview = firstItem.title ?? '';
        previewLink = firstItem.link ?? '';
    }

    let lastPublished: string | null = null;

    if (Array.isArray(channel.item)) {
        const validDates = channel.item
            .map(item => item.pubDate)
            .filter(Boolean)
            .map(dateStr => new Date(dateStr ?? ''))
            .filter(d => !isNaN(d.getTime()));

        if (validDates.length > 0) {
            const mostRecent = new Date(Math.max(...validDates.map(d => d.getTime())));
            lastPublished = mostRecent.toISOString();
        }
    }
    else if (channel.pubDate) {
        lastPublished = new Date(channel.pubDate).toISOString();
    }
    else if (channel.lastBuildDate) {
        lastPublished = new Date(channel.lastBuildDate).toISOString();
    }

    // if (channel.pubDate) {
    //     lastPublished = new Date(channel.pubDate).toISOString();
    // } else if (channel.lastBuildDate) {
    //     lastPublished = new Date(channel.lastBuildDate).toISOString();
    // } else if (Array.isArray(channel.item)) {
    //     const validDates = channel.item
    //         .map(item => item.pubDate)
    //         .filter(Boolean)
    //         .map(dateStr => new Date(dateStr ?? ''))
    //         .filter(d => !isNaN(d.getTime()));

    //     if (validDates.length > 0) {
    //         const mostRecent = new Date(Math.max(...validDates.map(d => d.getTime())));
    //         lastPublished = mostRecent.toISOString();
    //     }
    // }

    return { title, lastPublished, preview, previewLink };
}



export function parseAtomInfo(data: AtomFeed): FeedInfo {
    const rawTitle = data.feed.title;
    const title =
        typeof rawTitle === 'object' ? rawTitle['#text'] : rawTitle ?? 'Untitled Atom Feed';

    let preview = '';
    let previewLink = '';
    const firstEntry = data.feed.entry?.[0];

    if (firstEntry) {
        preview = typeof firstEntry.title === 'object'
            ? firstEntry.title['#text']
            : firstEntry.title;

        if (Array.isArray(firstEntry.link)) {
            const related = firstEntry.link.find(l => l.rel === 'related');
            const alternate = firstEntry.link.find(l => l.rel === 'alternate');
            previewLink = related?.href || alternate?.href || firstEntry.link[0]?.href || '';
        } else {
            previewLink = firstEntry.link?.href || '';
        }
    }

    let lastPublished: string | null = null;

    if (data.feed.updated) {
        lastPublished = new Date(data.feed.updated).toISOString();
    } else if (Array.isArray(data.feed.entry)) {
        const validDates = data.feed.entry
            .map(entry => entry.published)
            .filter(Boolean)
            .map(dateStr => new Date(dateStr ?? ''))
            .filter(d => !isNaN(d.getTime()));

        if (validDates.length > 0) {
            const mostRecent = new Date(Math.max(...validDates.map(d => d.getTime())));
            lastPublished = mostRecent.toISOString();
        }
    }

    return { title, lastPublished, preview, previewLink };
}

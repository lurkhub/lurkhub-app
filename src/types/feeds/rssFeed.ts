import { RssEntry } from "./rssEntry";

export type RssFeed = {
    rss: {
        channel: {
            title?: string;
            pubDate?: string;
            lastBuildDate?: string;
            item: RssEntry[];
        };
    };
};
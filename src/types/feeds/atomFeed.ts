import { AtomEntry } from "./atomEntry";

export type AtomFeed = {
    feed: {
        title?: string | { '#text': string };
        updated?: string;
        entry: AtomEntry[];
    };
};
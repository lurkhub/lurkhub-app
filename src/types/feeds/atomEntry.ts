export type AtomEntry = {
    title: string | { '#text': string };
    link: { href: string } | Array<{ href: string; rel?: string }>;
    updated?: string;
    published?: string;
};
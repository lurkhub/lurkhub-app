export interface Feed {
    id: string;
    title: string;
    url: string;
    tags: string;
    created: string;
    lastPublished?: string;
    preview?: string;
    previewLink?: string;
}

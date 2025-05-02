export const filePaths = {
    bookmarks: encodeURIComponent("bookmarks/bookmarks.json"),
    bookmarksArchive: (n: number) =>
        encodeURIComponent(`bookmarks/archive/bookmarks-archive-${n.toString().padStart(3, "0")}.json`),
    articles: encodeURIComponent("articles/articles.json"),
    articlesArchive: (n: number) =>
        encodeURIComponent(`articles/archive/articles-archive-${n.toString().padStart(3, "0")}.json`),
    feeds: encodeURIComponent("feeds/feeds.json"),
    feedsArchive: (n: number) =>
        encodeURIComponent(`feeds/archive/feeds-archive-${n.toString().padStart(3, "0")}.json`),
};

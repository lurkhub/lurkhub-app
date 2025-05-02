import { apiPaths } from '@/constants/apiPaths';
import { repos } from '@/constants/repos';
import { Post } from '@/types/post';
import { PostConfig } from '@/types/postConfig';
import { format } from 'date-fns';
import { fetchDataset, fetchPublicDatasetFromApi } from './datasetService';
import { createFileInRepo, deleteFileInRepo, fetchPublicApiFile, fetchPublicJson, fetchUserFile, updateFileInRepo } from './fileService';
import { fetchUser } from './userService';

export const POSTS_PER_INDEX = 100;
export const POSTS_PER_PAGE = 50;
export const POSTS_PREVIEW_LENGTH = 280;

export function createPostId(): string {
    return Date.now().toString();
}

export function getPostDate(post: Post): Date {
    const id = Number(post.id);
    return new Date(id);
}

export function getIndexPath(index: number): string {
    return `index-${String(index).padStart(5, '0')}.json`;
}

export function getIndexPathForPage(page: number, total: number): string {
    const index = total - page + 1;
    return `index-${String(index).padStart(5, '0')}.json`;
}

function getNextIndexPath(filename: string): string {
    const match = filename.match(/^index-(\d{5})\.json$/);
    if (!match) throw new Error('Filename format is incorrect');

    const number = parseInt(match[1], 10) + 1;

    return getIndexPath(number);
}

export async function getPostConfig(): Promise<PostConfig | null> {
    const configText = await fetchUserFile(repos.posts, 'lurkhub-posts.json');

    if (configText === null) {
        return null;
    }

    return JSON.parse(configText) as PostConfig;
}

export async function createPostConfig(postConfig: PostConfig): Promise<Response> {
    const configJson = JSON.stringify(postConfig, null, 2);
    return await createFileInRepo(repos.posts, 'lurkhub-posts.json', configJson);
}

export async function updatePostConfig(postConfig: PostConfig): Promise<Response> {
    const configJson = JSON.stringify(postConfig, null, 2);
    return await updateFileInRepo(repos.posts, 'lurkhub-posts.json', configJson);
}

export async function getPublicPostConfig(username: string): Promise<PostConfig | null> {
    const postConfig = await fetchPublicJson<PostConfig>(username, repos.posts, 'lurkhub-posts.json');

    if (!postConfig) {
        return null;
    }

    return postConfig;
}

export async function getPosts(path: string): Promise<Post[]> {
    const dataset = await fetchDataset(repos.posts, path);

    return dataset.values.map(([id, preview, more]) => ({
        id,
        preview,
        more
    }));
}


export async function getUniPostConfig(username: string | null): Promise<PostConfig | null> {
    if (username) {
        return await fetchPublicJson<PostConfig>(username, repos.posts, 'lurkhub-posts.json');
    }

    return getPostConfig();
}

// Return posts either public or github if username is null
export async function getUniPosts(path: string, username: string | null): Promise<Post[]> {
    if (username) {
        return await getAllPostsPublic(username, path);
    }

    return await getPosts(path);
}



// Build a filename such as index‑00005.json for a given 1‑based index number
function buildIndexPath(n: number) {
    return `index-${n.toString().padStart(5, '0')}.json`;
}


export async function getPagedPosts(pageNumber: number, username: string | null): Promise<Post[]> {
    if (pageNumber < 1) throw new Error('pageNumber must be >= 1');

    const cfg = await getUniPostConfig(username);
    if (!cfg) return [];

    const newestFileNo = cfg.totalIndexes;
    const newestPosts = await getUniPosts(buildIndexPath(newestFileNo), username);
    const newestCount = newestPosts.length;

    const start = (pageNumber - 1) * POSTS_PER_PAGE;
    const limit = POSTS_PER_PAGE;

    let fileNo: number;
    let postsToSkip: number;

    if (start < newestCount) {
        fileNo = newestFileNo;
        postsToSkip = start;
    } else {
        const remaining = start - newestCount;
        const fullFilesToSkip = Math.floor(remaining / POSTS_PER_INDEX);
        fileNo = newestFileNo - (fullFilesToSkip + 1);
        postsToSkip = remaining % POSTS_PER_INDEX;
    }

    if (fileNo < 1) return [];

    // Collect posts until the page is full or reaches the oldest file
    const pagePosts: Post[] = [];
    let firstFile = true;

    while (fileNo >= 1 && pagePosts.length < limit) {
        const raw = (fileNo === newestFileNo) ? newestPosts : await getUniPosts(buildIndexPath(fileNo), username);
        const postsInFile = raw.slice().reverse();

        const sliceStart = firstFile ? postsToSkip : 0;
        for (let i = sliceStart; i < postsInFile.length && pagePosts.length < limit; i++) {
            pagePosts.push(postsInFile[i]);
        }

        firstFile = false;
        fileNo--;
        postsToSkip = 0;
    }

    return pagePosts;
}




export async function getAllPostsPublic(username: string, path: string): Promise<Post[]> {
    //const path = postsPagePath(page);
    const dataset = await fetchPublicDatasetFromApi(username, repos.posts, path);

    return dataset.values.map(([id, preview, more]) => ({
        id,
        preview,
        more
    }));
}

export async function getPostById(path: string, id: string): Promise<Post | null> {
    const posts = await getPosts(path);
    return posts.find(p => p.id === id) ?? null;
}


export function getPostPathFromId(id: string): string {
    const timestamp = parseInt(id, 10);

    if (isNaN(timestamp)) {
        throw new Error(`Invalid timestamp ID: ${id}`);
    }

    const date = new Date(timestamp);
    const year = format(date, "yyyy");
    const month = format(date, "MM");
    const day = format(date, "dd");

    return `posts/${year}/${month}/${day}/${id}`;
}

export async function getPostContent(id: string) {
    const postPath = getPostPathFromId(id) + ".md";

    return await fetchUserFile(repos.posts, postPath);
}

export async function getPublicPostContent(username: string, id: string) {
    const postPath = getPostPathFromId(id) + ".md";

    return await fetchPublicApiFile(username, repos.posts, postPath);
}

// export async function createOrUpdatePost(path: string, post: Post): Promise<Response> {
//     const items = await getPosts(path);
//     const normalized = normalizeUrl(post.postPath);
//     const now = new Date().toISOString();

//     const existing = items.find(p => normalizeUrl(p.postPath) === normalized);
//     post.id = existing?.id || post.id || createId();
//     post.postPath = normalized;
//     post.created = now;

//     return existing
//         ? await updatePost(path, post)
//         : await createPost(path, post);
// }

export function getPreview(content: string): string {
    return content.trim().substring(0, POSTS_PREVIEW_LENGTH);
}


export async function createPost(indexPath: string, post: Post, content: string): Promise<Response> {
    let postConfig = await getPostConfig()

    if (!postConfig) {
        const user = await fetchUser();

        postConfig = {
            fullname: user?.name || '',
            totalIndexes: 1,
        }

        await createPostConfig(postConfig);
    }

    const items = await getPosts(indexPath);

    if (items.length >= POSTS_PER_INDEX) {
        indexPath = getNextIndexPath(indexPath);
        postConfig.totalIndexes += 1;
        await updatePostConfig(postConfig);
    }

    await fetch(`${apiPaths.dataset}?repo=${repos.posts}&path=${indexPath}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(post),
    });

    const postPath = getPostPathFromId(post.id) + ".md";
    return await createFileInRepo(repos.posts, postPath, content.trim());
}

export async function updatePost(path: string, post: Post, content: string): Promise<Response> {
    await fetch(`${apiPaths.dataset}?repo=${repos.posts}&path=${path}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(Object.values(post)),
    });

    const postPath = getPostPathFromId(post.id) + ".md";
    return await updateFileInRepo(repos.posts, postPath, content.trim());
}

export async function deletePostById(pageNumber: number, post: Post): Promise<Response> {
    const path = getIndexPath(pageNumber);
    const id = post.id;

    await fetch(`${apiPaths.dataset}?repo=${repos.posts}&path=${path}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
    });

    const postPath = getPostPathFromId(post.id) + ".md";
    return await deleteFileInRepo(repos.posts, postPath);
}

import { apiPaths } from '@/constants/apiPaths';
import { filePaths } from '@/constants/filePaths';
import { repos } from '@/constants/repos';
import { fetchDataset } from '@/services/datasetService';
import { Article } from '@/types/article';
import { createId } from '@/utils/createId';
import { normalizeUrl } from '@/utils/misc';

async function getAll(path: string): Promise<Article[]> {
    const dataset = await fetchDataset(repos.data, path);
    return dataset.values.map(([id, title, url, tags, created]) => ({
        id, title, url, tags, created
    }));
}

async function getById(path: string, id: string): Promise<Article | null> {
    const items = await getAll(path);
    return items.find(i => i.id === id) ?? null;
}

async function createOrUpdate(path: string, article: Article): Promise<Response> {
    const items = await getAll(path);
    const normalized = normalizeUrl(article.url);
    const now = new Date().toISOString();
    const existing = items.find(i => normalizeUrl(i.url) === normalized);

    article.id = existing?.id || article.id || createId();
    article.url = normalized;
    article.created = now;

    return existing
        ? await update(path, article)
        : await create(path, article);
}

async function create(path: string, article: Article): Promise<Response> {
    return fetch(`${apiPaths.dataset}?repo=${repos.data}&path=${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(article),
    });
}

async function update(path: string, article: Article): Promise<Response> {
    return fetch(`${apiPaths.dataset}?repo=${repos.data}&path=${path}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(Object.values(article)),
    });
}

async function deleteById(path: string, id: string): Promise<Response> {
    return fetch(`${apiPaths.dataset}?repo=${repos.data}&path=${path}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
    });
}

// Paths
const articlePath = filePaths.articles;
const archivePath = filePaths.articlesArchive(1);

// Article Functions
export const getArticles = () => getAll(articlePath);
export const getArticleById = (id: string) => getById(articlePath, id);
export const createOrUpdateArticle = (a: Article) => createOrUpdate(articlePath, a);
export const createArticle = (a: Article) => create(articlePath, a);
export const updateArticle = (a: Article) => update(articlePath, a);
export const deleteArticle = (id: string) => deleteById(articlePath, id);

// Archived Article Functions
export const getArchivedArticles = () => getAll(archivePath);
export const getArchivedArticleById = (id: string) => getById(archivePath, id);
export const createOrUpdateArchivedArticle = (a: Article) => createOrUpdate(archivePath, a);
export const createArchivedArticle = (a: Article) => create(archivePath, a);
export const updateArchivedArticle = (a: Article) => update(archivePath, a);
export const deleteArchivedArticle = (id: string) => deleteById(archivePath, id);

export async function archiveArticle(article: Article): Promise<Response> {
    const resCreate = await createArchivedArticle(article);
    if (!resCreate.ok) return resCreate;

    return deleteArticle(article.id);
}

export async function restoreArticle(article: Article): Promise<Response> {
    const resCreate = await createOrUpdateArticle(article);
    if (!resCreate.ok) return resCreate;

    console.log('deleting id;', article.id);
    return deleteArchivedArticle(article.id);
}

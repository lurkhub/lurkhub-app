
export type RepoAccessResult = {
    exists: boolean;
    hasWriteAccess: boolean;
    error?: string;
};
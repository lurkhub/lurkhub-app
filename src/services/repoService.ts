import { RepoAccessResult } from "@/types/repoAccessResult";
import { isErrorWithStatus } from "@/utils/errorUtils";
import getErrorMessage from "@/utils/getErrorMessage";
import { Octokit } from "@octokit/rest";


export async function checkRepoAccess(
    accessToken: string,
    owner: string,
    repo: string
): Promise<RepoAccessResult> {
    const octokit = new Octokit({ auth: accessToken });

    try {
        const { data } = await octokit.repos.get({ owner, repo });

        return {
            exists: true,
            hasWriteAccess: data.permissions?.push === true,
        };
    } catch (error: unknown) {
        if (isErrorWithStatus(error)) {
            if (error.status === 404) {
                return {
                    exists: false,
                    hasWriteAccess: false,
                };
            }
        }

        return {
            exists: false,
            hasWriteAccess: false,
            error: getErrorMessage(error) || "Unknown error",
        };
    }
}

type CreateRepoOptions = {
    accessToken: string;
    name: string;
    description?: string;
    private?: boolean;
};

export async function createRepo({
    accessToken,
    name,
    description = "",
    private: isPrivate = true,
}: CreateRepoOptions): Promise<{ success: true } | { success: false; error: string }> {
    const octokit = new Octokit({ auth: accessToken });

    try {
        const { data: repo } = await octokit.repos.createForAuthenticatedUser({
            name,
            description,
            private: isPrivate,
            auto_init: true,
        });

        const gitignoreContent = [".DS_Store", "Thumbs.db", "Desktop.ini"].join("\n");

        await octokit.repos.createOrUpdateFileContents({
            owner: repo.owner.login,
            repo: repo.name,
            path: ".gitignore",
            message: "Add .gitignore for OS-generated files",
            content: Buffer.from(gitignoreContent).toString("base64"),
        });

        return { success: true };
    } catch (error: unknown) {
        return {
            success: false,
            error: getErrorMessage(error),
        };
    }
}


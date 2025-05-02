import { SessionData, sessionOptions } from "@/lib/session";
import { isErrorWithStatus } from "@/utils/errorUtils";
import getErrorMessage from "@/utils/getErrorMessage";
import { Octokit } from "@octokit/rest";
import { getIronSession } from "iron-session";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

export async function GET(req: NextRequest) {
    try {
        const res = NextResponse.next();
        const session = await getIronSession<SessionData>(req, res, sessionOptions);

        if (!session.accessToken) {
            return NextResponse.json({ error: "Unauthorized", message: "No valid session found" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const repo = searchParams.get("repo");
        const path = searchParams.get("path");
        const clientETag = req.headers.get("if-none-match");

        if (!repo || !path || !session.userLogin) {
            return Response.json({ error: "Missing required parameters" }, { status: 400 });
        }

        const owner = session.userLogin;
        const octokit = new Octokit({ auth: session.accessToken });

        try {
            const response = await octokit.rest.repos.getContent({
                owner,
                repo,
                path,
                headers: clientETag ? { "If-None-Match": clientETag } : undefined,
            });

            if ("content" in response.data && typeof response.data.content === "string") {
                const content = Buffer.from(response.data.content, "base64").toString("utf-8");
                const responseETag = response.headers.etag ?? "";
                const contentType = "text/plain";

                return new NextResponse(content, {
                    status: 200,
                    headers: {
                        "Content-Type": contentType,
                        "ETag": responseETag,
                        "Cache-Control": "max-age=300",
                    },
                });
            }

            throw new Error("Unexpected response: File content not found");
        } catch (err: unknown) {
            if (isErrorWithStatus(err)) {
                if (err.status === 304) {
                    return new NextResponse(null, {
                        status: 304,
                        headers: {
                            "ETag": clientETag || "",
                        },
                    });
                }

                if (err.status === 404) {
                    return new NextResponse("", {
                        status: 404,
                        headers: {
                            "Content-Type": "text/plain",
                            "Cache-Control": "no-store",
                        },
                    });
                }
            }

            throw err;
        }
    } catch (error) {
        const errorMessage = getErrorMessage(error);

        return NextResponse.json(
            { error: "Failed to fetch file content", details: errorMessage },
            { status: 500 }
        );
    }
}

export async function POST(req: NextRequest) {
    try {
        const res = NextResponse.next();
        const session = await getIronSession<SessionData>(req, res, sessionOptions);

        if (!session.accessToken) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const repo = searchParams.get("repo");
        const path = searchParams.get("path");

        if (!repo || !path || !session.userLogin) {
            return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
        }

        const content = await req.text();

        const octokit = new Octokit({ auth: session.accessToken });

        await octokit.rest.repos.createOrUpdateFileContents({
            owner: session.userLogin,
            repo,
            path,
            message: `Created ${path}`,
            content: Buffer.from(content).toString("base64"),
        });

        return NextResponse.json({ message: "File created successfully" }, { status: 201 });
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to create file", details: getErrorMessage(error) },
            { status: 500 }
        );
    }
}

export async function PUT(req: NextRequest) {
    try {
        const res = NextResponse.next();
        const session = await getIronSession<SessionData>(req, res, sessionOptions);

        if (!session.accessToken) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const repo = searchParams.get("repo");
        const path = searchParams.get("path");

        if (!repo || !path || !session.userLogin) {
            return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
        }

        const content = await req.text();

        const octokit = new Octokit({ auth: session.accessToken });

        const { data } = await octokit.rest.repos.getContent({ owner: session.userLogin, repo, path });

        if (!("sha" in data)) {
            throw new Error("SHA not found");
        }

        await octokit.rest.repos.createOrUpdateFileContents({
            owner: session.userLogin,
            repo,
            path,
            message: `Updated ${path}`,
            content: Buffer.from(content).toString("base64"),
            sha: data.sha,
        });

        return NextResponse.json({ message: "File updated successfully" }, { status: 200 });
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to update file", details: getErrorMessage(error) },
            { status: 500 }
        );
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const res = NextResponse.next();
        const session = await getIronSession<SessionData>(req, res, sessionOptions);

        if (!session.accessToken) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const repo = searchParams.get("repo");
        const path = searchParams.get("path");

        if (!repo || !path || !session.userLogin) {
            return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
        }

        const octokit = new Octokit({ auth: session.accessToken });

        const { data } = await octokit.rest.repos.getContent({ owner: session.userLogin, repo, path });

        if (!("sha" in data)) {
            throw new Error("SHA not found");
        }

        await octokit.rest.repos.deleteFile({
            owner: session.userLogin,
            repo,
            path,
            message: `Deleted ${path}`,
            sha: data.sha,
        });

        return NextResponse.json({ message: "File deleted successfully" }, { status: 200 });
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to delete file", details: getErrorMessage(error) },
            { status: 500 }
        );
    }
}


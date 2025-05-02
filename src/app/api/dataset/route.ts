import { SessionData, sessionOptions } from '@/lib/session';
import { Dataset } from '@/types/dataset';
import { isErrorWithStatus } from '@/utils/errorUtils';
import getErrorMessage from '@/utils/getErrorMessage';
import { Octokit } from '@octokit/rest';
import { getIronSession } from 'iron-session';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

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

        if (!repo) {
            return Response.json({ error: "Missing repo parameter" }, { status: 400 });
        }

        if (!path) {
            return Response.json({ error: "Missing path parameter" }, { status: 400 });
        }

        if (!session.userLogin) {
            return Response.json({ error: "Missing login name" }, { status: 400 });
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

            // GitHub will throw an error for 304 (Octokit does not return the raw response)
            if ("content" in response.data && typeof response.data.content === "string") {
                const content = Buffer.from(response.data.content, "base64").toString("utf-8");
                const dataset: Dataset = JSON.parse(content);
                const responseETag = response.headers.etag ?? "";

                return new NextResponse(JSON.stringify(dataset), {
                    status: 200,
                    headers: {
                        "Content-Type": "application/json",
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
                    const emptyDataset: Dataset = { fields: [], values: [] };

                    return new NextResponse(JSON.stringify(emptyDataset), {
                        status: 200,
                        headers: {
                            "Content-Type": "application/json",
                            "Cache-Control": "max-age=60",
                        },
                    });
                }
            }

            throw err;
        }
    } catch (error) {
        const errorMessage = getErrorMessage(error);

        return NextResponse.json(
            { error: "Failed to fetch JSON file", details: errorMessage },
            { status: 500 }
        );
    }
}


export async function POST(req: NextRequest) {
    try {
        const res = NextResponse.next();
        const session = await getIronSession<SessionData>(req, res, sessionOptions);

        if (!session.accessToken) {
            return NextResponse.json({ error: 'Unauthorized', message: 'No valid session found' }, { status: 401 });
        }

        // Get the path to the dataset file
        const { searchParams } = new URL(req.url);
        const repo = searchParams.get("repo");
        const path = searchParams.get("path");

        if (!repo) {
            return Response.json({ error: "Missing repo parameter" }, { status: 400 });
        }

        if (!path) {
            return Response.json({ error: "Missing path parameter" }, { status: 400 });
        }

        if (!session.userLogin) {
            return Response.json({ error: "Missing login name" }, { status: 400 });
        }

        const octokit = new Octokit({ auth: session.accessToken });

        // Define repo details
        const owner = session.userLogin;

        // Get new data from request body
        const newData: string[] = await req.json();
        const fields = Object.keys(newData);
        const values = Object.values(newData);

        let fileContent;

        let jsonData: Dataset = {
            fields: fields,
            values: [],
        };

        let sha = "";

        try {
            const { data } = await octokit.rest.repos.getContent({
                owner,
                repo,
                path,
            });

            if (!('content' in data) || !('sha' in data) || typeof data.content !== 'string') {
                throw new Error('Unexpected response: File content not found or invalid format');
            }

            // Decode base64 content
            fileContent = Buffer.from(data.content, 'base64').toString('utf-8');

            // Save sha for updating the file later
            sha = data.sha;

            // Parse current JSON file as Dataset
            try {
                jsonData = JSON.parse(fileContent);
            } catch {
                return NextResponse.json({ error: "Invalid JSON format in file" }, { status: 500 });
            }
        } catch {
            // file doesn't exist yet
            // TODO: handle this properly by checking for a 404 error
        }

        // Append new data to values array
        jsonData.values.push(values);

        // Convert back to JSON string and encode as base64
        const updatedContent = Buffer.from(JSON.stringify(jsonData, null, 2)).toString('base64');

        // Commit the new file to GitHub
        if (sha) {
            await octokit.rest.repos.createOrUpdateFileContents({
                owner,
                repo,
                path,
                message: `Updated ${path} with new entry`,
                content: updatedContent,
                sha: sha,
            });
        }
        else {
            await octokit.rest.repos.createOrUpdateFileContents({
                owner,
                repo,
                path,
                message: `Created ${path} with new entry`,
                content: updatedContent,
            });
        }

        return NextResponse.json({ message: "File updated successfully" }, { status: 200 });

    } catch (error) {
        const errorMessage = getErrorMessage(error);
        return NextResponse.json(
            { error: 'Failed to update JSON file', details: errorMessage },
            { status: 500 }
        );
    }
}

export async function PUT(req: NextRequest) {
    try {
        const res = NextResponse.next();
        const session = await getIronSession<SessionData>(req, res, sessionOptions);

        if (!session.accessToken) {
            return NextResponse.json(
                { error: 'Unauthorized', message: 'No valid session found' },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(req.url);
        const repo = searchParams.get("repo");
        const path = searchParams.get('path');

        if (!repo) {
            return Response.json({ error: "Missing repo parameter" }, { status: 400 });
        }

        if (!path) {
            return NextResponse.json({ error: 'Missing path parameter' }, { status: 400 });
        }

        if (!session.userLogin) {
            return Response.json({ error: "Missing login name" }, { status: 400 });
        }

        const octokit = new Octokit({ auth: session.accessToken });

        const owner = session.userLogin;

        const { data } = await octokit.rest.repos.getContent({
            owner,
            repo,
            path,
        });

        if (!('content' in data) || !('sha' in data) || typeof data.content !== 'string') {
            throw new Error('Unexpected response: File content not found or invalid format');
        }

        const fileContent = Buffer.from(data.content, 'base64').toString('utf-8');

        let jsonData: Dataset;
        try {
            jsonData = JSON.parse(fileContent);
        } catch {
            return NextResponse.json({ error: 'Invalid JSON format in file' }, { status: 500 });
        }

        if (
            !jsonData.fields ||
            !jsonData.values ||
            !Array.isArray(jsonData.fields) ||
            !Array.isArray(jsonData.values)
        ) {
            return NextResponse.json({ error: 'Invalid Dataset format in JSON file' }, { status: 500 });
        }

        // Get updated data
        const updatedData: string[] = await req.json();

        if (!Array.isArray(updatedData) || updatedData.some(item => typeof item !== 'string')) {
            return NextResponse.json(
                { error: 'Invalid data format: Expected an array of strings' },
                { status: 400 }
            );
        }

        if (updatedData.length !== jsonData.fields.length) {
            return NextResponse.json(
                {
                    error: 'Data length mismatch',
                    expected: jsonData.fields.length,
                    received: updatedData.length,
                },
                { status: 400 }
            );
        }

        const idIndex = jsonData.fields.indexOf('id');
        if (idIndex === -1) {
            return NextResponse.json({ error: 'No "id" field in dataset' }, { status: 500 });
        }

        const updatedId = updatedData[idIndex];

        let replaced = false;

        jsonData.values = jsonData.values.map(row => {
            if (row[idIndex] === updatedId) {
                replaced = true;
                return updatedData;
            }
            return row;
        });

        if (!replaced) {
            return NextResponse.json({ error: 'No entry found with matching ID' }, { status: 404 });
        }

        const updatedContent = Buffer.from(JSON.stringify(jsonData, null, 2)).toString('base64');

        await octokit.rest.repos.createOrUpdateFileContents({
            owner,
            repo,
            path,
            message: `Updated entry with id ${updatedId} in ${path}`,
            content: updatedContent,
            sha: data.sha,
        });

        return NextResponse.json({ message: 'Entry updated successfully' }, { status: 200 });
    } catch (error) {
        const errorMessage = getErrorMessage(error);
        return NextResponse.json(
            { error: 'Failed to update JSON file', details: errorMessage },
            { status: 500 }
        );
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const res = NextResponse.next();
        const session = await getIronSession<SessionData>(req, res, sessionOptions);

        if (!session.accessToken) {
            return NextResponse.json(
                { error: 'Unauthorized', message: 'No valid session found' },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(req.url);
        const repo = searchParams.get("repo");
        const path = searchParams.get('path');

        if (!repo) {
            return Response.json({ error: "Missing repo parameter" }, { status: 400 });
        }

        if (!path) {
            return NextResponse.json({ error: 'Missing path parameter' }, { status: 400 });
        }

        if (!session.userLogin) {
            return Response.json({ error: "Missing login name" }, { status: 400 });
        }

        const { id }: { id: string } = await req.json();

        if (!id || typeof id !== 'string') {
            return NextResponse.json({ error: 'Missing or invalid "id" in body' }, { status: 400 });
        }

        const owner = session.userLogin;
        const octokit = new Octokit({ auth: session.accessToken });

        const { data } = await octokit.rest.repos.getContent({
            owner,
            repo,
            path,
        });

        if (!('content' in data) || !('sha' in data) || typeof data.content !== 'string') {
            throw new Error('Unexpected response: File content not found or invalid format');
        }

        const fileContent = Buffer.from(data.content, 'base64').toString('utf-8');

        let jsonData: Dataset;
        try {
            jsonData = JSON.parse(fileContent);
        } catch {
            return NextResponse.json({ error: 'Invalid JSON format in file' }, { status: 500 });
        }

        if (
            !jsonData.fields ||
            !jsonData.values ||
            !Array.isArray(jsonData.fields) ||
            !Array.isArray(jsonData.values)
        ) {
            return NextResponse.json({ error: 'Invalid Dataset format in JSON file' }, { status: 500 });
        }

        const idIndex = jsonData.fields.indexOf('id');
        if (idIndex === -1) {
            return NextResponse.json({ error: 'No "id" field in dataset' }, { status: 500 });
        }

        const originalLength = jsonData.values.length;

        jsonData.values = jsonData.values.filter(row => row[idIndex] !== id);

        if (jsonData.values.length === originalLength) {
            return NextResponse.json({ error: 'No entry found with matching ID' }, { status: 404 });
        }

        const updatedContent = Buffer.from(JSON.stringify(jsonData, null, 2)).toString('base64');

        await octokit.rest.repos.createOrUpdateFileContents({
            owner,
            repo,
            path,
            message: `Deleted entry with id ${id} from ${path}`,
            content: updatedContent,
            sha: data.sha,
        });

        return NextResponse.json({ message: 'Entry deleted successfully' }, { status: 200 });
    } catch (error) {
        const errorMessage = getErrorMessage(error);
        return NextResponse.json(
            { error: 'Failed to delete entry', details: errorMessage },
            { status: 500 }
        );
    }
}
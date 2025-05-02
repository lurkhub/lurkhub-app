import { SessionData, sessionOptions } from "@/lib/session";
import { checkRepoAccess } from "@/services/repoService";
import { getIronSession } from "iron-session";
import { NextRequest, NextResponse } from "next/server";

export const runtime = 'edge';

export async function GET(req: NextRequest) {
    const res = NextResponse.next();
    const session = await getIronSession<SessionData>(req, res, sessionOptions);

    const { searchParams } = new URL(req.url);
    const owner = searchParams.get("owner");
    const repo = searchParams.get("repo");

    if (!session.accessToken || !owner || !repo) {
        return NextResponse.json(
            { error: "Missing required query parameters or session" },
            { status: 400 }
        );
    }

    const result = await checkRepoAccess(session.accessToken, owner, repo);
    return NextResponse.json(result, {
        status: result.error ? 500 : 200,
    });
}

import { SessionData, sessionOptions } from "@/lib/session";
import { createRepo } from "@/services/repoService";
import { getIronSession } from "iron-session";
import { NextRequest, NextResponse } from "next/server";

export const runtime = 'edge';

export interface CreateRepoRequestBody {
    name: string;
    description?: string;
    private?: boolean;
}

export async function POST(req: NextRequest) {
    const body = await req.json() as CreateRepoRequestBody;;

    const res = NextResponse.next();
    const session = await getIronSession<SessionData>(req, res, sessionOptions);

    if (!session.accessToken) {
        return NextResponse.json({ error: "Unauthorized", message: "No valid session found" }, { status: 401 });
    }

    const { name, description, private: isPrivate } = body;

    if (!session.accessToken || !name) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const result = await createRepo({
        accessToken: session.accessToken,
        name,
        description,
        private: isPrivate,
    });

    return NextResponse.json(result, {
        status: result.success ? 200 : 500,
    });
}

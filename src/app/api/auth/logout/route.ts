import { SessionData, sessionOptions } from "@/lib/session";
import { getIronSession } from "iron-session";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

export async function GET(req: NextRequest) {
    const res = NextResponse.redirect(new URL("/", req.url));

    const session = await getIronSession<SessionData>(req, res, sessionOptions);
    session.destroy();
    await session.save();

    return res;
}

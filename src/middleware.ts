import { getIronSession } from 'iron-session';
import { NextRequest, NextResponse } from 'next/server';
import { SessionData, sessionOptions } from './lib/session';

export async function middleware(req: NextRequest) {
    const url = req.nextUrl.clone();
    const res = NextResponse.next();

    const session = await getIronSession<SessionData>(req, res, sessionOptions);

    // Check for @username route
    const atUsernameMatch = url.pathname.match(/^\/@([^/]+)(\/.*)?$/);
    if (atUsernameMatch) {
        const username = atUsernameMatch[1];
        const userPath = atUsernameMatch[2] || '';
        url.pathname = `/user/${username}${userPath}`;
        return NextResponse.rewrite(url);
    }

    const protectedRoutes = ["/profile", "/articles", "/bookmarks", "/feeds", "/posts"];

    const needsSetup = req.cookies.get("setup")?.value === "true";

    if (protectedRoutes.includes(url.pathname)) {
        if (!session.accessToken) {
            return NextResponse.redirect(new URL("/login", req.url));
        }

        if (needsSetup) {
            return NextResponse.redirect(new URL("/setup", req.url));
        }
    }

    return res;
}

export const config = {
    matcher: [
        '/profile',
        '/bookmarks',
        '/articles',
        '/feeds',
        '/posts',
        '/@:username',
        '/@:username/:path*',
    ],
};

import { repos } from '@/constants/repos';
import { SessionData, sessionOptions } from '@/lib/session';
import { checkRepoAccess } from '@/services/repoService';
import { Octokit } from '@octokit/rest';
import { getIronSession } from "iron-session";
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge'

export async function GET(req: NextRequest) {

    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');

    if (!code) {
        return new Response('Missing code', { status: 400 });
    }

    const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
    const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;

    // Exchange code for access token
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
        },
        body: JSON.stringify({
            client_id: GITHUB_CLIENT_ID,
            client_secret: GITHUB_CLIENT_SECRET,
            code,
        }),
    });

    interface TokenResponse {
        access_token?: string;
    }

    const tokenData: TokenResponse = await tokenResponse.json();
    if (!tokenData.access_token) {
        return new Response('Failed to retrieve access token', { status: 401 });
    }

    const res = NextResponse.redirect(new URL("/", req.url));

    const octokit = new Octokit({ auth: tokenData.access_token });
    const { data: userData } = await octokit.rest.users.getAuthenticated();

    // Create session
    const session = await getIronSession<SessionData>(req, res, sessionOptions);
    session.accessToken = tokenData.access_token;
    session.userLogin = userData.login;
    session.avatarUrl = userData.avatar_url;
    await session.save();

    // Check repo access here
    const requiredRepos = [
        { owner: userData.login, repo: repos.data },
        { owner: userData.login, repo: repos.posts }
    ];

    for (const r of requiredRepos) {
        const result = await checkRepoAccess(tokenData.access_token, r.owner, r.repo);
        console.log(result)
        if (!result.exists || !result.hasWriteAccess) {
            return NextResponse.redirect(new URL("/check", req.url));
            //res.headers.set("Location", "/check");

            // res.headers.append(
            //     "Set-Cookie",
            //     `setup=true; Path=/; SameSite=Lax; Secure`
            // );

            return res;
        }
    }


    return res;
}

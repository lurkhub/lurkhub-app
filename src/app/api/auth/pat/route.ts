import { repos } from '@/constants/repos';
import { SessionData, sessionOptions } from '@/lib/session';
import { checkRepoAccess } from '@/services/repoService';
import { Octokit } from '@octokit/rest';
import { getIronSession } from 'iron-session';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
    const body = await req.json() as { token?: string };
    const token = body.token;

    if (!token || typeof token !== 'string') {
        return new Response('Missing or invalid token', { status: 400 });
    }

    const res = NextResponse.json({ ok: true });

    try {
        const octokit = new Octokit({ auth: token });
        const { data: userData } = await octokit.rest.users.getAuthenticated();

        // Create session
        const session = await getIronSession<SessionData>(req, res, sessionOptions);
        session.accessToken = token;
        session.userLogin = userData.login;
        session.avatarUrl = userData.avatar_url;
        await session.save();

        // Check repo access
        const requiredRepos = [
            { owner: userData.login, repo: repos.data },
            { owner: userData.login, repo: repos.posts }
        ];

        for (const r of requiredRepos) {
            const result = await checkRepoAccess(token, r.owner, r.repo);
            if (!result.exists || !result.hasWriteAccess) {
                await session.save();
                return new NextResponse(
                    JSON.stringify({ error: 'Missing repo access' }),
                    { status: 403, headers: res.headers }
                );
            }
        }

        return res;
    } catch (err: unknown) {
        console.error('PAT login error:', err);
        return new Response('Invalid GitHub token or request failed', { status: 401 });
    }
}

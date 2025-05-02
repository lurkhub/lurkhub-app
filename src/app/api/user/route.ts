import { SessionData, sessionOptions } from '@/lib/session';
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
            return NextResponse.json({ error: 'Unauthorized', message: 'No valid session found' }, { status: 401 });
        }

        const rawETag = req.headers.get("if-none-match");
        const safeETag = rawETag ?? undefined;

        const octokit = new Octokit({ auth: session.accessToken });

        try {
            const response = await octokit.request("GET /user", {
                headers: {
                    ...(safeETag ? { "If-None-Match": safeETag } : {}),
                },
            });

            const userData = response.data;
            const returnedETag = response.headers.etag;

            return new NextResponse(JSON.stringify(userData), {
                status: 200,
                headers: {
                    ...(returnedETag ? { "ETag": returnedETag } : {}),
                },
            });
        } catch (err: unknown) {
            if (isErrorWithStatus(err) && err.status === 304) {
                return new NextResponse(null, {
                    status: 304,
                    headers: {
                        "ETag": safeETag || "",
                    },
                });
            }

            throw err;
        }
    } catch (error) {
        const errorMessage = getErrorMessage(error);
        return NextResponse.json(
            { error: 'Internal Server Error', details: errorMessage },
            { status: 500 }
        );
    }
}

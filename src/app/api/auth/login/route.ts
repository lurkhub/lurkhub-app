export const runtime = 'edge'

export async function GET() {

    // Redirect to GitHub OAuth Login
    const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
    const redirectUrl = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&scope=repo`;

    return new Response(null, {
        status: 302,
        headers: {
            Location: redirectUrl,
        },
    });
}
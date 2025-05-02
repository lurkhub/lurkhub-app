
import { SessionOptions } from "iron-session";

export interface SessionData {
    accessToken?: string;
    userLogin?: string;
    avatarUrl?: string;
}

export const sessionOptions: SessionOptions = {
    cookieName: "session",
    password: process.env.SESSION_SECRET as string,
    cookieOptions: {
        httpOnly: true,
        sameSite: 'strict',
        secure: true,
        path: '/',
    },
};

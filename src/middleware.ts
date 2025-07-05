import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Redirect root path to /chat
    if (pathname === '/') {
        return NextResponse.redirect(new URL('/chat', request.url));
    }

    // Make sure authenticated users access /chat instead of /login
    if (pathname === '/login') {
        const accessToken = request.cookies.get('accessToken')?.value ||
            request.headers.get('x-access-token');

        if (accessToken) {
            return NextResponse.redirect(new URL('/chat', request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/', '/login'],
};

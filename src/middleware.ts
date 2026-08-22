import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getSchoolIdFromHost } from '@/lib/school';

export function middleware(request: NextRequest) {
    const hostname = request.headers.get('host') || '';
    const searchParams = request.nextUrl.searchParams;

    const schoolId = getSchoolIdFromHost(hostname, searchParams);

    // Clone request headers and add x-school-id
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-school-id', schoolId);

    return NextResponse.next({
        request: {
            headers: requestHeaders,
        },
    });
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public assets
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};

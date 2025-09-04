import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { RouteGuard } from './lib/auth/route-guard'

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl

    // Skip middleware for static files and API routes that handle their own auth
    if (
        pathname.startsWith('/_next') ||
        pathname.startsWith('/api/') ||
        pathname.startsWith('/static/') ||
        pathname.includes('.')
    ) {
        return NextResponse.next()
    }

    // Get authentication status from cookies or headers
    const accessToken = request.cookies.get('secret_safe_access_token')?.value
    const refreshToken = request.cookies.get('secret_safe_refresh_token')?.value
    const isAuthenticated = !!accessToken // Only require access token for now

    // Get user role from JWT token if available
    let userRole: string | undefined

    if (accessToken) {
        try {
            // Basic JWT decode to get role (client-side will validate properly)
            const payload = JSON.parse(
                Buffer.from(accessToken.split('.')[1], 'base64').toString()
            )
            userRole = payload.role
        } catch {
            // Invalid token, treat as unauthenticated
            userRole = undefined
        }
    }

    // Check route access using RouteGuard
    const routeCheck = RouteGuard.checkRouteAccess(pathname, userRole, isAuthenticated)

    if (!routeCheck.allowed) {
        // Redirect to login or appropriate page
        const redirectUrl = new URL(routeCheck.redirectTo || '/auth/login', request.url)

        // Store original URL for post-login redirect
        if (pathname !== '/auth/login' && pathname !== '/auth/register') {
            redirectUrl.searchParams.set('redirect', pathname)
        }

        return NextResponse.redirect(redirectUrl)
    }

    // Access granted, continue
    return NextResponse.next()
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder
         */
        '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
    ],
}

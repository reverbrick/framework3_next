import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { isPublicRoute, shouldRedirectWhenLoggedIn } from '@/config/routes'

export async function middleware(request: NextRequest) {
  try {
    const pathname = request.nextUrl.pathname;
    
    // Debug logging
    console.log('Middleware check:', {
      pathname,
      isPublicRoute: isPublicRoute(pathname),
      shouldRedirectWhenLoggedIn: shouldRedirectWhenLoggedIn(pathname)
    });

    // Skip auth check for public routes
    if (isPublicRoute(pathname)) {
      console.log('Middleware: Allowing access to public route');
      return NextResponse.next();
    }

    const res = NextResponse.next();
    const supabase = createMiddlewareClient({ req: request, res });

    // Refresh session if expired
    const { data: { session } } = await supabase.auth.getSession();
    
    // Debug logging
    console.log('Middleware session check:', {
      pathname,
      hasSession: !!session,
      isPublicRoute: isPublicRoute(pathname),
      shouldRedirectWhenLoggedIn: shouldRedirectWhenLoggedIn(pathname)
    });

    // If there's no session and the user is trying to access a protected route
    if (!session) {
      console.log('Middleware: No session, redirecting to sign-in');
      const redirectUrl = new URL('/auth/sign-in', request.url);
      redirectUrl.searchParams.set('redirectedFrom', pathname);
      return NextResponse.redirect(redirectUrl);
    }

    // If there's a session and the user is trying to access specific auth routes
    if (session && shouldRedirectWhenLoggedIn(pathname)) {
      console.log('Middleware: Has session, redirecting to dashboard');
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    console.log('Middleware: Allowing access');
    return res;
  } catch (error) {
    console.error('Middleware error:', error);
    // If there's an error with the session, redirect to sign in
    const redirectUrl = new URL('/auth/sign-in', request.url);
    redirectUrl.searchParams.set('redirectedFrom', request.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
} 
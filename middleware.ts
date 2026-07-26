import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Check for the Better Auth session cookie
  const sessionCookie = 
    request.cookies.get("better-auth.session_token")?.value || 
    request.cookies.get("__Secure-better-auth.session_token")?.value;
    
  const pathname = request.nextUrl.pathname;
  
  const isAuthRoute = pathname.startsWith('/signin') || pathname.startsWith('/signup');
  const isProtectedRoute = pathname.startsWith('/dashboard') || pathname.startsWith('/owner');

  // If trying to access a protected route without a session cookie, redirect to signin
  if (!sessionCookie && isProtectedRoute) {
    return NextResponse.redirect(new URL("/signin", request.url));
  }

  // If trying to access auth routes with an active session cookie, redirect to dashboard
  if (sessionCookie && isAuthRoute) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*', 
    '/owner/:path*', 
    '/signin', 
    '/signup'
  ]
};

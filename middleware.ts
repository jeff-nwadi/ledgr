import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const allCookies = request.cookies.getAll();
  const sessionCookie = 
    request.cookies.get("better-auth.session_token")?.value || 
    request.cookies.get("__Secure-better-auth.session_token")?.value ||
    allCookies.find(c => c.name.includes("session_token"))?.value;
    
  const pathname = request.nextUrl.pathname;

  // Legacy /dashboard redirect
  if (pathname.startsWith('/dashboard')) {
    const target = pathname.replace('/dashboard', '/owner');
    return NextResponse.redirect(new URL(target, request.url));
  }
  
  const isProtectedRoute = 
    pathname.startsWith('/staff') ||  
    pathname.startsWith('/owner');

  // If trying to access a protected route without a session cookie, redirect to signin
  if (!sessionCookie && isProtectedRoute) {
    const targetRedirect = pathname.startsWith('/staff') ? "/signin?type=pin" : "/signin";
    return NextResponse.redirect(new URL(targetRedirect, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard',
    '/dashboard/:path*',
    '/staff',
    '/staff/:path*',
    '/owner',
    '/owner/:path*', 
  ]
};

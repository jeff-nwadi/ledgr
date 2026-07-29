import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth/auth";

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Legacy /dashboard redirect
  if (pathname.startsWith('/dashboard')) {
    const target = pathname.replace('/dashboard', '/owner');
    return NextResponse.redirect(new URL(target, request.url));
  }

  const isProtectedRoute = 
    pathname.startsWith('/staff') ||  
    pathname.startsWith('/owner');

  const isAuthOrPublicRoute = 
    pathname === '/' || 
    pathname === '/signin' || 
    pathname === '/signup';

  const allCookies = request.cookies.getAll();
  const sessionCookie = 
    request.cookies.get("better-auth.session_token")?.value || 
    request.cookies.get("__Secure-better-auth.session_token")?.value ||
    allCookies.find(c => c.name.includes("session_token"))?.value;

  // 1. Unauthenticated user trying to access a protected route -> redirect to signin
  if (!sessionCookie && isProtectedRoute) {
    const targetRedirect = pathname.startsWith('/staff') ? "/signin?type=pin" : "/signin";
    const res = NextResponse.redirect(new URL(targetRedirect, request.url));
    res.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    return res;
  }

  // 2. If session cookie exists, verify session to prevent authenticated users from visiting auth/landing pages
  if (sessionCookie) {
    try {
      const session = await auth.api.getSession({
        headers: request.headers,
      });

      if (session?.user) {
        // Authenticated user attempting to visit '/', '/signin', or '/signup'
        if (isAuthOrPublicRoute) {
          const userRole = (session.user as any).role || "owner";
          const destination = userRole === "staff" ? "/staff" : "/owner";
          const res = NextResponse.redirect(new URL(destination, request.url));
          res.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
          return res;
        }

        // Authenticated user trying to access wrong role dashboard
        const userRole = (session.user as any).role || "owner";
        if (userRole === "staff" && pathname.startsWith("/owner")) {
          const res = NextResponse.redirect(new URL("/staff", request.url));
          res.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
          return res;
        }
        if (userRole === "owner" && pathname.startsWith("/staff")) {
          const res = NextResponse.redirect(new URL("/owner", request.url));
          res.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
          return res;
        }
      }
    } catch {
      // Fallback if session validation fails
    }
  }

  const response = NextResponse.next();
  if (isAuthOrPublicRoute || isProtectedRoute) {
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  }
  return response;
}

export const config = {
  matcher: [
    '/',
    '/signin',
    '/signup',
    '/dashboard',
    '/dashboard/:path*',
    '/staff',
    '/staff/:path*',
    '/owner',
    '/owner/:path*', 
  ]
};

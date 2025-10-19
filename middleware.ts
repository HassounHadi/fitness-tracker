import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "./lib/jwt";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public routes that don't require authentication
  const publicRoutes = [
    "/api/auth",
    "/api/exercises", // Public exercise library
    "/login",
    "/signup",
    "/onboarding",
  ];

  // Check if the route is public
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));

  // Authentication for protected API routes
  if (pathname.startsWith("/api") && !isPublicRoute) {
    let userId: string | null = null;
    let userEmail: string | null = null;

    // Method 1: Check for Bearer token in Authorization header (for API clients)
    const authHeader = request.headers.get("Authorization");
    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      const decoded = verifyToken(token, process.env.JWT_SECRET!);

      if (decoded && typeof decoded !== 'string') {
        userId = decoded.sub as string;
        userEmail = (decoded as { email?: string }).email || null;
      }
    }

    // Method 2: Check for NextAuth session cookie (for frontend)
    if (!userId) {
      const token = await getToken({
        req: request,
        secret: process.env.NEXTAUTH_SECRET
      });

      if (token?.sub) {
        userId = token.sub;
        userEmail = token.email as string || null;
      }
    }

    // If no valid authentication found, return 401
    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
          message: "Authentication required"
        },
        { status: 401 }
      );
    }

    // Attach user info to request headers for routes to access
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-user-id", userId);
    if (userEmail) {
      requestHeaders.set("x-user-email", userEmail);
    }

    const response = NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });

    // Add security headers
    addSecurityHeaders(response);

    return response;
  }

  // For non-API routes, just add security headers
  const response = NextResponse.next();
  addSecurityHeaders(response);

  return response;
}

function addSecurityHeaders(response: NextResponse) {
  response.headers.set("X-DNS-Prefetch-Control", "on");
  response.headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
  response.headers.set("X-Frame-Options", "SAMEORIGIN");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
}

export const config = {
  matcher: [
    // Match all routes except static files
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "./lib/jwt";

export function middleware(request: NextRequest) {
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

  // JWT Authentication for protected API routes
  if (pathname.startsWith("/api") && !isPublicRoute) {
    const authHeader = request.headers.get("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
          message: "Missing or invalid authorization header"
        },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7); // Remove "Bearer " prefix
    const decoded = verifyToken(token, process.env.JWT_SECRET!);

    if (!decoded || typeof decoded === 'string') {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
          message: "Invalid or expired token"
        },
        { status: 401 }
      );
    }

    // Attach user info to request headers for routes to access
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-user-id", decoded.sub as string);
    requestHeaders.set("x-user-email", (decoded as { email?: string }).email || "");

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

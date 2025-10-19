import { headers } from "next/headers";

/**
 * Get the authenticated user ID from request headers
 * The middleware attaches this after JWT verification
 * @returns The user ID or null if not authenticated
 */
export async function getUserId(): Promise<string | null> {
  const headersList = await headers();
  return headersList.get("x-user-id");
}

/**
 * Get the authenticated user email from request headers
 * The middleware attaches this after JWT verification
 * @returns The user email or null if not authenticated
 */
export async function getUserEmail(): Promise<string | null> {
  const headersList = await headers();
  return headersList.get("x-user-email");
}

/**
 * Get the authenticated user info from request headers
 * The middleware attaches this after JWT verification
 * @returns Object with user ID and email, or null if not authenticated
 */
export async function getUser(): Promise<{ id: string; email: string } | null> {
  const headersList = await headers();
  const id = headersList.get("x-user-id");
  const email = headersList.get("x-user-email");

  if (!id) return null;

  return { id, email: email || "" };
}

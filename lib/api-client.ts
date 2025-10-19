import { toast } from "sonner";
import { getSession } from "next-auth/react";

// Standard API Response Type
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  statusCode?: number;
}

// API Client Options
interface ApiClientOptions extends RequestInit {
  showToast?: boolean; // Control whether to show toast (default: true)
  successMessage?: string; // Custom success message
}

/**
 * Centralized API client with automatic JWT token injection and toast handling
 * Maps HTTP status codes to appropriate toast variants
 */
export async function apiClient<T = unknown>(
  url: string,
  options: ApiClientOptions = {}
): Promise<ApiResponse<T>> {
  const { showToast = true, successMessage, ...fetchOptions } = options;

  try {
    // Get the JWT token from the session
    const session = await getSession();
    const token = (session as { accessToken?: string })?.accessToken;

    const response = await fetch(url, {
      ...fetchOptions,
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }), // Add JWT token if available
        ...fetchOptions.headers,
      },
    });

    const data: ApiResponse<T> = await response.json();

    // Check for rate limit headers
    const rateLimitRemaining = response.headers.get("X-RateLimit-Remaining");
    const rateLimitLimit = response.headers.get("X-RateLimit-Limit");
    const rateLimitReset = response.headers.get("X-RateLimit-Reset");

    // Show warning if approaching rate limit (80% usage)
    if (rateLimitRemaining && rateLimitLimit && showToast) {
      const remaining = parseInt(rateLimitRemaining);
      const limit = parseInt(rateLimitLimit);
      const usagePercent = ((limit - remaining) / limit) * 100;

      if (usagePercent >= 80 && usagePercent < 100) {
        const resetTime = rateLimitReset
          ? new Date(rateLimitReset).toLocaleTimeString()
          : "soon";
        toast.warning(
          `Rate limit warning: ${remaining} of ${limit} requests remaining. Resets at ${resetTime}.`
        );
      }
    }

    // Determine toast variant based on status code
    if (showToast) {
      if (response.ok) {
        // Success (200-299)
        toast.success(successMessage || data.message || "Success");
      } else if (response.status === 429) {
        // Rate limit exceeded (429)
        const retryAfter = response.headers.get("Retry-After");
        const waitTime = retryAfter
          ? `${retryAfter} seconds`
          : rateLimitReset
          ? `until ${new Date(rateLimitReset).toLocaleTimeString()}`
          : "a few moments";
        toast.error(
          data.message || `Rate limit exceeded. Please try again in ${waitTime}.`
        );
      } else if (response.status >= 400 && response.status < 500) {
        // Client errors (400-499)
        toast.error(data.message || "Something went wrong");
      } else if (response.status >= 500) {
        // Server errors (500-599)
        toast.error(data.message || "Server error occurred");
      }
    }

    return {
      success: response.ok,
      message: data.message,
      data: data.data,
      statusCode: response.status,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Network error occurred";
    const errorResponse: ApiResponse<T> = {
      success: false,
      message: errorMessage,
      statusCode: 0,
    };

    if (showToast) {
      toast.error(errorResponse.message);
    }

    return errorResponse;
  }
}

// Convenience methods
export const api = {
  get: <T = unknown>(url: string, options?: ApiClientOptions) =>
    apiClient<T>(url, { ...options, method: "GET" }),

  post: <T = unknown>(url: string, body?: unknown, options?: ApiClientOptions) =>
    apiClient<T>(url, {
      ...options,
      method: "POST",
      body: JSON.stringify(body),
    }),

  put: <T = unknown>(url: string, body?: unknown, options?: ApiClientOptions) =>
    apiClient<T>(url, {
      ...options,
      method: "PUT",
      body: JSON.stringify(body),
    }),

  delete: <T = unknown>(url: string, options?: ApiClientOptions) =>
    apiClient<T>(url, { ...options, method: "DELETE" }),

  patch: <T = unknown>(url: string, body?: unknown, options?: ApiClientOptions) =>
    apiClient<T>(url, {
      ...options,
      method: "PATCH",
      body: JSON.stringify(body),
    }),
};

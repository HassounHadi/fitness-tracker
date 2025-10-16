import { toast } from "sonner";

// Standard API Response Type
export interface ApiResponse<T = any> {
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
 * Centralized API client with automatic toast handling
 * Maps HTTP status codes to appropriate toast variants
 */
export async function apiClient<T = any>(
  url: string,
  options: ApiClientOptions = {}
): Promise<ApiResponse<T>> {
  const { showToast = true, successMessage, ...fetchOptions } = options;

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      headers: {
        "Content-Type": "application/json",
        ...fetchOptions.headers,
      },
    });

    const data: ApiResponse<T> = await response.json();

    // Determine toast variant based on status code
    if (showToast) {
      if (response.ok) {
        // Success (200-299)
        toast.success(successMessage || data.message || "Success");
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
  } catch (error: any) {
    const errorResponse: ApiResponse<T> = {
      success: false,
      message: error.message || "Network error occurred",
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
  get: <T = any>(url: string, options?: ApiClientOptions) =>
    apiClient<T>(url, { ...options, method: "GET" }),

  post: <T = any>(url: string, body?: any, options?: ApiClientOptions) =>
    apiClient<T>(url, {
      ...options,
      method: "POST",
      body: JSON.stringify(body),
    }),

  put: <T = any>(url: string, body?: any, options?: ApiClientOptions) =>
    apiClient<T>(url, {
      ...options,
      method: "PUT",
      body: JSON.stringify(body),
    }),

  delete: <T = any>(url: string, options?: ApiClientOptions) =>
    apiClient<T>(url, { ...options, method: "DELETE" }),

  patch: <T = any>(url: string, body?: any, options?: ApiClientOptions) =>
    apiClient<T>(url, {
      ...options,
      method: "PATCH",
      body: JSON.stringify(body),
    }),
};

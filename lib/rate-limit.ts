/**
 * Simple in-memory rate limiter for API routes
 * Uses Map to store request counts per identifier (user ID, IP, etc.)
 */

interface RateLimitConfig {
  interval: number; // Time window in milliseconds
  uniqueTokenPerInterval: number; // Max requests per interval
}

interface RateLimitStore {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private store: Map<string, RateLimitStore>;
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.store = new Map();
    this.config = config;
  }

  async check(identifier: string): Promise<{ success: boolean; limit: number; remaining: number; reset: number }> {
    const now = Date.now();
    const key = identifier;

    // Get or create entry
    let entry = this.store.get(key);

    // Reset if interval has passed
    if (!entry || now >= entry.resetTime) {
      entry = {
        count: 0,
        resetTime: now + this.config.interval,
      };
    }

    // Check if limit exceeded
    if (entry.count >= this.config.uniqueTokenPerInterval) {
      this.store.set(key, entry);
      return {
        success: false,
        limit: this.config.uniqueTokenPerInterval,
        remaining: 0,
        reset: entry.resetTime,
      };
    }

    // Increment count
    entry.count++;
    this.store.set(key, entry);

    return {
      success: true,
      limit: this.config.uniqueTokenPerInterval,
      remaining: this.config.uniqueTokenPerInterval - entry.count,
      reset: entry.resetTime,
    };
  }

  // Clean up expired entries periodically
  cleanup() {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (now >= entry.resetTime) {
        this.store.delete(key);
      }
    }
  }
}

// Gemini AI rate limiter: 15 requests/minute, 1500 requests/day
export const geminiMinuteLimit = new RateLimiter({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 15,
});

export const geminiDailyLimit = new RateLimiter({
  interval: 24 * 60 * 60 * 1000, // 24 hours
  uniqueTokenPerInterval: 1500,
});

// Nutritionix API rate limiter: 500 requests/day
export const nutritionixDailyLimit = new RateLimiter({
  interval: 24 * 60 * 60 * 1000, // 24 hours
  uniqueTokenPerInterval: 500,
});

// General API rate limiter: 100 requests/minute per user
export const generalApiLimit = new RateLimiter({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 100,
});

// Cleanup expired entries every hour
setInterval(() => {
  geminiMinuteLimit.cleanup();
  geminiDailyLimit.cleanup();
  nutritionixDailyLimit.cleanup();
  generalApiLimit.cleanup();
}, 60 * 60 * 1000);

/**
 * Helper function to check rate limit and return appropriate response
 */
export async function checkRateLimit(
  limiter: RateLimiter,
  identifier: string,
  apiName: string = "API"
): Promise<{ allowed: boolean; response?: Response; headers: Record<string, string> }> {
  const result = await limiter.check(identifier);

  const headers = {
    "X-RateLimit-Limit": result.limit.toString(),
    "X-RateLimit-Remaining": result.remaining.toString(),
    "X-RateLimit-Reset": new Date(result.reset).toISOString(),
  };

  if (!result.success) {
    const resetDate = new Date(result.reset);
    const waitTime = Math.ceil((result.reset - Date.now()) / 1000);

    return {
      allowed: false,
      response: Response.json(
        {
          success: false,
          error: `Rate limit exceeded for ${apiName}`,
          message: `Too many requests. Please try again in ${waitTime} seconds.`,
          retryAfter: waitTime,
          resetAt: resetDate.toISOString(),
        },
        {
          status: 429,
          headers: {
            ...headers,
            "Retry-After": waitTime.toString(),
          },
        }
      ),
      headers,
    };
  }

  return {
    allowed: true,
    headers,
  };
}

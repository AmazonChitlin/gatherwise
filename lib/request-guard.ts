type RateLimitRule = {
  limit: number;
  windowMs: number;
};

type RateLimitBucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, RateLimitBucket>();

export class RequestValidationError extends Error {}

export function getClientIdentifier(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || "unknown";
  }

  return request.headers.get("x-real-ip")?.trim() || "unknown";
}

export function readJsonBody<T>(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";

  if (!contentType.toLowerCase().includes("application/json")) {
    throw new RequestValidationError("Send JSON data to continue.");
  }

  return request.json() as Promise<T>;
}

export function enforceRateLimit(options: {
  key: string;
  rule: RateLimitRule;
  now?: number;
}) {
  const now = options.now ?? Date.now();
  const existing = buckets.get(options.key);

  if (!existing || existing.resetAt <= now) {
    const resetAt = now + options.rule.windowMs;
    buckets.set(options.key, {
      count: 1,
      resetAt
    });

    return {
      allowed: true,
      remaining: options.rule.limit - 1,
      resetAt
    } as const;
  }

  if (existing.count >= options.rule.limit) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: existing.resetAt
    } as const;
  }

  existing.count += 1;

  return {
    allowed: true,
    remaining: options.rule.limit - existing.count,
    resetAt: existing.resetAt
  } as const;
}

export function createRateLimitHeaders(result: {
  remaining: number;
  resetAt: number;
}) {
  return {
    "Cache-Control": "no-store",
    "X-RateLimit-Remaining": String(Math.max(0, result.remaining)),
    "X-RateLimit-Reset": String(Math.ceil(result.resetAt / 1000))
  };
}

export function pruneRateLimitBuckets(now = Date.now()) {
  for (const [key, bucket] of buckets.entries()) {
    if (bucket.resetAt <= now) {
      buckets.delete(key);
    }
  }
}

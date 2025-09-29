import { NextFunction, Request, Response } from 'express';

type Bucket = { tokens: number; lastRefill: number };

const buckets = new Map<string, Bucket>();

// Simple token bucket: capacity tokens, refillRate tokens per second
export function rateLimit({
  keyPrefix = 'rl',
  capacity = 5,
  refillRate = 0.1,
} = {}) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user?.sub || req.ip || 'anon';
      const key = `${keyPrefix}:${userId}`;
      const now = Date.now();
      const bucket = buckets.get(key) || { tokens: capacity, lastRefill: now };
      const elapsed = (now - bucket.lastRefill) / 1000;
      const refill = elapsed * refillRate;
      bucket.tokens = Math.min(capacity, bucket.tokens + refill);
      bucket.lastRefill = now;
      if (bucket.tokens >= 1) {
        bucket.tokens -= 1;
        buckets.set(key, bucket);
        return next();
      }
      buckets.set(key, bucket);
      res.status(429).json({ success: false, message: 'Too many requests' });
    } catch (err) {
      next();
    }
  };
}

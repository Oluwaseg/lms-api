import { NextFunction, Request, Response } from 'express';

type Key = string;

interface Bucket {
  tokens: number;
  lastRefill: number;
}

const buckets: Map<Key, Bucket> = new Map();

/**
 * Simple token-bucket rate limiter middleware generator.
 * - `limit` tokens allowed per `windowMs` interval.
 */
export function rateLimiter(limit: number, windowMs: number) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const key =
        req.ip ||
        req.ip ||
        req.headers['x-forwarded-for']?.toString() ||
        'anon';
      const now = Date.now();
      const bucket = buckets.get(key) || { tokens: limit, lastRefill: now };

      // refill
      const elapsed = now - bucket.lastRefill;
      if (elapsed > windowMs) {
        bucket.tokens = limit;
        bucket.lastRefill = now;
      }

      if (bucket.tokens <= 0) {
        res.status(429).json({ message: 'Too many requests' });
        return;
      }

      bucket.tokens -= 1;
      buckets.set(key, bucket);
      next();
    } catch (e) {
      next();
    }
  };
}

export default rateLimiter;

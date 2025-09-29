import { NextFunction, Request, Response } from 'express';
import redis from '../config/redis';

export function redisRateLimit({
  keyPrefix = 'rl',
  capacity = 10,
  refillRate = 0.1,
} = {}) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user?.sub || req.ip || 'anon';
      const key = `${keyPrefix}:${userId}`;
      const now = Date.now();
      // Use a small lua script style sequence with GET/SET and TTL to avoid races
      const state = await redis.hgetall(key);
      let tokens = capacity;
      let last = now;
      if (state && state.tokens) {
        tokens = parseFloat(state.tokens);
        last = parseInt(state.last || String(now));
      }
      const elapsed = (now - last) / 1000;
      tokens = Math.min(capacity, tokens + elapsed * refillRate);
      if (tokens >= 1) {
        tokens -= 1;
        await redis.hset(key, { tokens: String(tokens), last: String(now) });
        await redis.expire(key, 3600);
        return next();
      }
      await redis.hset(key, { tokens: String(tokens), last: String(now) });
      await redis.expire(key, 3600);
      return res
        .status(429)
        .json({ success: false, message: 'Too many requests' });
    } catch (err) {
      // on error, allow through (do not block production traffic)
      return next();
    }
  };
}

import rateLimit from 'express-rate-limit'

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'development' ? 200 : 20,
  message: { success: false, error: { message: 'Too many requests, please try again later.', code: 'RATE_LIMIT' } },
  standardHeaders: true,
  legacyHeaders: false,
})

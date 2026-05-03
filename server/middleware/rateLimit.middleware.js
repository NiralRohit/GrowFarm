const rateLimit = require('express-rate-limit');

/**
 * Standard rate limiter for auth-related routes
 * Limit: 30 requests per 15 minutes per IP
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // Limit each IP to 30 requests per `window` (here, per 15 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    status: 429,
    message: "Too many authentication attempts, please try again after 15 minutes",
  },
});

module.exports = {
  authLimiter
};

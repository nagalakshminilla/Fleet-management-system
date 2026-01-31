const rateLimit = require('express-rate-limit');

// Apply only on create vehicle route: 3 requests per minute per IP
const vehicleRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 3, // Limit each IP to 3 requests per windowMs
  message: {
    success: false,
    message: 'Too many vehicle creation attempts. Please try again after a minute.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = vehicleRateLimiter;
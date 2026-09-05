const rateLimit = require('express-rate-limit');

// Rate limiter for generation endpoint (e.g. 15 requests per 15 minutes per IP)
const generateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many policy generation requests from this IP. Please try again after 15 minutes.'
  }
});

// General API rate limiter (e.g. 100 requests per 15 minutes)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many API requests. Please slow down.'
  }
});

module.exports = {
  generateLimiter,
  apiLimiter
};

// Global Error Handler Middleware
function errorHandler(err, req, res, next) {
  console.error('Unhandled Server Error:', err.stack || err.message || err);
  
  const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  
  res.status(statusCode).json({
    success: false,
    error: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
}

// 404 Route Handler
function notFoundHandler(req, res, next) {
  res.status(404).json({
    success: false,
    error: `Endpoint not found - ${req.originalUrl}`
  });
}

module.exports = {
  errorHandler,
  notFoundHandler
};

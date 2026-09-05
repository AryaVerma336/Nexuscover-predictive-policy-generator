const express = require('express');
const router = express.Router();
const policyController = require('../controllers/policyController');
const analyticsController = require('../controllers/analyticsController');
const { generateLimiter, apiLimiter } = require('../middleware/rateLimiter');

// Apply general rate limiter to all API endpoints
router.use(apiLimiter);

// Health Check Endpoint
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'NexusCover Backend API',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'development'
  });
});

// Policy Endpoints
router.post('/policies/generate', generateLimiter, policyController.generatePolicy);
router.get('/policies', policyController.getPolicies);
router.get('/policies/:id', policyController.getPolicyById);
router.post('/policies', policyController.savePolicy);
router.delete('/policies/:id', policyController.deletePolicy);

// Analytics Endpoint
router.get('/analytics', analyticsController.getAnalytics);

module.exports = router;

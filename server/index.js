require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const apiRouter = require('./routes/api');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

// Security & Utility Middleware
app.use(helmet({
  contentSecurityPolicy: false // Allows inline scripts & Google Fonts used by index.html
}));
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Mount API Routes
app.use('/api', apiRouter);

// Serve Static Frontend (index.html and root assets)
const rootPath = path.join(__dirname, '..');
app.use(express.static(rootPath));

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  res.sendFile(path.join(rootPath, 'index.html'));
});

// Fallback & Error Handling Middleware
app.use(notFoundHandler);
app.use(errorHandler);

// Start Server
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`\n🚀 NexusCover Backend Server running on http://localhost:${PORT}`);
    console.log(`📊 Health Check: http://localhost:${PORT}/api/health`);
    console.log(`📑 Policy Engine API: http://localhost:${PORT}/api/policies/generate\n`);
  });
}

module.exports = app;

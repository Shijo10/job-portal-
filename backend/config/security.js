/**
 * Production Configuration & Security Middleware
 * Add this to server.js for production-ready setup
 */

// ============================================
// ERROR HANDLING MIDDLEWARE
// ============================================

// Custom error handler
class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
  }
}

// Global error handler middleware (add at end of server.js)
app.use((err, req, res, next) => {
  console.error('Error:', err);

  const status = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  // Prevent sensitive error details in production
  if (process.env.NODE_ENV === 'production') {
    const productionError = {
      status,
      message: status === 500 ? 'Internal Server Error' : message,
      timestamp: new Date().toISOString(),
      path: req.path
    };
    return res.status(status).json(productionError);
  }

  // Detailed errors in development
  res.status(status).json({
    status,
    message,
    error: err,
    timestamp: new Date().toISOString(),
    path: req.path
  });
});

// ============================================
// INPUT VALIDATION MIDDLEWARE
// ============================================

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePassword = (password) => {
  // Min 8 chars, at least 1 uppercase, 1 lowercase, 1 number, 1 special char
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

// ============================================
// RATE LIMITING (Add to package.json)
// ============================================

/*
Install: npm install express-rate-limit

Usage in server.js:
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // 5 attempts
  skipSuccessfulRequests: true
});

app.use('/api/', limiter);
app.use('/api/workers/login', loginLimiter);
app.use('/api/customers/login', loginLimiter);
*/

// ============================================
// HELMET - SECURITY HEADERS (Add to package.json)
// ============================================

/*
Install: npm install helmet

Usage in server.js (after app = express()):
const helmet = require('helmet');
app.use(helmet());
*/

// ============================================
// REQUEST VALIDATION HELPER
// ============================================

const validateRegistration = (data) => {
  const errors = [];

  if (!data.name || data.name.trim().length < 2) {
    errors.push('Name must be at least 2 characters');
  }

  if (!validateEmail(data.email)) {
    errors.push('Invalid email format');
  }

  if (!validatePassword(data.password)) {
    errors.push('Password must contain uppercase, lowercase, number, and special character');
  }

  if (!data.phone || data.phone.length < 10) {
    errors.push('Valid phone number required');
  }

  if (!data.location || data.location.trim().length < 2) {
    errors.push('Location required');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// ============================================
// MONGODB BEST PRACTICES
// ============================================

/*
1. Add indexes to frequently queried fields:
   db.workers.createIndex({ email: 1 });
   db.workers.createIndex({ location: 1 });
   db.jobs.createIndex({ customerId: 1 });
   db.jobs.createIndex({ status: 1 });

2. Enable MongoDB authentication in production

3. Use connection pooling:
   Set maxPoolSize in connection string
   mongodb+srv://user:pass@cluster.mongodb.net/dbname?maxPoolSize=50

4. Regular backups
*/

// ============================================
// API RESPONSE FORMATTER
// ============================================

const formatResponse = (data, message = 'Success', status = 'success') => {
  return {
    status,
    message,
    data,
    timestamp: new Date().toISOString()
  };
};

// ============================================
// LOGGING (Add to package.json)
// ============================================

/*
Install: npm install winston

Usage:
const winston = require('winston');

const logger = winston.createLogger({
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

// Use: logger.info('Message'), logger.error('Error message')
*/

module.exports = {
  ApiError,
  validateEmail,
  validatePassword,
  validateRegistration,
  formatResponse
};

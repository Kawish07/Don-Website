const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const path = require('path');
const fs = require('fs');

const apiRoutes = require('./routes');
const { uploadsDir } = require('./middlewares/upload');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// ensure uploads folder exists (upload middleware also does this)
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);


const app = express();

// security headers
// Configure helmet with a permissive img-src so images served from HTTPS domains (e.g. your real domains)
// are allowed. This prevents CSP from blocking images when frontend and uploads are served from different subdomains.
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'https:'],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'", 'https:'],
      frameAncestors: ["'self'"],
      objectSrc: ["'none'"]
    }
  },
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));


// basic rate limiting: protect against brute-force and abusive clients
const limiter = rateLimit({
  windowMs: Number(process.env.RATE_WINDOW_MS || 60 * 1000), // 1 minute
  max: Number(process.env.RATE_MAX || 120), // limit each IP to 120 requests per window
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);
// Configure CORS: allow permissive access during development, stricter in production
// Configure CORS origins from environment for flexibility.
// Set CORS_ORIGIN to a comma-separated list of allowed origins (no spaces).
// Example: CORS_ORIGIN=https://parnanzonehomes.com,https://admin.parnanzonehomes.com
const rawOrigins = process.env.CORS_ORIGIN || '';
const allowedOrigins = rawOrigins ? rawOrigins.split(',').map(o => o.trim()) : [
  'https://parnanzonehomes.com',
  'https://www.parnanzonehomes.com',
  'https://admin.parnanzonehomes.com'
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, curl)
    if (!origin) return callback(null, true);
    
    // Allow localhost ONLY in development or when explicitly enabled
    const allowLocal = process.env.NODE_ENV !== 'production' || process.env.ALLOW_LOCAL_DEV === 'true';
    if (allowLocal && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(origin)) {
      return callback(null, true);
    }
    
    // Check against whitelist
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    // Log rejection for debugging
    console.warn(`[CORS] Rejected origin: ${origin} | Allowed: ${allowedOrigins.join(', ')}`);
    return callback(new Error('CORS policy: Origin not allowed'), false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
// limit JSON payload size
app.use(express.json({ limit: process.env.JSON_LIMIT || '1mb' }));

// limit urlencoded bodies
app.use(express.urlencoded({ extended: true, limit: process.env.JSON_LIMIT || '1mb' }));

// Simple request logger to help debug CORS/origin issues in production
app.use((req, res, next) => {
  try {
    const origin = req.headers.origin || '-';
    const host = req.headers.host || '-';
    const method = req.method;
    const path = req.originalUrl || req.url;
    console.log(`[req] ${method} ${path} host=${host} origin=${origin}`);
  } catch (e) {
    // noop
  }
  next();
});

// Lightweight health endpoint
app.get('/health', (req, res) => {
  res.json({ ok: true, uptime: process.uptime(), env: process.env.NODE_ENV || 'development' });
});

// Debug: list uploads (only when DEBUG_UPLOADS env var is 'true')
app.get('/debug/uploads', (req, res) => {
  // Keep debug disabled unless explicitly enabled
  if (process.env.DEBUG_UPLOADS !== 'true') return res.status(404).json({ error: 'Not found' });
  try {
    const files = fs.readdirSync(uploadsDir).filter(f => f && f[0] !== '.');
    return res.json({ ok: true, count: files.length, files });
  } catch (e) {
    return res.status(500).json({ error: 'Failed to read uploads', details: e.message });
  }
});

// serve uploaded files
app.use('/uploads', express.static(uploadsDir));

const MONGO = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/realestate';
mongoose.connect(MONGO, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error', err));

// mount API routes (MVC)
app.use('/api', apiRoutes);

// Fallback 404 for unknown API routes to ensure requests hit this app when routed here
app.use('/api', (req, res) => {
  res.status(404).json({ error: 'API route not found' });
});

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => console.log(`Server listening on ${PORT}`));

// Graceful shutdown
const shutdown = () => {
  console.log('Shutting down...');
  server.close(() => {
    mongoose.disconnect().then(() => process.exit(0));
  });
  setTimeout(() => process.exit(1), 10000);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error', err);
  if (res.headersSent) return next(err);
  res.status(500).json({ error: 'Internal server error' });
});

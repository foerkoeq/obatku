import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';

import { logger, morganStream } from '@/core/logger/logger';
import { errorHandler } from '@/shared/middleware/error.middleware';
import { notFoundHandler } from '@/shared/middleware/not-found.middleware';
import { setupRoutes } from './routes';

// Create Express app
export const app = express();

// Trust proxy for rate limiting
app.set('trust proxy', 1);

// CORS configuration
const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    const allowedOrigins = [
      process.env.FRONTEND_URL || process.env.CORS_ORIGIN || 'http://localhost:3000',
      'http://localhost:3000',
      'http://127.0.0.1:3000',
    ];
    
    // In development, be more permissive
    if (process.env.NODE_ENV === 'development') {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        // Log for debugging
        console.warn('[CORS] Blocked origin:', origin);
        callback(null, true); // Allow in dev for debugging
      }
    } else {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  exposedHeaders: ['X-Request-ID', 'X-Rate-Limit-Remaining'],
  preflightContinue: false,
};

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Increased limit for authenticated API usage
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
    code: 'RATE_LIMIT_EXCEEDED',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for health checks and auth endpoints (they have their own limits)
    return req.path === '/health' || req.path.startsWith('/api/v1/auth');
  },
});

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// Apply rate limiting to all requests
app.use(limiter);

// CORS - Apply before other middleware to handle preflight requests
app.use(cors(corsOptions));

// Handle preflight requests explicitly
app.options('*', cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Cookie parser
app.use(cookieParser());

// Compression
app.use(compression());

// Logging middleware
app.use(morgan('combined', { stream: morganStream }));

// Root endpoint
app.get('/', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'ObatKu Backend API',
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/health',
      api: '/api/v1',
      docs: '/api/docs',
    },
  });
});

// Health check endpoint
app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '1.0.0',
  });
});

// Setup API routes
setupRoutes(app);

// 404 handler
app.use(notFoundHandler);

// Global error handler (must be last)
app.use(errorHandler);

logger.info('✅ Express app configured successfully');

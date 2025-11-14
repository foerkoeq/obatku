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
    // Parse CORS_ORIGIN from env (can be comma-separated)
    const corsOriginEnv = process.env.CORS_ORIGIN || process.env.FRONTEND_URL || 'http://localhost:3000';
    const envOrigins = corsOriginEnv.split(',').map(o => o.trim()).filter(Boolean);
    
    // Build allowed origins list
    const allowedOrigins = [
      ...envOrigins,
      'http://localhost:3000',
      'http://127.0.0.1:3000',
    ];
    
    // Remove duplicates
    const uniqueOrigins = [...new Set(allowedOrigins)];
    
    // Log CORS configuration in development
    if (process.env.NODE_ENV === 'development') {
      logger.info('[CORS] Allowed origins:', uniqueOrigins);
      if (origin) {
        logger.info('[CORS] Request origin:', origin);
      }
    }
    
    // In development, be more permissive
    if (process.env.NODE_ENV === 'development') {
      // Allow requests with no origin (like mobile apps, Postman, curl)
      if (!origin) {
        logger.info('[CORS] Allowing request with no origin (development mode)');
        callback(null, true);
        return;
      }
      
      // Check if origin is in allowed list
      if (uniqueOrigins.includes(origin)) {
        logger.info('[CORS] Allowing origin:', origin);
        callback(null, true);
        return;
      }
      
      // In development, log but still allow for debugging
      logger.warn('[CORS] Origin not in allowed list, but allowing in development:', origin);
      callback(null, true);
    } else {
      // Production: strict CORS
      if (!origin) {
        // In production, we might want to reject no-origin requests
        // But some legitimate requests might not have origin
        callback(null, true);
        return;
      }
      
      if (uniqueOrigins.includes(origin)) {
        callback(null, true);
      } else {
        logger.error('[CORS] Blocked origin:', origin);
        callback(new Error(`Not allowed by CORS. Origin: ${origin}`));
      }
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With', 
    'Accept', 
    'Origin',
    'X-Request-ID',
  ],
  exposedHeaders: ['X-Request-ID', 'X-Rate-Limit-Remaining'],
  preflightContinue: false,
  maxAge: 86400, // 24 hours
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

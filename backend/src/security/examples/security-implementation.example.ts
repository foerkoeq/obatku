// ======================================
// SECURITY IMPLEMENTATION EXAMPLE
// ======================================
// Contoh implementasi security hardening dalam aplikasi utama

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';

// Import Security Modules
import {
  SecurityMiddleware,
  SecurityConfigFactory,
  SecurityTester
} from '../index';

// Import Security Utils as individual functions
import {
  logSecurityEvent,
  generateSecureFilename
} from '../utils/security.utils';

// Import Security Config type
import { SecurityConfig, RiskLevel } from '../types/security.types';

// Import existing features
import authRoutes from '../../features/auth/auth.routes';
import userRoutes from '../../features/users/users.routes';
import inventoryRoutes from '../../features/inventory/inventory.routes';

const app = express();

// ======================================
// SECURITY CONFIGURATION
// ======================================

// Determine environment and create appropriate config
const environment = process.env.NODE_ENV as 'development' | 'staging' | 'production' || 'development';
let securityConfig: SecurityConfig;

switch (environment) {
  case 'production':
    securityConfig = SecurityConfigFactory.forProduction();
    break;
  case 'staging':
    securityConfig = SecurityConfigFactory.custom()
      .forEnvironment('staging')
      .withRateLimit(5 * 60 * 1000, 200) // 5 minutes, 200 requests
      .build();
    break;
  default:
    securityConfig = SecurityConfigFactory.forDevelopment();
}

// Initialize security middleware
const securityMiddleware = new SecurityMiddleware(securityConfig);

// ======================================
// BASIC MIDDLEWARE SETUP
// ======================================

// Basic Express setup
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(compression());

// CORS configuration with security
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
  exposedHeaders: ['X-Request-ID', 'X-Security-Level']
}));

// Helmet for additional security (works with our custom headers)
app.use(helmet({
  contentSecurityPolicy: false, // We handle this in SecurityHeaders
  hsts: false, // We handle this in SecurityHeaders
  frameguard: false // We handle this in SecurityHeaders
}));

// ======================================
// SECURITY MIDDLEWARE APPLICATION
// ======================================

// Apply comprehensive security to all routes
app.use(securityMiddleware.applyAll());

// Security event logging
app.use((req, _res, next) => {
  const securityContext = (req as any).securityContext;
  
  // Log high-risk requests
  if (securityContext?.riskLevel === 'high' || securityContext?.riskLevel === 'critical') {
    logSecurityEvent('HIGH_RISK_REQUEST', {
      ip: req.ip,
      path: req.path,
      method: req.method,
      userAgent: req.get('User-Agent'),
      riskLevel: securityContext.riskLevel,
      violations: securityContext.violations.length
    }, RiskLevel.HIGH);
  }
  
  next();
});

// ======================================
// ROUTE-SPECIFIC SECURITY
// ======================================

// Authentication routes with stricter security
app.use('/api/auth', securityMiddleware.applyForAuth());
app.use('/api/auth', authRoutes);

// User management routes with custom validation
app.use('/api/users', securityMiddleware.createCustomMiddleware({
  enableSanitization: true,
  enableRateLimit: true,
  enableSQLPrevention: true,
  customRateLimit: 50, // 50 requests per window
  allowedFields: ['name', 'email', 'phone', 'role', 'status']
}));
app.use('/api/users', userRoutes);

// Inventory routes with API-specific security
app.use('/api/inventory', securityMiddleware.applyForAPI('inventory'));
app.use('/api/inventory', inventoryRoutes);

// File upload routes with upload-specific security
app.use('/api/upload', securityMiddleware.applyForUpload());
app.use('/api/upload', createFileUploadRoutes());

// ======================================
// SECURITY TESTING ENDPOINTS (DEV/STAGING ONLY)
// ======================================

if (environment !== 'production') {
  // Security testing endpoints
  app.post('/api/test/sql', (req, res) => {
    res.json({ message: 'SQL test endpoint', data: req.body });
  });

  app.post('/api/test/xss', (req, res) => {
    res.json({ message: 'XSS test endpoint', data: req.body });
  });

  app.post('/api/test/sanitization', (req, res) => {
    res.json({ message: 'Sanitization test', sanitized: req.body });
  });

  app.get('/api/test/rate-limit', (_req, res) => {
    res.json({ message: 'Rate limit test', timestamp: new Date() });
  });

  app.get('/api/test/headers', (req, res) => {
    res.json({ message: 'Headers test', headers: req.headers });
  });

  // Security test suite endpoint
  app.post('/api/security/test', async (_req, res) => {
    try {
      const tester = new SecurityTester(securityConfig.testing, `http://localhost:${process.env.PORT || 3001}`);
      const results = await tester.runSecurityTestSuite();
      res.json({ success: true, results });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({ error: 'Security test failed', message: errorMessage });
    }
  });
}

// ======================================
// FILE UPLOAD IMPLEMENTATION
// ======================================

function createFileUploadRoutes() {
  const router = express.Router();
  const multer = require('multer');
  
  // Configure multer for temporary storage
  const upload = multer({
    dest: './uploads/temp',
    limits: {
      fileSize: securityConfig.fileUpload.maxFileSize
    }
  });

  // Single file upload
  router.post('/single', upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file provided' });
      }

      // File validation is already done by security middleware
      // Move file to permanent location
      const secureFilename = generateSecureFilename(req.file.originalname);
      const permanentPath = `./uploads/files/${secureFilename}`;
      
      await require('fs').promises.rename(req.file.path, permanentPath);

      return res.json({
        message: 'File uploaded successfully',
        filename: secureFilename,
        originalName: req.file.originalname,
        size: req.file.size
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return res.status(500).json({ error: 'Upload failed', message: errorMessage });
    }
  });

  // Multiple file upload
  router.post('/multiple', upload.array('files', 5), async (req, res) => {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: 'No files provided' });
      }

      const uploadedFiles = [];
      
      for (const file of req.files as Express.Multer.File[]) {
        const secureFilename = generateSecureFilename(file.originalname);
        const permanentPath = `./uploads/files/${secureFilename}`;
        
        await require('fs').promises.rename(file.path, permanentPath);
        
        uploadedFiles.push({
          filename: secureFilename,
          originalName: file.originalname,
          size: file.size
        });
      }

      return res.json({
        message: 'Files uploaded successfully',
        files: uploadedFiles
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return res.status(500).json({ error: 'Upload failed', message: errorMessage });
    }
  });

  return router;
}

// ======================================
// ERROR HANDLING WITH SECURITY
// ======================================

// Security-aware error handler
app.use((error: any, req: express.Request, res: express.Response, _next: express.NextFunction) => {
  const securityContext = (req as any).securityContext;
  
  // Log security-related errors
  if (error.name === 'SecurityError' || error.type === 'security') {
    logSecurityEvent('SECURITY_ERROR', {
      error: error.message,
      ip: req.ip,
      path: req.path,
      requestId: securityContext?.requestId
    }, RiskLevel.HIGH);
  }

  // Don't expose sensitive error details
  const isDevelopment = environment === 'development';
  
  res.status(error.status || 500).json({
    error: 'Internal Server Error',
    message: isDevelopment ? error.message : 'Something went wrong',
    requestId: securityContext?.requestId,
    ...(isDevelopment && { stack: error.stack })
  });
});

// 404 handler with security logging
app.use((req, res) => {
  const securityContext = (req as any).securityContext;
  
  // Log potential scanning attempts
  if (req.path.includes('admin') || req.path.includes('config') || req.path.includes('.env')) {
    logSecurityEvent('SUSPICIOUS_PATH_ACCESS', {
      path: req.path,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    }, RiskLevel.MEDIUM);
  }

  res.status(404).json({
    error: 'Not Found',
    message: 'The requested resource was not found',
    requestId: securityContext?.requestId
  });
});

// ======================================
// STARTUP AND SECURITY INITIALIZATION
// ======================================

async function startServer() {
  const PORT = process.env.PORT || 3001;
  
  try {
    // Create necessary directories
    await require('fs').promises.mkdir('./uploads/files', { recursive: true });
    await require('fs').promises.mkdir('./uploads/temp', { recursive: true });
    await require('fs').promises.mkdir(securityConfig.fileUpload.quarantineFolder, { recursive: true });
    
    // Start the server
    const server = app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🔒 Security hardening enabled (${environment} mode)`);
      console.log(`📊 Security config: ${JSON.stringify(securityMiddleware.getSecurityStats(), null, 2)}`);
    });

    // Run security tests in development
    if (environment === 'development' && process.env.RUN_SECURITY_TESTS === 'true') {
      setTimeout(async () => {
        console.log('🧪 Running security tests...');
        try {
          const tester = new SecurityTester(securityConfig.testing, `http://localhost:${PORT}`);
          await tester.runSecurityTestSuite();
          console.log('✅ Security tests completed');
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          console.error('❌ Security tests failed:', errorMessage);
        }
      }, 5000);
    }

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('🔄 SIGTERM received, shutting down gracefully');
      server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
      });
    });

    return server;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ Failed to start server:', errorMessage);
    process.exit(1);
  }
}

// Export for use in other modules
export { app, securityMiddleware, securityConfig };

// Start server if this file is run directly
if (require.main === module) {
  startServer();
}

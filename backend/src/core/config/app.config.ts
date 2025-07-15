import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../../.env.local') });

interface AppConfig {
  // Application
  app: {
    name: string;
    version: string;
    description: string;
    environment: string;
    port: number;
    host: string;
    prefix: string;
  };

  // Database
  database: {
    url: string;
    testUrl: string;
    timeout: number;
    pool: {
      min: number;
      max: number;
    };
  };

  // JWT
  jwt: {
    secret: string;
    accessExpiresIn: string;
    refreshExpiresIn: string;
    algorithm: string;
  };

  // Security
  security: {
    bcryptRounds: number;
    rateLimitWindow: number;
    rateLimitMax: number;
    passwordMinLength: number;
    passwordMaxLength: number;
  };

  // File Upload
  upload: {
    dir: string;
    maxFileSize: number;
    allowedTypes: string[];
    maxFiles: number;
  };

  // Logging
  logging: {
    level: string;
    dir: string;
    maxFileSize: number;
    maxFiles: number;
  };

  // CORS
  cors: {
    origin: string | string[];
    credentials: boolean;
  };

  // Email (optional)
  email: {
    host: string;
    port: number;
    user: string;
    pass: string;
    from: string;
  };
}

export const config: AppConfig = {
  app: {
    name: process.env.APP_NAME || 'Obatku Backend API',
    version: process.env.APP_VERSION || '1.0.0',
    description: process.env.APP_DESCRIPTION || 'Agricultural Medicine Management System Backend API',
    environment: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT || '3001'),
    host: process.env.HOST || 'localhost',
    prefix: '/api'
  },

  database: {
    url: process.env.DATABASE_URL || 'mysql://obatku_dev:password123@localhost:3306/obatku_dev',
    testUrl: process.env.DATABASE_URL_TEST || 'mysql://obatku_dev:password123@localhost:3306/obatku_test',
    timeout: 60000,
    pool: {
      min: 2,
      max: 10
    }
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    algorithm: 'HS256'
  },

  security: {
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '12'),
    rateLimitWindow: parseInt(process.env.RATE_LIMIT_WINDOW || '15') * 60 * 1000, // Convert to ms
    rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX || '100'),
    passwordMinLength: 6,
    passwordMaxLength: 128
  },

  upload: {
    dir: process.env.UPLOAD_DIR || './src/uploads',
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880'), // 5MB
    allowedTypes: (process.env.ALLOWED_FILE_TYPES || 'jpg,jpeg,png,pdf,doc,docx').split(','),
    maxFiles: 5
  },

  logging: {
    level: process.env.LOG_LEVEL || 'info',
    dir: process.env.LOG_DIR || './logs',
    maxFileSize: 10 * 1024 * 1024, // 10MB
    maxFiles: 5
  },

  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: process.env.CORS_CREDENTIALS === 'true'
  },

  email: {
    host: process.env.SMTP_HOST || 'localhost',
    port: parseInt(process.env.SMTP_PORT || '587'),
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.SMTP_FROM || 'noreply@obatku.local'
  }
};

// Validate required environment variables
const requiredEnvVars = ['JWT_SECRET', 'DATABASE_URL'];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Required environment variable ${envVar} is not set`);
  }
}

export default config;

import winston from 'winston';
import path from 'path';
import { config } from '../config/app.config';

// Define log levels
const logLevels = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3
};

// Define log colors
const logColors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  debug: 'blue'
};

// Add colors to winston
winston.addColors(logColors);

// Create logs directory if it doesn't exist
import fs from 'fs';
const logsDir = path.resolve(config.logging.dir);
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Define console format for development
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let log = `${timestamp} [${level}]: ${message}`;
    
    // Add metadata if exists
    if (Object.keys(meta).length > 0) {
      log += `\n${JSON.stringify(meta, null, 2)}`;
    }
    
    return log;
  })
);

// Create transports
const transports: winston.transport[] = [
  // Console transport
  new winston.transports.Console({
    level: config.logging.level,
    format: config.app.environment === 'development' ? consoleFormat : logFormat
  }),
  
  // File transport for all logs
  new winston.transports.File({
    filename: path.join(logsDir, 'app.log'),
    level: 'info',
    format: logFormat,
    maxsize: config.logging.maxFileSize,
    maxFiles: config.logging.maxFiles,
    tailable: true
  }),
  
  // File transport for errors only
  new winston.transports.File({
    filename: path.join(logsDir, 'error.log'),
    level: 'error',
    format: logFormat,
    maxsize: config.logging.maxFileSize,
    maxFiles: config.logging.maxFiles,
    tailable: true
  })
];

// Create logger instance
export const logger = winston.createLogger({
  levels: logLevels,
  level: config.logging.level,
  format: logFormat,
  transports,
  exitOnError: false
});

// Create stream for Morgan HTTP logging
export const httpLogStream = {
  write: (message: string) => {
    logger.info(message.trim());
  }
};

// Add request context to logger
export const createRequestLogger = (requestId: string) => {
  return logger.child({ requestId });
};

// Log application startup
export const logStartup = () => {
  logger.info('🚀 Application starting up', {
    name: config.app.name,
    version: config.app.version,
    environment: config.app.environment,
    port: config.app.port,
    host: config.app.host
  });
};

// Log application shutdown
export const logShutdown = () => {
  logger.info('🛑 Application shutting down');
};

// Log database connection
export const logDatabaseConnection = (status: 'connected' | 'disconnected', error?: Error) => {
  if (status === 'connected') {
    logger.info('📊 Database connected successfully');
  } else {
    logger.error('❌ Database connection failed', { error: error?.message });
  }
};

// Log request details
export const logRequest = (method: string, url: string, statusCode: number, responseTime: number, userId?: string) => {
  logger.info('📡 HTTP Request', {
    method,
    url,
    statusCode,
    responseTime: `${responseTime}ms`,
    userId
  });
};

// Log error details
export const logError = (error: Error, context?: any) => {
  logger.error('❌ Error occurred', {
    message: error.message,
    stack: error.stack,
    context
  });
};

// Log security events
export const logSecurityEvent = (event: string, details: any) => {
  logger.warn('🔒 Security Event', {
    event,
    details,
    timestamp: new Date().toISOString()
  });
};

export default logger;

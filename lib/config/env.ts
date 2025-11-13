/**
 * Environment Configuration Utility
 * Centralized configuration management for ObatKu Frontend
 */

export interface EnvironmentConfig {
  // App Configuration
  appName: string;
  appVersion: string;
  nodeEnv: string;
  
  // API Configuration
  apiBaseUrl: string;
  apiTimeout: number;
  backendUrl: string;
  backendApiUrl: string;
  
  // Authentication
  jwtStorageKey: string;
  refreshTokenKey: string;
  
  // File Upload
  maxFileSize: number;
  allowedFileTypes: string[];
  uploadEndpoint: string;
  
  // Development Settings
  debugMode: boolean;
  logLevel: string;
  
  // Feature Flags
  enableAnalytics: boolean;
  enableNotifications: boolean;
  enableOfflineMode: boolean;
  
  // External Services
  googleMapsApiKey: string;
  stripePublishableKey: string;
  
  // Performance & Security
  enableHttps: boolean;
  enableCompression: boolean;
}

/**
 * Get environment configuration with fallbacks
 */
export function getEnvironmentConfig(): EnvironmentConfig {
  const config: EnvironmentConfig = {
    // App Configuration
    appName: process.env.NEXT_PUBLIC_APP_NAME || 'ObatKu Frontend',
    appVersion: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
    nodeEnv: process.env.NODE_ENV || 'development',
    
    // API Configuration
    apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001',
    apiTimeout: parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || '10000'),
    backendUrl: process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001',
    backendApiUrl: process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:3001/api',
    
    // Authentication
    jwtStorageKey: process.env.NEXT_PUBLIC_JWT_STORAGE_KEY || 'obatku_token',
    refreshTokenKey: process.env.NEXT_PUBLIC_REFRESH_TOKEN_KEY || 'obatku_refresh_token',
    
    // File Upload
    maxFileSize: parseInt(process.env.NEXT_PUBLIC_MAX_FILE_SIZE || '5242880'),
    allowedFileTypes: (process.env.NEXT_PUBLIC_ALLOWED_FILE_TYPES || 'jpg,jpeg,png,pdf,doc,docx').split(','),
    uploadEndpoint: process.env.NEXT_PUBLIC_UPLOAD_ENDPOINT || 'http://localhost:3001/api/upload',
    
    // Development Settings
    debugMode: process.env.NEXT_PUBLIC_DEBUG_MODE === 'true',
    logLevel: process.env.NEXT_PUBLIC_LOG_LEVEL || 'info',
    
    // Feature Flags
    enableAnalytics: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true',
    enableNotifications: process.env.NEXT_PUBLIC_ENABLE_NOTIFICATIONS === 'true',
    enableOfflineMode: process.env.NEXT_PUBLIC_ENABLE_OFFLINE_MODE === 'true',
    
    // External Services
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    stripePublishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
    
    // Performance & Security
    enableHttps: process.env.NEXT_PUBLIC_ENABLE_HTTPS === 'true',
    enableCompression: process.env.NEXT_PUBLIC_ENABLE_COMPRESSION === 'true',
  };

  return config;
}

/**
 * Check if current environment is development
 */
export function isDevelopment(): boolean {
  return getEnvironmentConfig().nodeEnv === 'development';
}

/**
 * Check if current environment is production
 */
export function isProduction(): boolean {
  return getEnvironmentConfig().nodeEnv === 'production';
}

/**
 * Get API endpoint URL
 * In development, use backendApiUrl directly to avoid proxy issues
 * In production, use backendApiUrl directly
 */
export function getApiUrl(endpoint: string): string {
  const config = getEnvironmentConfig();
  
  // Use backendApiUrl directly (includes /api prefix)
  const baseUrl = config.backendApiUrl.replace(/\/$/, '');
  const cleanEndpoint = endpoint.replace(/^\//, '');
  const fullUrl = `${baseUrl}/${cleanEndpoint}`;
  
  // Debug logging in development
  if (typeof window !== 'undefined' && config.nodeEnv === 'development') {
    console.log('[getApiUrl]', { endpoint, baseUrl, cleanEndpoint, fullUrl });
  }
  
  return fullUrl;
}

/**
 * Get upload URL
 */
export function getUploadUrl(): string {
  return getEnvironmentConfig().uploadEndpoint;
}

/**
 * Validate environment configuration
 */
export function validateEnvironmentConfig(): string[] {
  const config = getEnvironmentConfig();
  const errors: string[] = [];

  if (!config.apiBaseUrl) {
    errors.push('API base URL is required');
  }

  if (!config.backendUrl) {
    errors.push('Backend URL is required');
  }

  if (config.apiTimeout < 1000) {
    errors.push('API timeout must be at least 1000ms');
  }

  if (config.maxFileSize < 1024) {
    errors.push('Max file size must be at least 1KB');
  }

  return errors;
}

// Export default config instance
export const env = getEnvironmentConfig();

// Export validation function
export const validateEnv = validateEnvironmentConfig;

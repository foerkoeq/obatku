/**
 * Environment Validation Utility
 * Validates environment configuration on startup
 */

import { env, validateEnvironmentConfig } from './env';

/**
 * Validate all environment variables
 */
export function validateEnvironment(): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  config: typeof env;
} {
  const errors = validateEnvironmentConfig();
  const warnings: string[] = [];
  const config = env;

  // Check for missing optional configurations
  if (!config.googleMapsApiKey && config.enableAnalytics) {
    warnings.push('Google Maps API key is missing but analytics is enabled');
  }

  if (!config.stripePublishableKey) {
    warnings.push('Stripe publishable key is not configured');
  }

  // Check for development-specific warnings
  if (config.nodeEnv === 'development') {
    if (config.enableHttps) {
      warnings.push('HTTPS is enabled in development mode');
    }
    
    if (config.enableCompression) {
      warnings.push('Compression is enabled in development mode');
    }
  }

  // Check for production-specific warnings
  if (config.nodeEnv === 'production') {
    if (config.debugMode) {
      warnings.push('Debug mode is enabled in production');
    }
    
    if (config.logLevel === 'debug') {
      warnings.push('Debug logging is enabled in production');
    }
    
    if (!config.enableHttps) {
      warnings.push('HTTPS is not enabled in production');
    }
  }

  // Validate API configuration
  if (config.apiTimeout < 5000) {
    warnings.push('API timeout is very low, consider increasing it');
  }

  if (config.maxFileSize > 50 * 1024 * 1024) { // 50MB
    warnings.push('Max file size is very high, consider reducing it');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    config,
  };
}

/**
 * Log environment validation results
 */
export function logEnvironmentValidation(): void {
  const validation = validateEnvironment();
  
  console.group('🔧 Environment Configuration Validation');
  
  if (validation.isValid) {
    console.log('✅ Environment configuration is valid');
  } else {
    console.error('❌ Environment configuration has errors:');
    validation.errors.forEach(error => console.error(`  - ${error}`));
  }
  
  if (validation.warnings.length > 0) {
    console.warn('⚠️  Environment configuration warnings:');
    validation.warnings.forEach(warning => console.warn(`  - ${warning}`));
  }
  
  console.log('📋 Current Configuration:');
  console.log(`  - Environment: ${validation.config.nodeEnv}`);
  console.log(`  - API Base URL: ${validation.config.apiBaseUrl}`);
  console.log(`  - Backend URL: ${validation.config.backendUrl}`);
  console.log(`  - Debug Mode: ${validation.config.debugMode}`);
  console.log(`  - Log Level: ${validation.config.logLevel}`);
  
  console.groupEnd();
  
  // Throw error if configuration is invalid
  if (!validation.isValid) {
    throw new Error(`Environment configuration is invalid: ${validation.errors.join(', ')}`);
  }
}

/**
 * Check if environment is properly configured for specific features
 */
export function isFeatureEnabled(feature: keyof typeof env): boolean {
  switch (feature) {
    case 'enableAnalytics':
      return env.enableAnalytics && !!env.googleMapsApiKey;
    
    case 'enableNotifications':
      return env.enableNotifications;
    
    case 'enableOfflineMode':
      return env.enableOfflineMode;
    
    case 'enableHttps':
      return env.enableHttps;
    
    case 'enableCompression':
      return env.enableCompression;
    
    default:
      return false;
  }
}

/**
 * Get feature configuration summary
 */
export function getFeatureSummary(): Record<string, boolean> {
  return {
    analytics: isFeatureEnabled('enableAnalytics'),
    notifications: isFeatureEnabled('enableNotifications'),
    offlineMode: isFeatureEnabled('enableOfflineMode'),
    https: isFeatureEnabled('enableHttps'),
    compression: isFeatureEnabled('enableCompression'),
  };
}

// Export validation functions
export const validateEnv = validateEnvironment;
export const logEnvValidation = logEnvironmentValidation;
export const isFeatureEnabled = isFeatureEnabled;
export const getFeatureSummary = getFeatureSummary;

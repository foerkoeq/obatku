/**
 * Backend Health Check Utility
 * Utility untuk mengecek koneksi dan kesehatan backend
 */

import { env, getApiUrl } from '../config/env';

export interface HealthCheckResult {
  success: boolean;
  message: string;
  backendUrl: string;
  timestamp: string;
  details?: {
    status?: number;
    responseTime?: number;
    error?: string;
  };
}

/**
 * Check backend health
 */
export async function checkBackendHealth(): Promise<HealthCheckResult> {
  const backendUrl = env.backendApiUrl;
  const healthEndpoint = `${env.backendUrl}/health`;
  const startTime = Date.now();

  try {
    const response = await fetch(healthEndpoint, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Don't use credentials for health check
      credentials: 'omit',
      // Short timeout for health check
      signal: AbortSignal.timeout(5000),
    });

    const responseTime = Date.now() - startTime;

    if (response.ok) {
      const data = await response.json().catch(() => ({}));
      
      return {
        success: true,
        message: 'Backend berjalan dengan baik',
        backendUrl,
        timestamp: new Date().toISOString(),
        details: {
          status: response.status,
          responseTime,
        },
      };
    }

    return {
      success: false,
      message: `Backend merespons dengan status ${response.status}`,
      backendUrl,
      timestamp: new Date().toISOString(),
      details: {
        status: response.status,
        responseTime,
      },
    };
  } catch (error) {
    const responseTime = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    // Determine error type
    let message = 'Tidak dapat terhubung ke backend';
    if (errorMessage.includes('timeout') || errorMessage.includes('AbortError')) {
      message = 'Backend tidak merespons (timeout). Pastikan backend berjalan.';
    } else if (errorMessage.includes('Failed to fetch') || errorMessage.includes('NetworkError')) {
      message = 'Network error: Pastikan backend berjalan di port 3001 dan tidak ada firewall yang memblokir.';
    } else if (errorMessage.includes('CORS')) {
      message = 'CORS error: Periksa konfigurasi CORS_ORIGIN di backend.';
    }

    return {
      success: false,
      message,
      backendUrl,
      timestamp: new Date().toISOString(),
      details: {
        responseTime,
        error: errorMessage,
      },
    };
  }
}

/**
 * Test API endpoint connectivity
 */
export async function testApiEndpoint(endpoint: string): Promise<HealthCheckResult> {
  const fullUrl = getApiUrl(endpoint);
  const startTime = Date.now();

  try {
    const response = await fetch(fullUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'omit',
      signal: AbortSignal.timeout(5000),
    });

    const responseTime = Date.now() - startTime;

    return {
      success: response.ok,
      message: response.ok 
        ? `Endpoint ${endpoint} dapat diakses` 
        : `Endpoint ${endpoint} merespons dengan status ${response.status}`,
      backendUrl: fullUrl,
      timestamp: new Date().toISOString(),
      details: {
        status: response.status,
        responseTime,
      },
    };
  } catch (error) {
    const responseTime = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    return {
      success: false,
      message: `Tidak dapat mengakses endpoint ${endpoint}`,
      backendUrl: fullUrl,
      timestamp: new Date().toISOString(),
      details: {
        responseTime,
        error: errorMessage,
      },
    };
  }
}

/**
 * Comprehensive backend connectivity test
 */
export async function testBackendConnectivity(): Promise<{
  health: HealthCheckResult;
  apiTest: HealthCheckResult;
  summary: {
    allPassed: boolean;
    issues: string[];
  };
}> {
  const health = await checkBackendHealth();
  const apiTest = await testApiEndpoint('/v1/auth/health');

  const issues: string[] = [];
  if (!health.success) {
    issues.push(`Health check gagal: ${health.message}`);
  }
  if (!apiTest.success) {
    issues.push(`API endpoint test gagal: ${apiTest.message}`);
  }

  return {
    health,
    apiTest,
    summary: {
      allPassed: health.success && apiTest.success,
      issues,
    },
  };
}


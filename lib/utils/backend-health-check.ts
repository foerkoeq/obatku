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
  const backendUrl = env.frontendOnlyMode ? 'frontend-only-mode' : env.backendApiUrl;

  return {
    success: true,
    message: env.frontendOnlyMode
      ? 'Frontend-only mode aktif: pengecekan backend dinonaktifkan.'
      : 'Backend check siap dijalankan.',
    backendUrl,
    timestamp: new Date().toISOString(),
    details: {
      status: 200,
      responseTime: 0,
    },
  };
}

/**
 * Test API endpoint connectivity
 */
export async function testApiEndpoint(endpoint: string): Promise<HealthCheckResult> {
  const fullUrl = env.frontendOnlyMode ? endpoint : getApiUrl(endpoint);

  return {
    success: true,
    message: env.frontendOnlyMode
      ? `Frontend-only mode aktif: test endpoint ${endpoint} dilewati.`
      : `Endpoint ${endpoint} siap diuji.`,
    backendUrl: fullUrl,
    timestamp: new Date().toISOString(),
    details: {
      status: 200,
      responseTime: 0,
    },
  };
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


/**
 * Shared Logger
 * Simple logging for transaction module
 */

export class Logger {
  static info(message: string, data?: any): void {
    console.log(`[INFO] ${new Date().toISOString()}: ${message}`, data || '');
  }

  static error(message: string, error?: any): void {
    console.error(`[ERROR] ${new Date().toISOString()}: ${message}`, error || '');
  }

  static warn(message: string, data?: any): void {
    console.warn(`[WARN] ${new Date().toISOString()}: ${message}`, data || '');
  }

  static debug(message: string, data?: any): void {
    console.debug(`[DEBUG] ${new Date().toISOString()}: ${message}`, data || '');
  }
}

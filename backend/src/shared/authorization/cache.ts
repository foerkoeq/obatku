/**
 * Permission Cache
 * 
 * High-performance caching system for permissions and authorization results.
 * This cache improves performance by reducing database queries and permission calculations.
 */

import {
  PermissionCacheEntry,
  CacheOptions,
} from './types';
import {
  CACHE_SETTINGS,
} from './constants';

export class PermissionCache {
  private static instance: PermissionCache;
  private cache: Map<string, CacheEntry> = new Map();
  private cleanupTimer: NodeJS.Timeout | null = null;
  private options: CacheOptions;

  private constructor(options?: CacheOptions) {
    this.options = {
      ttl: CACHE_SETTINGS.PERMISSION_TTL,
      maxSize: CACHE_SETTINGS.MAX_CACHE_SIZE,
      enableInvalidation: true,
      ...options,
    };

    this.startCleanupTimer();
  }

  public static getInstance(options?: CacheOptions): PermissionCache {
    if (!PermissionCache.instance) {
      PermissionCache.instance = new PermissionCache(options);
    }
    return PermissionCache.instance;
  }

  // ================================================
  // CACHE OPERATIONS
  // ================================================

  /**
   * Get a value from cache
   */
  public async get<T>(key: string): Promise<T | null> {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    // Check if expired
    if (this.isExpired(entry)) {
      this.cache.delete(key);
      return null;
    }

    // Update access time for LRU
    entry.lastAccessed = Date.now();
    
    return entry.value as T;
  }

  /**
   * Set a value in cache
   */
  public async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    const expiresAt = Date.now() + (ttl || this.options.ttl!) * 1000;
    
    const entry: CacheEntry = {
      value,
      expiresAt,
      createdAt: Date.now(),
      lastAccessed: Date.now(),
    };

    this.cache.set(key, entry);

    // Check if we need to evict old entries
    await this.enforceMaxSize();
  }

  /**
   * Delete a specific key
   */
  public async delete(key: string): Promise<boolean> {
    return this.cache.delete(key);
  }

  /**
   * Check if a key exists (and is not expired)
   */
  public async has(key: string): Promise<boolean> {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return false;
    }

    if (this.isExpired(entry)) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Clear all cache entries
   */
  public async clear(): Promise<void> {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  public getStats(): CacheStats {
    let expiredCount = 0;
    let totalSize = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (this.isExpired(entry)) {
        expiredCount++;
      }
      totalSize += this.estimateEntrySize(key, entry);
    }

    return {
      totalEntries: this.cache.size,
      expiredEntries: expiredCount,
      maxSize: this.options.maxSize || 0,
      estimatedSize: totalSize,
      hitRate: 0, // TODO: Implement hit rate tracking
    };
  }

  // ================================================
  // PATTERN-BASED OPERATIONS
  // ================================================

  /**
   * Invalidate all keys matching a pattern
   */
  public async invalidatePattern(pattern: string): Promise<number> {
    const regex = this.patternToRegex(pattern);
    const keysToDelete: string[] = [];

    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        keysToDelete.push(key);
      }
    }

    for (const key of keysToDelete) {
      this.cache.delete(key);
    }

    return keysToDelete.length;
  }

  /**
   * Get all keys matching a pattern
   */
  public async getKeysMatching(pattern: string): Promise<string[]> {
    const regex = this.patternToRegex(pattern);
    const matchingKeys: string[] = [];

    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        matchingKeys.push(key);
      }
    }

    return matchingKeys;
  }

  // ================================================
  // SPECIALIZED PERMISSION CACHE METHODS
  // ================================================

  /**
   * Cache user permissions
   */
  public async cacheUserPermissions(
    userId: string,
    role: string,
    permissions: any[],
    ttl?: number
  ): Promise<void> {
    const key = `user_permissions:${userId}:${role}`;
    const entry: PermissionCacheEntry = {
      userId,
      permissions,
      cachedAt: new Date(),
      expiresAt: new Date(Date.now() + (ttl || this.options.ttl!) * 1000),
    };

    await this.set(key, entry, ttl);
  }

  /**
   * Get cached user permissions
   */
  public async getCachedUserPermissions(
    userId: string,
    role: string
  ): Promise<PermissionCacheEntry | null> {
    const key = `user_permissions:${userId}:${role}`;
    return await this.get<PermissionCacheEntry>(key);
  }

  /**
   * Invalidate user permissions cache
   */
  public async invalidateUserPermissions(userId: string): Promise<number> {
    return await this.invalidatePattern(`user_permissions:${userId}:*`);
  }

  /**
   * Invalidate role permissions cache
   */
  public async invalidateRolePermissions(role: string): Promise<number> {
    return await this.invalidatePattern(`*:${role}:*`);
  }

  // ================================================
  // CACHE MAINTENANCE
  // ================================================

  private startCleanupTimer(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }

    // Run cleanup every 5 minutes
    this.cleanupTimer = setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000);
  }

  private cleanup(): void {
    const expiredKeys: string[] = [];

    for (const [key, entry] of this.cache.entries()) {
      if (this.isExpired(entry)) {
        expiredKeys.push(key);
      }
    }

    for (const key of expiredKeys) {
      this.cache.delete(key);
    }

    console.log(`Cache cleanup: removed ${expiredKeys.length} expired entries`);
  }

  private async enforceMaxSize(): Promise<void> {
    if (!this.options.maxSize || this.cache.size <= this.options.maxSize) {
      return;
    }

    // Sort entries by last accessed time (LRU eviction)
    const entries = Array.from(this.cache.entries())
      .sort(([, a], [, b]) => a.lastAccessed - b.lastAccessed);

    const entriesToRemove = this.cache.size - this.options.maxSize;
    
    for (let i = 0; i < entriesToRemove; i++) {
      const [key] = entries[i];
      this.cache.delete(key);
    }
  }

  private isExpired(entry: CacheEntry): boolean {
    return Date.now() > entry.expiresAt;
  }

  private estimateEntrySize(key: string, entry: CacheEntry): number {
    // Rough estimation of memory usage
    const keySize = key.length * 2; // Assuming UTF-16
    const valueSize = JSON.stringify(entry.value).length * 2;
    const metadataSize = 24; // Approximate size of timestamps
    
    return keySize + valueSize + metadataSize;
  }

  private patternToRegex(pattern: string): RegExp {
    // Convert wildcard pattern to regex
    const escaped = pattern
      .replace(/[.+^${}()|[\]\\]/g, '\\$&') // Escape regex special chars
      .replace(/\*/g, '.*'); // Convert * to .*
    
    return new RegExp(`^${escaped}$`);
  }

  // ================================================
  // BULK OPERATIONS
  // ================================================

  /**
   * Set multiple key-value pairs
   */
  public async setMultiple<T>(entries: Array<{ key: string; value: T; ttl?: number }>): Promise<void> {
    for (const { key, value, ttl } of entries) {
      await this.set(key, value, ttl);
    }
  }

  /**
   * Get multiple values
   */
  public async getMultiple<T>(keys: string[]): Promise<Record<string, T | null>> {
    const result: Record<string, T | null> = {};
    
    for (const key of keys) {
      result[key] = await this.get<T>(key);
    }
    
    return result;
  }

  /**
   * Delete multiple keys
   */
  public async deleteMultiple(keys: string[]): Promise<number> {
    let deleted = 0;
    
    for (const key of keys) {
      if (await this.delete(key)) {
        deleted++;
      }
    }
    
    return deleted;
  }

  // ================================================
  // SHUTDOWN
  // ================================================

  /**
   * Gracefully shutdown the cache
   */
  public shutdown(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
    
    this.cache.clear();
  }
}

// ================================================
// HELPER INTERFACES
// ================================================

interface CacheEntry {
  value: any;
  expiresAt: number;
  createdAt: number;
  lastAccessed: number;
}

interface CacheStats {
  totalEntries: number;
  expiredEntries: number;
  maxSize: number;
  estimatedSize: number;
  hitRate: number;
}

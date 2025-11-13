/**
 * Token Storage Utility
 * Secure token storage with localStorage and sessionStorage support
 */

// Storage keys
const STORAGE_KEYS = {
  ACCESS_TOKEN: 'obatku_access_token',
  REFRESH_TOKEN: 'obatku_refresh_token',
  USER_DATA: 'obatku_user_data',
  TOKEN_EXPIRY: 'obatku_token_expiry'
} as const;

// Storage types
export type StorageType = 'localStorage' | 'sessionStorage';

// Token storage interface
export interface TokenData {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

// User data interface
export interface StoredUserData {
  id: string;
  email: string;
  name: string;
  role: string;
  permissions: string[];
  avatar?: string;
}

/**
 * Token Storage Class
 */
class TokenStorage {
  private storageType: StorageType;
  private storage: Storage;

  constructor(storageType: StorageType = 'localStorage') {
    this.storageType = storageType;
    this.storage = this.getStorage();
  }

  /**
   * Get storage instance
   */
  private getStorage(): Storage {
    if (typeof window === 'undefined') {
      // Server-side, return dummy storage
      return {
        getItem: () => null,
        setItem: () => {},
        removeItem: () => {},
        clear: () => {},
        key: () => null,
        length: 0
      } as Storage;
    }

    return this.storageType === 'localStorage' ? window.localStorage : window.sessionStorage;
  }

  /**
   * Set storage type
   */
  setStorageType(type: StorageType): void {
    this.storageType = type;
    this.storage = this.getStorage();
  }

  /**
   * Get current storage type
   */
  getStorageType(): StorageType {
    return this.storageType;
  }

  /**
   * Store access token
   */
  setAccessToken(token: string): void {
    try {
      this.storage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token);
      
      // Also set in cookies for middleware access
      // Cookie expires in 15 minutes (900 seconds)
      if (typeof document !== 'undefined') {
        const isProduction = process.env.NODE_ENV === 'production';
        const secureFlag = isProduction ? '; secure' : '';
        document.cookie = `accessToken=${token}; path=/; max-age=900${secureFlag}; samesite=strict`;
      }
    } catch (error) {
      console.error('Failed to store access token:', error);
    }
  }

  /**
   * Get access token
   */
  getAccessToken(): string | null {
    try {
      return this.storage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    } catch (error) {
      console.error('Failed to retrieve access token:', error);
      return null;
    }
  }

  /**
   * Store refresh token
   */
  setRefreshToken(token: string): void {
    try {
      this.storage.setItem(STORAGE_KEYS.REFRESH_TOKEN, token);
    } catch (error) {
      console.error('Failed to store refresh token:', error);
    }
  }

  /**
   * Get refresh token
   */
  getRefreshToken(): string | null {
    try {
      return this.storage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
    } catch (error) {
      console.error('Failed to retrieve refresh token:', error);
      return null;
    }
  }

  /**
   * Store token expiry
   */
  setTokenExpiry(expiresAt: number): void {
    try {
      this.storage.setItem(STORAGE_KEYS.TOKEN_EXPIRY, expiresAt.toString());
    } catch (error) {
      console.error('Failed to store token expiry:', error);
    }
  }

  /**
   * Get token expiry
   */
  getTokenExpiry(): number | null {
    try {
      const expiry = this.storage.getItem(STORAGE_KEYS.TOKEN_EXPIRY);
      return expiry ? parseInt(expiry, 10) : null;
    } catch (error) {
      console.error('Failed to retrieve token expiry:', error);
      return null;
    }
  }

  /**
   * Store user data
   */
  setUserData(userData: StoredUserData): void {
    try {
      this.storage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
    } catch (error) {
      console.error('Failed to store user data:', error);
    }
  }

  /**
   * Get user data
   */
  getUserData(): StoredUserData | null {
    try {
      const userData = this.storage.getItem(STORAGE_KEYS.USER_DATA);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Failed to retrieve user data:', error);
      return null;
    }
  }

  /**
   * Check if token is expired
   */
  isTokenExpired(): boolean {
    const expiry = this.getTokenExpiry();
    if (!expiry) return true;
    
    return Date.now() >= expiry;
  }

  /**
   * Check if token will expire soon (within 5 minutes)
   */
  isTokenExpiringSoon(minutes: number = 5): boolean {
    const expiry = this.getTokenExpiry();
    if (!expiry) return true;
    
    const fiveMinutesFromNow = Date.now() + (minutes * 60 * 1000);
    return expiry <= fiveMinutesFromNow;
  }

  /**
   * Get time until token expires (in milliseconds)
   */
  getTimeUntilExpiry(): number {
    const expiry = this.getTokenExpiry();
    if (!expiry) return 0;
    
    return Math.max(0, expiry - Date.now());
  }

  /**
   * Clear all tokens and user data
   */
  clearAll(): void {
    try {
      // Clear from storage
      Object.values(STORAGE_KEYS).forEach(key => {
        this.storage.removeItem(key);
      });
      
      // Clear from cookies
      if (typeof document !== 'undefined') {
        const isProduction = process.env.NODE_ENV === 'production';
        const secureFlag = isProduction ? '; secure' : '';
        document.cookie = `accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT${secureFlag}; samesite=strict`;
        document.cookie = `refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT${secureFlag}; samesite=strict`;
      }
    } catch (error) {
      console.error('Failed to clear tokens:', error);
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    const token = this.getAccessToken();
    return !!(token && !this.isTokenExpired());
  }

  /**
   * Get token info
   */
  getTokenInfo(): {
    hasToken: boolean;
    isExpired: boolean;
    expiresIn: number;
    timeUntilExpiry: number;
  } {
    const token = this.getAccessToken();
    const isExpired = this.isTokenExpired();
    const timeUntilExpiry = this.getTimeUntilExpiry();
    
    return {
      hasToken: !!token,
      isExpired,
      expiresIn: timeUntilExpiry,
      timeUntilExpiry
    };
  }
}

// Create instances for different storage types
export const localStorage = new TokenStorage('localStorage');
export const sessionStorage = new TokenStorage('sessionStorage');

// Default export (localStorage)
export default localStorage;

// Export storage keys for external use
export { STORAGE_KEYS };

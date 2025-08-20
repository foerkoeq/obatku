/**
 * JWT Service
 * 
 * Comprehensive JWT token management including:
 * - Access token generation and verification
 * - Refresh token management
 * - Token payload handling
 * - Security features
 */

import jwt, { SignOptions } from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import {
  JWTPayload,
  AuthTokens,
  AuthenticatedUser,
  AuthError,
  AuthErrorCodes,
} from './auth.types';
import { authConfig } from './auth.config';

export class JWTService {
  private refreshTokens = new Set<string>(); // In production, use Redis or database

  // ================================================
  // TOKEN GENERATION
  // ================================================

  /**
   * Generate access token
   */
  generateAccessToken(user: AuthenticatedUser): string {
    const payload = {
      sub: user.id,
      nip: user.nip,
      role: user.role,
      permissions: user.permissions,
      type: 'access' as const,
    };

    const signOptions: SignOptions = {
      expiresIn: authConfig.jwt.accessExpiresIn as jwt.SignOptions['expiresIn'],
      issuer: authConfig.jwt.issuer,
      audience: authConfig.jwt.audience,
      algorithm: 'HS256',
    };

    return jwt.sign(payload, authConfig.jwt.accessSecret, signOptions);
  }

  /**
   * Generate refresh token
   */
  generateRefreshToken(user: AuthenticatedUser): string {
    const payload = {
      sub: user.id,
      nip: user.nip,
      role: user.role,
      permissions: user.permissions,
      type: 'refresh' as const,
    };

    const signOptions: SignOptions = {
      expiresIn: authConfig.jwt.refreshExpiresIn as jwt.SignOptions['expiresIn'],
      issuer: authConfig.jwt.issuer,
      audience: authConfig.jwt.audience,
      algorithm: 'HS256',
      jwtid: uuidv4(), // Unique ID for refresh token
    };

    const refreshToken = jwt.sign(payload, authConfig.jwt.refreshSecret, signOptions);

    // Store refresh token (in production, use Redis with expiration)
    this.refreshTokens.add(refreshToken);

    return refreshToken;
  }

  /**
   * Generate both access and refresh tokens
   */
  generateTokenPair(user: AuthenticatedUser): AuthTokens {
    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);

    // Parse access token to get expiration
    const decoded = jwt.decode(accessToken);
    if (!decoded || typeof decoded === 'string') {
      throw new Error('Failed to decode access token');
    }
    const payload = decoded as JWTPayload;
    const expiresIn = payload.exp - Math.floor(Date.now() / 1000);

    return {
      accessToken,
      refreshToken,
      expiresIn,
      tokenType: 'Bearer',
    };
  }

  // ================================================
  // TOKEN VERIFICATION
  // ================================================

  /**
   * Verify access token
   */
  verifyAccessToken(token: string): JWTPayload {
    try {
      const payload = jwt.verify(token, authConfig.jwt.accessSecret, {
        issuer: authConfig.jwt.issuer,
        audience: authConfig.jwt.audience,
        algorithms: ['HS256'],
      });

      if (typeof payload === 'string' || !payload) {
        throw this.createAuthError(
          AuthErrorCodes.TOKEN_INVALID,
          'Invalid token payload',
          401
        );
      }

      const jwtPayload = payload as JWTPayload;

      if (jwtPayload.type !== 'access') {
        throw this.createAuthError(
          AuthErrorCodes.TOKEN_INVALID,
          'Invalid token type',
          401
        );
      }

      return jwtPayload;
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        if (error.name === 'TokenExpiredError') {
          throw this.createAuthError(
            AuthErrorCodes.TOKEN_EXPIRED,
            'Access token has expired',
            401
          );
        } else {
          throw this.createAuthError(
            AuthErrorCodes.TOKEN_INVALID,
            'Invalid access token',
            401
          );
        }
      }
      throw error;
    }
  }

  /**
   * Verify refresh token
   */
  verifyRefreshToken(token: string): JWTPayload {
    try {
      // Check if refresh token exists in our store
      if (!this.refreshTokens.has(token)) {
        throw this.createAuthError(
          AuthErrorCodes.TOKEN_INVALID,
          'Refresh token not found or has been revoked',
          401
        );
      }

      const payload = jwt.verify(token, authConfig.jwt.refreshSecret, {
        issuer: authConfig.jwt.issuer,
        audience: authConfig.jwt.audience,
        algorithms: ['HS256'],
      });

      if (typeof payload === 'string' || !payload) {
        throw this.createAuthError(
          AuthErrorCodes.TOKEN_INVALID,
          'Invalid token payload',
          401
        );
      }

      const jwtPayload = payload as JWTPayload;

      if (jwtPayload.type !== 'refresh') {
        throw this.createAuthError(
          AuthErrorCodes.TOKEN_INVALID,
          'Invalid token type',
          401
        );
      }

      return jwtPayload;
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        if (error.name === 'TokenExpiredError') {
          // Remove expired token from store
          this.refreshTokens.delete(token);
          throw this.createAuthError(
            AuthErrorCodes.TOKEN_EXPIRED,
            'Refresh token has expired',
            401
          );
        } else {
          throw this.createAuthError(
            AuthErrorCodes.TOKEN_INVALID,
            'Invalid refresh token',
            401
          );
        }
      }
      throw error;
    }
  }

  /**
   * Decode token without verification (for debugging)
   */
  decodeToken(token: string): JWTPayload | null {
    try {
      const decoded = jwt.decode(token);
      if (!decoded || typeof decoded === 'string') {
        return null;
      }
      return decoded as JWTPayload;
    } catch (error) {
      return null;
    }
  }

  // ================================================
  // TOKEN REFRESH
  // ================================================

  /**
   * Refresh access token using refresh token
   */
  refreshAccessToken(refreshToken: string, currentUser: AuthenticatedUser): AuthTokens {
    // Verify refresh token
    const payload = this.verifyRefreshToken(refreshToken);

    // Ensure the refresh token belongs to the current user
    if (payload.sub !== currentUser.id) {
      throw this.createAuthError(
        AuthErrorCodes.TOKEN_INVALID,
        'Refresh token does not belong to current user',
        401
      );
    }

    // Generate new access token
    const newAccessToken = this.generateAccessToken(currentUser);

    // Parse new access token to get expiration
    const decoded = jwt.decode(newAccessToken);
    if (!decoded || typeof decoded === 'string') {
      throw new Error('Failed to decode new access token');
    }
    const newPayload = decoded as JWTPayload;
    const expiresIn = newPayload.exp - Math.floor(Date.now() / 1000);

    return {
      accessToken: newAccessToken,
      refreshToken, // Keep the same refresh token
      expiresIn,
      tokenType: 'Bearer',
    };
  }

  /**
   * Generate new token pair (revokes old refresh token)
   */
  renewTokenPair(refreshToken: string, currentUser: AuthenticatedUser): AuthTokens {
    // Verify and revoke old refresh token
    this.verifyRefreshToken(refreshToken);
    this.revokeRefreshToken(refreshToken);

    // Generate new token pair
    return this.generateTokenPair(currentUser);
  }

  // ================================================
  // TOKEN REVOCATION
  // ================================================

  /**
   * Revoke refresh token
   */
  revokeRefreshToken(token: string): void {
    this.refreshTokens.delete(token);
  }

  /**
   * Revoke all refresh tokens for a user
   */
  revokeAllRefreshTokens(userId: string): void {
    // In production with Redis/database, you'd query by user ID
    // For now, we need to decode each token to check user ID
    const tokensToRevoke: string[] = [];

    for (const token of this.refreshTokens) {
      try {
        const payload = this.decodeToken(token);
        if (payload && payload.sub === userId) {
          tokensToRevoke.push(token);
        }
      } catch (error) {
        // Invalid token, remove it anyway
        tokensToRevoke.push(token);
      }
    }

    tokensToRevoke.forEach(token => this.refreshTokens.delete(token));
  }

  /**
   * Clean up expired refresh tokens
   */
  cleanupExpiredTokens(): void {
    const tokensToRevoke: string[] = [];

    for (const token of this.refreshTokens) {
      try {
        // This will throw if token is expired
        jwt.verify(token, authConfig.jwt.refreshSecret);
      } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
          tokensToRevoke.push(token);
        }
      }
    }

    tokensToRevoke.forEach(token => this.refreshTokens.delete(token));
  }

  // ================================================
  // TOKEN VALIDATION HELPERS
  // ================================================

  /**
   * Check if token is expired without throwing
   */
  isTokenExpired(token: string): boolean {
    try {
      const payload = this.decodeToken(token);
      if (!payload) return true;

      const now = Math.floor(Date.now() / 1000);
      return payload.exp < now;
    } catch (error) {
      return true;
    }
  }

  /**
   * Get token expiration time
   */
  getTokenExpiration(token: string): Date | null {
    try {
      const payload = this.decodeToken(token);
      if (!payload) return null;

      return new Date(payload.exp * 1000);
    } catch (error) {
      return null;
    }
  }

  /**
   * Get time until token expiration in seconds
   */
  getTimeUntilExpiration(token: string): number {
    try {
      const payload = this.decodeToken(token);
      if (!payload) return 0;

      const now = Math.floor(Date.now() / 1000);
      return Math.max(0, payload.exp - now);
    } catch (error) {
      return 0;
    }
  }

  // ================================================
  // UTILITY METHODS
  // ================================================

  /**
   * Extract token from Authorization header
   */
  extractTokenFromHeader(authHeader: string): string | null {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    return authHeader.substring(7); // Remove "Bearer " prefix
  }

  /**
   * Create AuthenticatedUser from JWT payload
   */
  createUserFromPayload(payload: JWTPayload): Partial<AuthenticatedUser> {
    return {
      id: payload.sub,
      nip: payload.nip,
      role: payload.role,
      permissions: payload.permissions,
    };
  }

  /**
   * Validate token format
   */
  isValidTokenFormat(token: string): boolean {
    // JWT tokens have 3 parts separated by dots
    const parts = token.split('.');
    return parts.length === 3 && parts.every(part => part.length > 0);
  }

  /**
   * Get refresh token count (for monitoring)
   */
  getActiveRefreshTokenCount(): number {
    return this.refreshTokens.size;
  }

  /**
   * Create standardized auth error
   */
  private createAuthError(code: AuthErrorCodes, message: string, statusCode: number): AuthError {
    const error = new Error(message) as AuthError;
    error.code = code;
    error.statusCode = statusCode;
    return error;
  }

  // ================================================
  // SECURITY FEATURES
  // ================================================

  /**
   * Generate secure random string for additional security
   */
  generateSecureNonce(): string {
    return uuidv4();
  }

  /**
   * Add fingerprint to token (for additional security)
   */
  generateTokenWithFingerprint(user: AuthenticatedUser, fingerprint: string): AuthTokens {
    // Add fingerprint to user permissions for validation
    const userWithFingerprint = {
      ...user,
      permissions: [...user.permissions, `fingerprint:${fingerprint}`],
    };

    return this.generateTokenPair(userWithFingerprint);
  }

  /**
   * Validate token fingerprint
   */
  validateTokenFingerprint(payload: JWTPayload, expectedFingerprint: string): boolean {
    const fingerprintPermission = payload.permissions.find(p => p.startsWith('fingerprint:'));
    if (!fingerprintPermission) return false;

    const tokenFingerprint = fingerprintPermission.replace('fingerprint:', '');
    return tokenFingerprint === expectedFingerprint;
  }
}

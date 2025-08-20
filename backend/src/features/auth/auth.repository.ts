/**
 * Authentication Repository
 * 
 * Data access layer for authentication operations including:
 * - User authentication queries
 * - Session management
 * - Password operations
 * - Audit logging
 */

import { PrismaClient, User, UserRole, UserStatus } from '@prisma/client';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import {
  AuthenticatedUser,
  UserSession,
  AuthAttempt,
  SecurityEvent,
  NipValidation,
} from './auth.types';
import { authConfig, generateDefaultPassword } from './auth.config';

export class AuthRepository {
  constructor(private prisma: PrismaClient) {}

  // ================================================
  // USER AUTHENTICATION QUERIES
  // ================================================

  /**
   * Find user by NIP for authentication
   */
  async findUserByNip(nip: string): Promise<User | null> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { nip },
        select: {
          id: true,
          name: true,
          email: true,
          nip: true,
          phone: true,
          passwordHash: true,
          role: true,
          status: true,
          birthDate: true,
          avatarUrl: true,
          lastLogin: true,
          createdAt: true,
          updatedAt: true,
          createdBy: true,
        },
      });

      return user;
    } catch (error) {
      console.error('Error finding user by NIP:', error);
      throw new Error('Database error while finding user');
    }
  }

  /**
   * Find user by ID for token validation
   */
  async findUserById(id: string): Promise<User | null> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          name: true,
          email: true,
          nip: true,
          phone: true,
          passwordHash: true,
          role: true,
          status: true,
          birthDate: true,
          avatarUrl: true,
          lastLogin: true,
          createdAt: true,
          updatedAt: true,
          createdBy: true,
        },
      });

      return user;
    } catch (error) {
      console.error('Error finding user by ID:', error);
      throw new Error('Database error while finding user');
    }
  }

  /**
   * Verify user password
   */
  async verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    try {
      return await bcrypt.compare(plainPassword, hashedPassword);
    } catch (error) {
      console.error('Error verifying password:', error);
      return false;
    }
  }

  /**
   * Update user last login timestamp
   */
  async updateLastLogin(userId: string): Promise<void> {
    try {
      await this.prisma.user.update({
        where: { id: userId },
        data: { lastLogin: new Date() },
      });
    } catch (error) {
      console.error('Error updating last login:', error);
      throw new Error('Database error while updating last login');
    }
  }

  // ================================================
  // PASSWORD MANAGEMENT
  // ================================================

  /**
   * Hash password using bcrypt
   */
  async hashPassword(plainPassword: string): Promise<string> {
    try {
      return await bcrypt.hash(plainPassword, authConfig.password.saltRounds);
    } catch (error) {
      console.error('Error hashing password:', error);
      throw new Error('Error while hashing password');
    }
  }

  /**
   * Reset user password to default (birth date)
   */
  async resetPasswordToDefault(targetNip: string): Promise<string> {
    try {
      // Get user's birth date
      const user = await this.prisma.user.findUnique({
        where: { nip: targetNip },
        select: { id: true, birthDate: true },
      });

      if (!user) {
        throw new Error('User not found');
      }

      // Generate default password from birth date
      const defaultPassword = generateDefaultPassword(user.birthDate);
      const hashedPassword = await this.hashPassword(defaultPassword);

      // Update user password
      await this.prisma.user.update({
        where: { id: user.id },
        data: { passwordHash: hashedPassword },
      });

      return defaultPassword;
    } catch (error) {
      console.error('Error resetting password:', error);
      throw new Error('Database error while resetting password');
    }
  }

  /**
   * Change user password
   */
  async changePassword(userId: string, newPassword: string): Promise<void> {
    try {
      const hashedPassword = await this.hashPassword(newPassword);
      
      await this.prisma.user.update({
        where: { id: userId },
        data: { passwordHash: hashedPassword },
      });
    } catch (error) {
      console.error('Error changing password:', error);
      throw new Error('Database error while changing password');
    }
  }

  /**
   * Check if password is default password
   */
  async isDefaultPassword(userId: string, password: string): Promise<boolean> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { birthDate: true },
      });

      if (!user) {
        return false;
      }

      const defaultPassword = generateDefaultPassword(user.birthDate);
      return password === defaultPassword;
    } catch (error) {
      console.error('Error checking default password:', error);
      return false;
    }
  }

  // ================================================
  // SESSION MANAGEMENT
  // ================================================

  /**
   * Create user session (in-memory or database-backed)
   * For now, we'll use a simple in-memory approach
   * In production, consider using Redis or database storage
   */
  private sessions = new Map<string, UserSession>();

  /**
   * Create new session
   */
  createSession(
    userId: string,
    nip: string,
    role: UserRole,
    permissions: string[],
    ipAddress: string,
    userAgent: string
  ): string {
    const sessionId = uuidv4();
    const session: UserSession = {
      userId,
      sessionId,
      nip,
      role,
      permissions,
      loginTime: new Date(),
      lastActivity: new Date(),
      ipAddress,
      userAgent,
      isActive: true,
    };

    this.sessions.set(sessionId, session);
    return sessionId;
  }

  /**
   * Get session by ID
   */
  getSession(sessionId: string): UserSession | null {
    const session = this.sessions.get(sessionId);
    return session && session.isActive ? session : null;
  }

  /**
   * Update session activity
   */
  updateSessionActivity(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (session && session.isActive) {
      session.lastActivity = new Date();
      this.sessions.set(sessionId, session);
    }
  }

  /**
   * Invalidate session
   */
  invalidateSession(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.isActive = false;
      this.sessions.set(sessionId, session);
    }
  }

  /**
   * Invalidate all sessions for a user
   */
  invalidateAllUserSessions(userId: string): void {
    for (const [sessionId, session] of this.sessions.entries()) {
      if (session.userId === userId) {
        session.isActive = false;
        this.sessions.set(sessionId, session);
      }
    }
  }

  /**
   * Clean up expired sessions
   */
  cleanupExpiredSessions(): void {
    const now = new Date();
    const sessionTimeout = authConfig.security.sessionTimeout * 60 * 1000; // Convert to milliseconds

    for (const [sessionId, session] of this.sessions.entries()) {
      const lastActivity = new Date(session.lastActivity);
      if (now.getTime() - lastActivity.getTime() > sessionTimeout) {
        session.isActive = false;
        this.sessions.set(sessionId, session);
      }
    }
  }

  // ================================================
  // VALIDATION HELPERS
  // ================================================

  /**
   * Check if NIP is unique
   */
  async validateNipUniqueness(nip: string, excludeUserId?: string): Promise<NipValidation> {
    try {
      const existingUser = await this.prisma.user.findUnique({
        where: { nip },
        select: { id: true },
      });

      const isUnique = !existingUser || (excludeUserId ? existingUser.id === excludeUserId : false);

      return {
        isValid: isUnique,
        errors: isUnique ? [] : ['NIP sudah digunakan oleh user lain'],
        isUnique,
      };
    } catch (error) {
      console.error('Error validating NIP uniqueness:', error);
      return {
        isValid: false,
        errors: ['Error validating NIP'],
        isUnique: false,
      };
    }
  }

  /**
   * Check if email is unique
   */
  async validateEmailUniqueness(email: string, excludeUserId?: string): Promise<boolean> {
    try {
      if (!email) return true; // Email is optional

      const existingUser = await this.prisma.user.findUnique({
        where: { email },
        select: { id: true },
      });

      return !existingUser || (excludeUserId ? existingUser.id === excludeUserId : false);
    } catch (error) {
      console.error('Error validating email uniqueness:', error);
      return false;
    }
  }

  // ================================================
  // AUDIT & SECURITY
  // ================================================

  /**
   * Log authentication attempt
   */
  async logAuthAttempt(attempt: Omit<AuthAttempt, 'id'>): Promise<void> {
    if (!authConfig.security.enableAuditLog) return;

    try {
      // In a real implementation, you might store this in a separate audit table
      // For now, we'll just log to console
      console.log('Auth Attempt:', {
        ...attempt,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error logging auth attempt:', error);
    }
  }

  /**
   * Log security event
   */
  async logSecurityEvent(event: SecurityEvent): Promise<void> {
    if (!authConfig.security.enableAuditLog) return;

    try {
      // In a real implementation, you might store this in a separate security_events table
      console.log('Security Event:', {
        ...event,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error logging security event:', error);
    }
  }

  /**
   * Get failed login attempts for a NIP within a time window
   */
  async getFailedLoginAttempts(_nip: string, _windowMs: number = authConfig.security.maxLoginAttempts): Promise<number> {
    // In a real implementation, this would query a database table
    // For now, return a placeholder
    return 0;
  }

  /**
   * Check if account is locked due to failed attempts
   */
  async isAccountLocked(nip: string): Promise<boolean> {
    const failedAttempts = await this.getFailedLoginAttempts(nip);
    return failedAttempts >= authConfig.security.maxLoginAttempts;
  }

  // ================================================
  // USER CREATION (FOR ADMIN)
  // ================================================

  /**
   * Create new user with default password
   */
  async createUser(userData: {
    name: string;
    email?: string;
    nip: string;
    phone: string;
    role: UserRole;
    birthDate: Date;
    createdBy: string;
  }): Promise<{ user: User; defaultPassword: string }> {
    try {
      // Generate default password from birth date
      const defaultPassword = generateDefaultPassword(userData.birthDate);
      const hashedPassword = await this.hashPassword(defaultPassword);

      const user = await this.prisma.user.create({
        data: {
          name: userData.name,
          email: userData.email || null,
          nip: userData.nip,
          phone: userData.phone,
          passwordHash: hashedPassword,
          role: userData.role,
          status: UserStatus.ACTIVE,
          birthDate: userData.birthDate,
          createdBy: userData.createdBy,
        },
      });

      return { user, defaultPassword };
    } catch (error) {
      console.error('Error creating user:', error);
      throw new Error('Database error while creating user');
    }
  }

  // ================================================
  // UTILITY METHODS
  // ================================================

  /**
   * Convert User model to AuthenticatedUser
   */
  toAuthenticatedUser(user: User, permissions: string[]): AuthenticatedUser {
    return {
      id: user.id,
      name: user.name,
      nip: user.nip,
      email: user.email || undefined,
      phone: user.phone,
      role: user.role,
      status: user.status,
      avatarUrl: user.avatarUrl || undefined,
      lastLogin: user.lastLogin || undefined,
      permissions,
    };
  }

  /**
   * Health check - test database connection
   */
  async healthCheck(): Promise<boolean> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      console.error('Database health check failed:', error);
      return false;
    }
  }
}

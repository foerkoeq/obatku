/**
 * Shared Types
 * Common type definitions
 */

import { Request } from 'express';
import { AuthenticatedUser } from '../features/auth/auth.types';

export interface AuthRequest extends Request {
  user?: AuthenticatedUser;
  userId?: string;
}

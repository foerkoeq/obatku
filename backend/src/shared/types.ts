/**
 * Shared Types
 * Common type definitions
 */

import { Request } from 'express';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    name: string;
  };
  userId?: string;
}

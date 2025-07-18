/**
 * User Management Module - Validation Schemas
 * 
 * Zod validation schemas for user-related operations
 * Validates according to business rules and database constraints
 */

import { z } from 'zod';

// Helper regex patterns
const NIP_REGEX = /^[0-9]{18}$/;        // 18 digit NIP
const PHONE_REGEX = /^(\+62|62|0)[0-9]{9,13}$/;  // Indonesian phone format
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;       // YYYY-MM-DD format

// Password validation - should be DDMMYYYY format for birth date
const BIRTH_DATE_PASSWORD_REGEX = /^[0-3][0-9][0-1][0-9]\d{4}$/;

// User role enum validation
const userRoleSchema = z.enum(['admin', 'ppl', 'dinas', 'popt']);

// User status enum validation  
const userStatusSchema = z.enum(['active', 'inactive']);

// Create user validation schema
export const createUserSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(255, 'Name cannot exceed 255 characters')
    .regex(/^[a-zA-Z\s.'-]+$/, 'Name can only contain letters, spaces, dots, apostrophes, and hyphens'),
  
  email: z.string()
    .email('Invalid email format')
    .max(255, 'Email cannot exceed 255 characters')
    .optional(),
  
  nip: z.string()
    .regex(NIP_REGEX, 'NIP must be exactly 18 digits')
    .length(18, 'NIP must be exactly 18 digits'),
  
  phone: z.string()
    .regex(PHONE_REGEX, 'Invalid Indonesian phone number format')
    .max(20, 'Phone number cannot exceed 20 characters'),
  
  role: userRoleSchema,
  
  birth_date: z.string()
    .regex(DATE_REGEX, 'Birth date must be in YYYY-MM-DD format')
    .refine((dateStr) => {
      const date = new Date(dateStr);
      const today = new Date();
      const minAge = new Date(today.getFullYear() - 65, today.getMonth(), today.getDate());
      const maxAge = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
      
      return date >= minAge && date <= maxAge;
    }, 'Age must be between 18 and 65 years'),
  
  avatar_url: z.string()
    .url('Invalid URL format')
    .max(255, 'Avatar URL cannot exceed 255 characters')
    .optional()
});

// Update user validation schema
export const updateUserSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(255, 'Name cannot exceed 255 characters')
    .regex(/^[a-zA-Z\s.'-]+$/, 'Name can only contain letters, spaces, dots, apostrophes, and hyphens')
    .optional(),
  
  email: z.string()
    .email('Invalid email format')
    .max(255, 'Email cannot exceed 255 characters')
    .optional(),
  
  phone: z.string()
    .regex(PHONE_REGEX, 'Invalid Indonesian phone number format')
    .max(20, 'Phone number cannot exceed 20 characters')
    .optional(),
  
  role: userRoleSchema.optional(),
  
  status: userStatusSchema.optional(),
  
  birth_date: z.string()
    .regex(DATE_REGEX, 'Birth date must be in YYYY-MM-DD format')
    .refine((dateStr) => {
      const date = new Date(dateStr);
      const today = new Date();
      const minAge = new Date(today.getFullYear() - 65, today.getMonth(), today.getDate());
      const maxAge = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
      
      return date >= minAge && date <= maxAge;
    }, 'Age must be between 18 and 65 years')
    .optional(),
  
  avatar_url: z.string()
    .url('Invalid URL format')
    .max(255, 'Avatar URL cannot exceed 255 characters')
    .optional()
});

// User query validation schema
export const userQuerySchema = z.object({
  page: z.coerce.number()
    .min(1, 'Page must be at least 1')
    .max(1000, 'Page cannot exceed 1000')
    .optional()
    .default(1),
  
  limit: z.coerce.number()
    .min(1, 'Limit must be at least 1')
    .max(100, 'Limit cannot exceed 100')
    .optional()
    .default(20),
  
  search: z.string()
    .min(1, 'Search term must be at least 1 character')
    .max(255, 'Search term cannot exceed 255 characters')
    .optional(),
  
  role: userRoleSchema.optional(),
  
  status: userStatusSchema.optional(),
  
  sortBy: z.enum(['name', 'nip', 'role', 'created_at', 'last_login'])
    .optional()
    .default('created_at'),
  
  sortOrder: z.enum(['asc', 'desc'])
    .optional()
    .default('desc')
});

// Password reset validation schema
export const passwordResetSchema = z.object({
  new_password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(255, 'Password cannot exceed 255 characters')
    .optional(),
  
  reset_to_birth_date: z.boolean()
    .optional()
    .default(false)
}).refine((data) => {
  // Either new_password or reset_to_birth_date must be provided
  return data.new_password || data.reset_to_birth_date;
}, {
  message: 'Either new_password or reset_to_birth_date must be provided'
});

// Change role validation schema
export const changeRoleSchema = z.object({
  role: userRoleSchema
});

// User ID parameter validation
export const userIdSchema = z.object({
  id: z.string()
    .uuid('Invalid user ID format')
});

// NIP validation schema (for checking uniqueness)
export const nipSchema = z.object({
  nip: z.string()
    .regex(NIP_REGEX, 'NIP must be exactly 18 digits')
    .length(18, 'NIP must be exactly 18 digits')
});

// Birth date password validation
export const birthDatePasswordSchema = z.string()
  .regex(BIRTH_DATE_PASSWORD_REGEX, 'Password must be in DDMMYYYY format');

// Bulk user creation schema
export const bulkCreateUserSchema = z.object({
  users: z.array(createUserSchema)
    .min(1, 'At least one user must be provided')
    .max(50, 'Cannot create more than 50 users at once')
});

// User statistics query schema
export const userStatsQuerySchema = z.object({
  period: z.enum(['7d', '30d', '90d', '1y'])
    .optional()
    .default('30d'),
  
  role: userRoleSchema.optional()
});

// Export all validation schemas
export const userValidationSchemas = {
  create: createUserSchema,
  update: updateUserSchema,
  query: userQuerySchema,
  passwordReset: passwordResetSchema,
  changeRole: changeRoleSchema,
  userId: userIdSchema,
  nip: nipSchema,
  bulkCreate: bulkCreateUserSchema,
  statsQuery: userStatsQuerySchema
};

// Type inference for validated data
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type UserQueryInput = z.infer<typeof userQuerySchema>;
export type PasswordResetInput = z.infer<typeof passwordResetSchema>;
export type ChangeRoleInput = z.infer<typeof changeRoleSchema>;
export type UserIdInput = z.infer<typeof userIdSchema>;
export type NipInput = z.infer<typeof nipSchema>;
export type BulkCreateUserInput = z.infer<typeof bulkCreateUserSchema>;
export type UserStatsQueryInput = z.infer<typeof userStatsQuerySchema>;

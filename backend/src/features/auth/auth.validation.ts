/**
 * Authentication Validation Schemas
 * 
 * Zod validation schemas for authentication endpoints including:
 * - Login validation
 * - Password validation
 * - Token validation
 * - User registration validation
 */

import { z } from 'zod';
import { UserRole } from '@prisma/client';
import { authConfig, AUTH_CONSTANTS } from './auth.config';

// ================================================
// LOGIN VALIDATION
// ================================================

export const loginSchema = z.object({
  body: z.object({
    nip: z
      .string({
        required_error: 'NIP wajib diisi',
        invalid_type_error: 'NIP harus berupa teks',
      })
      .min(1, 'NIP tidak boleh kosong')
      .max(50, 'NIP maksimal 50 karakter')
      .regex(/^[0-9]+$/, 'NIP hanya boleh berisi angka')
      .trim(),
    
    password: z
      .string({
        required_error: 'Password wajib diisi',
        invalid_type_error: 'Password harus berupa teks',
      })
      .min(1, 'Password tidak boleh kosong')
      .max(authConfig.password.maxLength, `Password maksimal ${authConfig.password.maxLength} karakter`),
    
    rememberMe: z
      .boolean()
      .optional()
      .default(false),
  }),
});

// ================================================
// PASSWORD VALIDATION
// ================================================

export const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z
      .string({
        required_error: 'Password lama wajib diisi',
      })
      .min(1, 'Password lama tidak boleh kosong'),
    
    newPassword: z
      .string({
        required_error: 'Password baru wajib diisi',
      })
      .min(authConfig.password.minLength, `Password minimal ${authConfig.password.minLength} karakter`)
      .max(authConfig.password.maxLength, `Password maksimal ${authConfig.password.maxLength} karakter`)
      .refine((password) => {
        // Check password strength
        const hasUppercase = AUTH_CONSTANTS.PASSWORD_PATTERNS.UPPERCASE.test(password);
        const hasLowercase = AUTH_CONSTANTS.PASSWORD_PATTERNS.LOWERCASE.test(password);
        const hasNumbers = AUTH_CONSTANTS.PASSWORD_PATTERNS.NUMBERS.test(password);
        const hasSpecialChars = AUTH_CONSTANTS.PASSWORD_PATTERNS.SPECIAL_CHARS.test(password);
        
        // For development, we're more lenient
        // At least 2 out of 4 character types
        const typeCount = [hasUppercase, hasLowercase, hasNumbers, hasSpecialChars].filter(Boolean).length;
        return typeCount >= 2;
      }, {
        message: 'Password harus mengandung minimal 2 dari: huruf besar, huruf kecil, angka, atau karakter khusus',
      }),
    
    confirmPassword: z
      .string({
        required_error: 'Konfirmasi password wajib diisi',
      }),
  }).refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Konfirmasi password tidak cocok',
    path: ['confirmPassword'],
  }),
});

export const resetPasswordSchema = z.object({
  body: z.object({
    targetNip: z
      .string({
        required_error: 'NIP target wajib diisi',
      })
      .min(1, 'NIP target tidak boleh kosong')
      .max(50, 'NIP maksimal 50 karakter')
      .regex(/^[0-9]+$/, 'NIP hanya boleh berisi angka')
      .trim(),
    
    adminPassword: z
      .string({
        required_error: 'Password admin wajib diisi',
      })
      .min(1, 'Password admin tidak boleh kosong'),
  }),
});

// ================================================
// TOKEN VALIDATION
// ================================================

export const refreshTokenSchema = z.object({
  body: z.object({
    refreshToken: z
      .string({
        required_error: 'Refresh token wajib diisi',
      })
      .min(1, 'Refresh token tidak boleh kosong'),
  }),
});

export const logoutSchema = z.object({
  body: z.object({
    sessionId: z
      .string()
      .optional(),
    
    logoutAll: z
      .boolean()
      .optional()
      .default(false),
  }),
});

// ================================================
// USER REGISTRATION VALIDATION (FOR ADMIN USE)
// ================================================

export const createUserSchema = z.object({
  body: z.object({
    name: z
      .string({
        required_error: 'Nama wajib diisi',
      })
      .min(2, 'Nama minimal 2 karakter')
      .max(255, 'Nama maksimal 255 karakter')
      .trim(),
    
    email: z
      .string()
      .email('Format email tidak valid')
      .max(255, 'Email maksimal 255 karakter')
      .optional()
      .or(z.literal('')),
    
    nip: z
      .string({
        required_error: 'NIP wajib diisi',
      })
      .min(1, 'NIP tidak boleh kosong')
      .max(50, 'NIP maksimal 50 karakter')
      .regex(/^[0-9]+$/, 'NIP hanya boleh berisi angka')
      .trim(),
    
    phone: z
      .string({
        required_error: 'Nomor telepon wajib diisi',
      })
      .min(10, 'Nomor telepon minimal 10 karakter')
      .max(20, 'Nomor telepon maksimal 20 karakter')
      .regex(/^[0-9+\-\s()]+$/, 'Format nomor telepon tidak valid')
      .trim(),
    
    role: z
      .nativeEnum(UserRole, {
        required_error: 'Role wajib dipilih',
        invalid_type_error: 'Role tidak valid',
      }),
    
    birthDate: z
      .string({
        required_error: 'Tanggal lahir wajib diisi',
      })
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal harus YYYY-MM-DD')
      .refine((date) => {
        const parsedDate = new Date(date);
        const now = new Date();
        const minDate = new Date(now.getFullYear() - 80, 0, 1); // 80 years ago
        const maxDate = new Date(now.getFullYear() - 17, 0, 1); // 17 years ago
        
        return parsedDate >= minDate && parsedDate <= maxDate;
      }, {
        message: 'Tanggal lahir harus antara 17-80 tahun yang lalu',
      }),
  }),
});

// ================================================
// QUERY PARAMETER VALIDATION
// ================================================

export const userListQuerySchema = z.object({
  query: z.object({
    page: z
      .string()
      .regex(/^\d+$/, 'Page harus berupa angka')
      .transform(Number)
      .refine(val => val > 0, 'Page harus lebih dari 0')
      .optional()
      .default('1'),
    
    limit: z
      .string()
      .regex(/^\d+$/, 'Limit harus berupa angka')
      .transform(Number)
      .refine(val => val > 0 && val <= 100, 'Limit harus antara 1-100')
      .optional()
      .default('20'),
    
    role: z
      .nativeEnum(UserRole)
      .optional(),
    
    status: z
      .enum(['ACTIVE', 'INACTIVE'])
      .optional(),
    
    search: z
      .string()
      .max(255, 'Search maksimal 255 karakter')
      .optional(),
  }),
});

// ================================================
// CUSTOM VALIDATION FUNCTIONS
// ================================================

/**
 * Validate password strength
 */
export const validatePasswordStrength = (password: string) => {
  const errors: string[] = [];
  let strength: 'weak' | 'medium' | 'strong' = 'weak';
  
  // Length check
  if (password.length < authConfig.password.minLength) {
    errors.push(`Password minimal ${authConfig.password.minLength} karakter`);
  }
  
  if (password.length > authConfig.password.maxLength) {
    errors.push(`Password maksimal ${authConfig.password.maxLength} karakter`);
  }
  
  // Character type checks
  const hasUppercase = AUTH_CONSTANTS.PASSWORD_PATTERNS.UPPERCASE.test(password);
  const hasLowercase = AUTH_CONSTANTS.PASSWORD_PATTERNS.LOWERCASE.test(password);
  const hasNumbers = AUTH_CONSTANTS.PASSWORD_PATTERNS.NUMBERS.test(password);
  const hasSpecialChars = AUTH_CONSTANTS.PASSWORD_PATTERNS.SPECIAL_CHARS.test(password);
  
  const typeCount = [hasUppercase, hasLowercase, hasNumbers, hasSpecialChars].filter(Boolean).length;
  
  if (typeCount < 2) {
    errors.push('Password harus mengandung minimal 2 dari: huruf besar, huruf kecil, angka, atau karakter khusus');
  }
  
  // Determine strength
  if (typeCount >= 4 && password.length >= 12) {
    strength = 'strong';
  } else if (typeCount >= 3 && password.length >= 8) {
    strength = 'medium';
  }
  
  // Common password patterns to avoid
  const commonPatterns = [
    /^123456/,
    /^password/i,
    /^admin/i,
    /^qwerty/i,
    /^abc123/i,
  ];
  
  if (commonPatterns.some(pattern => pattern.test(password))) {
    errors.push('Password tidak boleh menggunakan pola yang mudah ditebak');
    strength = 'weak';
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    strength,
  };
};



// ================================================
// MIDDLEWARE VALIDATION HELPERS
// ================================================

export const validateAuthHeader = z.object({
  headers: z.object({
    authorization: z
      .string({
        required_error: 'Authorization header wajib ada',
      })
      .startsWith(AUTH_CONSTANTS.TOKEN_PREFIX, 'Token harus menggunakan format Bearer'),
  }).passthrough(), // Allow other headers
});

export const validateOptionalAuthHeader = z.object({
  headers: z.object({
    authorization: z
      .string()
      .startsWith(AUTH_CONSTANTS.TOKEN_PREFIX, 'Token harus menggunakan format Bearer')
      .optional(),
  }).passthrough(),
});

// ================================================
// EXPORT ALL SCHEMAS
// ================================================

export const authValidationSchemas = {
  login: loginSchema,
  changePassword: changePasswordSchema,
  resetPassword: resetPasswordSchema,
  refreshToken: refreshTokenSchema,
  logout: logoutSchema,
  createUser: createUserSchema,
  userListQuery: userListQuerySchema,
  authHeader: validateAuthHeader,
  optionalAuthHeader: validateOptionalAuthHeader,
} as const;

export default authValidationSchemas;

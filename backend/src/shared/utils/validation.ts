/**
 * Validation utilities for common data validation tasks
 */

/**
 * Validate email format
 * @param email - Email string to validate
 * @returns boolean indicating if email is valid
 */
export function validateEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false;
  
  // Trim whitespace
  const trimmedEmail = email.trim();
  if (trimmedEmail === '') return false;
  
  // Check for spaces in local part or domain
  if (trimmedEmail.includes(' ')) return false;
  
  // Check for double dots
  if (trimmedEmail.includes('..')) return false;
  
  // Check for dots at start or end
  if (trimmedEmail.startsWith('.') || trimmedEmail.endsWith('.')) return false;
  
  // Check for dots adjacent to @
  if (trimmedEmail.includes('.@') || trimmedEmail.includes('@.')) return false;
  
  // Check length
  if (trimmedEmail.length > 254) return false;
  
  // More strict regex that properly rejects invalid formats
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  
  // Additional checks for edge cases that regex might miss
  const parts = trimmedEmail.split('@');
  if (parts.length !== 2) return false;
  
  const [localPart, domain] = parts;
  
  // Local part cannot be empty or start/end with dot
  if (!localPart || localPart.startsWith('.') || localPart.endsWith('.')) return false;
  
  // Domain cannot be empty or start/end with dot
  if (!domain || domain.startsWith('.') || domain.endsWith('.')) return false;
  
  // Check for consecutive dots in local part or domain
  if (localPart.includes('..') || domain.includes('..')) return false;
  
  return emailRegex.test(trimmedEmail);
}

/**
 * Validate password strength
 * @param password - Password string to validate
 * @returns Object with validation result, score, and feedback
 */
export function validatePasswordStrength(password: string | null | undefined): {
  isValid: boolean;
  score: number;
  feedback: string[];
} {
  const feedback: string[] = [];
  let score = 0;

  // Handle null/undefined cases
  if (!password || typeof password !== 'string') {
    feedback.push('Password is required');
    return {
      isValid: false,
      score: 0,
      feedback
    };
  }

  // Base scoring - start with 0
  score = 0;

  // Length scoring
  if (password.length >= 8) score += 20;
  if (password.length >= 12) score += 15;
  if (password.length >= 16) score += 15;

  // Character variety scoring
  if (/[a-z]/.test(password)) score += 15;
  if (/[A-Z]/.test(password)) score += 15;
  if (/\d/.test(password)) score += 15;
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score += 20;

  // Pattern scoring - bonus for no repeating chars
  if (!/(.)\1{2,}/.test(password)) score += 10;
  
  // Common password penalty
  const commonPasswords = ['password', '123456', 'admin', 'qwerty', 'letmein'];
  if (commonPasswords.includes(password.toLowerCase())) {
    score -= 30;
    feedback.push('Avoid common passwords');
  }

  // Penalties for missing requirements
  if (password.length < 8) {
    score -= 40;
    feedback.push('Password must be at least 8 characters long');
  }

  if (!/[a-z]/.test(password)) {
    score -= 20;
    feedback.push('Include lowercase letters');
  }

  if (!/[A-Z]/.test(password)) {
    score -= 20;
    feedback.push('Include uppercase letters');
  }

  if (!/\d/.test(password)) {
    score -= 20;
    feedback.push('Include numbers');
  }

  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    score -= 20;
    feedback.push('Include special characters');
  }

  // Ensure score doesn't go below 0
  score = Math.max(0, score);

  return {
    isValid: score >= 70,
    score,
    feedback
  };
}

/**
 * Validate API key format
 * @param apiKey - API key string to validate
 * @returns boolean indicating if API key format is valid
 */
export function validateApiKeyFormat(apiKey: string): boolean {
  if (!apiKey || typeof apiKey !== 'string') return false;
  
  // Check for Stripe-like format: sk_test_... or pk_test_... or sk_live_... or pk_live_...
  const apiKeyRegex = /^(sk|pk)_(test|live)_[a-zA-Z0-9]{24}$/;
  
  return apiKeyRegex.test(apiKey);
}

/**
 * Validate complete user registration data
 * @param userData - User data object
 * @returns Object with validation result and any errors
 */
export function validateUserRegistration(userData: {
  email: string;
  password: string;
  name?: string;
}): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  // Validate email
  if (!validateEmail(userData.email)) {
    errors.push('Invalid email format');
  }
  
  // Validate password
  const passwordValidation = validatePasswordStrength(userData.password);
  if (!passwordValidation.isValid) {
    errors.push(...passwordValidation.feedback);
  }
  
  // Validate name (optional)
  if (userData.name && userData.name.trim().length < 2) {
    errors.push('Name must be at least 2 characters long');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

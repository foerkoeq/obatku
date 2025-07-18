/**
 * User Management Module - Type Definitions
 * 
 * Defines all TypeScript interfaces and types for user management
 * Based on the schema: users table with NIP/password authentication
 */

export interface User {
  id: string;
  name: string;
  email?: string;
  nip: string;                          // NIP sebagai username
  phone: string;
  password_hash: string;
  role: UserRole;
  status: UserStatus;
  birth_date: Date;                     // Tanggal lahir untuk generate password
  avatar_url?: string | null;
  last_login?: Date | null;
  created_at: Date;
  updated_at: Date;
  created_by?: string;
}

export enum UserRole {
  ADMIN = 'admin',
  PPL = 'ppl',                          // Petugas Penyuluh Lapangan
  DINAS = 'dinas',                      // Dinas Pertanian
  POPT = 'popt'                         // Perlindungan Tanaman Pangan
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive'
}

// DTOs for API requests/responses
export interface CreateUserRequest {
  name: string;
  email?: string;
  nip: string;
  phone: string;
  role: 'admin' | 'ppl' | 'dinas' | 'popt';
  birth_date: string;                   // Format: YYYY-MM-DD
  avatar_url?: string;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  phone?: string;
  role?: 'admin' | 'ppl' | 'dinas' | 'popt';
  status?: 'active' | 'inactive';
  birth_date?: string;
  avatar_url?: string;
}

export interface UserResponse {
  id: string;
  name: string;
  email?: string;
  nip: string;
  phone: string;
  role: UserRole;
  status: UserStatus;
  birth_date: string;
  avatar_url?: string;
  last_login?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface UserListResponse {
  id: string;
  name: string;
  nip: string;
  role: UserRole;
  status: UserStatus;
  last_login?: string;
  created_at: string;
}

export interface PasswordResetRequest {
  new_password?: string;                // Optional untuk admin reset
  reset_to_birth_date?: boolean;        // True untuk reset ke tanggal lahir
}

export interface ChangeRoleRequest {
  role: 'admin' | 'ppl' | 'dinas' | 'popt';
}

// Query interfaces
export interface UserQuery {
  page?: number;
  limit?: number;
  search?: string;                      // Search by name or NIP
  role?: 'admin' | 'ppl' | 'dinas' | 'popt';
  status?: 'active' | 'inactive';
  sortBy?: 'name' | 'nip' | 'role' | 'created_at' | 'last_login';
  sortOrder?: 'asc' | 'desc';
}

// Internal service interfaces
export interface CreateUserData {
  id: string;
  name: string;
  email?: string;
  nip: string;
  phone: string;
  password_hash: string;
  role: UserRole;
  status: UserStatus;
  birth_date: Date;
  avatar_url?: string;
  created_by?: string;
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  phone?: string;
  role?: UserRole;
  status?: UserStatus;
  birth_date?: Date;
  avatar_url?: string;
}

export interface UserFilters {
  search?: string;
  role?: UserRole;
  status?: UserStatus;
}

export interface UserSortOptions {
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

// Password utility interfaces
export interface PasswordGenerationResult {
  password: string;                     // Plain text password (DDMMYYYY)
  hash: string;                         // Bcrypt hash
}

// Statistics interfaces
export interface UserStats {
  total: number;
  active: number;
  inactive: number;
  by_role: {
    admin: number;
    ppl: number;
    dinas: number;
    popt: number;
  };
  recent_logins: number;                // Users logged in last 30 days
}

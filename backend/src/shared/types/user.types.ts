import { 
  UserRole, 
  UserStatus 
} from '@/shared/constants/roles.constants';
import { BaseEntity } from './common.types';

// User entity
export interface User extends BaseEntity {
  name: string;
  email?: string;
  nip: string;
  phone: string;
  passwordHash: string;
  role: UserRole;
  status: UserStatus;
  birthDate: Date;
  avatarUrl?: string;
  lastLogin?: Date;
}

// Create user data
export interface CreateUserData {
  name: string;
  email?: string;
  nip: string;
  phone: string;
  password: string;
  role: UserRole;
  birthDate: Date;
  avatarUrl?: string;
}

// Update user data
export interface UpdateUserData {
  name?: string;
  email?: string;
  phone?: string;
  role?: UserRole;
  status?: UserStatus;
  birthDate?: Date;
  avatarUrl?: string;
}

// User profile data (without sensitive info)
export interface UserProfile {
  id: string;
  name: string;
  email?: string;
  nip: string;
  phone: string;
  role: UserRole;
  status: UserStatus;
  birthDate: Date;
  avatarUrl?: string;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// User login data
export interface UserLoginData {
  nip: string;
  password: string;
}

// User authentication token
export interface AuthToken {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: UserProfile;
}

// JWT payload
export interface JwtPayload {
  userId: string;
  role: UserRole;
  iat: number;
  exp: number;
}

// Change password data
export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

// Reset password data
export interface ResetPasswordData {
  token: string;
  newPassword: string;
}

// User statistics
export interface UserStatistics {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  usersByRole: {
    [key in UserRole]: number;
  };
  recentLogins: number;
}

export type User = {
  id: string;
  name: string;
  email?: string;
  role: "Admin" | "PPL" | "Dinas" | "POPT";
  avatar?: string;
  status: "active" | "inactive";
  lastLogin: string;
  nip: string;
  phone: string;
  birthDate: string;
  address?: string;
  isActive: boolean;
  permissions?: string[];
  createdAt?: string;
  updatedAt?: string;
};

// Extended types for backend compatibility
export type CreateUserRequest = {
  name: string;
  email: string;
  password: string;
  role: string;
  phone: string;
  address?: string;
  permissions?: string[];
  isActive?: boolean;
};

export type UpdateUserRequest = {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  role?: string;
  permissions?: string[];
  isActive?: boolean;
  avatar?: File;
};

export type UserFilters = {
  search?: string;
  role?: string;
  isActive?: boolean;
  dateFrom?: string;
  dateTo?: string;
  sort?: string;
  order?: 'asc' | 'desc';
  filter?: Record<string, any>;
};

export type PaginationParams = {
  page: number;
  limit: number;
};

export type UserRole = {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type UserPermission = {
  id: string;
  name: string;
  description: string;
  module: string;
  action: string;
  isActive: boolean;
}; 
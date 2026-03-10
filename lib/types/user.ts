export const USER_ROLES = [
  "Admin",
  "Kabid",
  "Kasubbid",
  "Staf Dinas",
  "BPP",
  "PPL",
  "POPT",
] as const;

export type UserRoleType = (typeof USER_ROLES)[number];

export type User = {
  id: string;
  username: string;
  name: string;
  email?: string;
  role: UserRoleType;
  avatar?: string;
  status: "active" | "inactive";
  lastLogin?: string;
  nip: string;
  phone: string;
  birthDate: string;
  address?: string;
  isActive: boolean;
  permissions?: string[];
  pangkat?: string;
  golongan?: string;
  jabatan?: string;
  lokasi: string; // "Admin" | "Dinas" | nama kecamatan
  createdAt: string;
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
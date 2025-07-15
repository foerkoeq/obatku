// Role constants for user authentication and authorization
export const USER_ROLES = {
  ADMIN: 'admin',
  PPL: 'ppl',
  DINAS: 'dinas',
  POPT: 'popt'
} as const;

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];

// User status constants
export const USER_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive'
} as const;

export type UserStatus = typeof USER_STATUS[keyof typeof USER_STATUS];

// Role permissions matrix
export const ROLE_PERMISSIONS = {
  [USER_ROLES.ADMIN]: [
    'users:create',
    'users:read',
    'users:update',
    'users:delete',
    'medicines:create',
    'medicines:read',
    'medicines:update',
    'medicines:delete',
    'inventory:create',
    'inventory:read',
    'inventory:update',
    'inventory:delete',
    'submissions:create',
    'submissions:read',
    'submissions:update',
    'submissions:delete',
    'approvals:create',
    'approvals:read',
    'approvals:update',
    'transactions:create',
    'transactions:read',
    'transactions:update',
    'transactions:delete',
    'reports:create',
    'reports:read',
    'settings:read',
    'settings:update'
  ],
  [USER_ROLES.PPL]: [
    'medicines:read',
    'submissions:create',
    'submissions:read:own',
    'submissions:update:own',
    'transactions:read:own'
  ],
  [USER_ROLES.DINAS]: [
    'medicines:create',
    'medicines:read',
    'medicines:update',
    'inventory:create',
    'inventory:read',
    'inventory:update',
    'submissions:read',
    'approvals:create',
    'approvals:read',
    'approvals:update',
    'transactions:create',
    'transactions:read',
    'transactions:update',
    'reports:create',
    'reports:read'
  ],
  [USER_ROLES.POPT]: [
    'medicines:create',
    'medicines:read',
    'medicines:update',
    'inventory:create',
    'inventory:read',
    'inventory:update',
    'transactions:create',
    'transactions:read',
    'transactions:update',
    'reports:create',
    'reports:read'
  ]
} as const;

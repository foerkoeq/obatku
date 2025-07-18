/**
 * User Management Module - Routes
 * 
 * Express routes for user management endpoints
 * Includes validation, authentication, and authorization middleware
 */

import { Router } from 'express';
import prisma from '@/core/database/prisma.client';
import { createUserService } from './users.factory';
import { UserController } from './users.controller';

const router = Router();

// Create service and controller instances
const userService = createUserService(prisma);
const userController = new UserController(userService);

// TODO: Add authentication and authorization middleware
// import { authenticate } from '../../shared/middleware/auth.middleware';
// import { authorize } from '../../shared/middleware/authorization.middleware';

/**
 * User Management Routes
 * 
 * Note: Authentication and authorization middleware will be added in Phase 4
 * For now, routes are accessible without authentication for development
 */

// User statistics (Admin only)
router.get('/stats', userController.getUserStats);

// Check NIP existence
router.get('/check-nip/:nip', userController.checkNipExists);

// Get active users
router.get('/active', userController.getActiveUsers);

// Get recent users
router.get('/recent', userController.getRecentUsers);

// Get users by role
router.get('/role/:role', userController.getUsersByRole);

// Current user profile routes
router.get('/profile', userController.getCurrentUserProfile);
router.put('/profile', userController.updateCurrentUserProfile);

// Bulk operations
router.post('/bulk', userController.bulkCreateUsers);

// User CRUD operations
router.get('/', userController.getAllUsers);
router.post('/', userController.createUser);
router.get('/:id', userController.getUserById);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);

// User management operations
router.post('/:id/reset-password', userController.resetPassword);
router.put('/:id/role', userController.changeUserRole);
router.put('/:id/status', userController.toggleUserStatus);

export default router;

/**
 * Future routes with authentication/authorization:
 * 
 * // Public routes (no authentication required)
 * router.get('/check-nip/:nip', userController.checkNipExists);
 * 
 * // Protected routes (authentication required)
 * router.use(authenticate);
 * 
 * // User profile routes (accessible by authenticated users)
 * router.get('/profile', userController.getCurrentUserProfile);
 * router.put('/profile', userController.updateCurrentUserProfile);
 * 
 * // Admin only routes
 * router.use(authorize(['admin']));
 * 
 * router.get('/stats', userController.getUserStats);
 * router.get('/active', userController.getActiveUsers);
 * router.get('/recent', userController.getRecentUsers);
 * router.get('/role/:role', userController.getUsersByRole);
 * router.get('/', userController.getAllUsers);
 * router.post('/', userController.createUser);
 * router.get('/:id', userController.getUserById);
 * router.put('/:id', userController.updateUser);
 * router.delete('/:id', userController.deleteUser);
 * router.post('/:id/reset-password', userController.resetPassword);
 * router.put('/:id/role', userController.changeUserRole);
 * router.put('/:id/status', userController.toggleUserStatus);
 * router.post('/bulk', userController.bulkCreateUsers);
 */

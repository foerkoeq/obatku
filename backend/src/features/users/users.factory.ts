/**
 * User Management Module - Service Factory
 * 
 * Factory for creating user service instances with proper dependency injection
 */

import { PrismaClient } from '@prisma/client';
import { UserRepository } from './users.repository';
import { UserService } from './users.service';

// Create singleton instances
let userRepositoryInstance: UserRepository | null = null;
let userServiceInstance: UserService | null = null;

export const createUserRepository = (prisma: PrismaClient): UserRepository => {
  if (!userRepositoryInstance) {
    userRepositoryInstance = new UserRepository(prisma);
  }
  return userRepositoryInstance;
};

export const createUserService = (prisma: PrismaClient): UserService => {
  if (!userServiceInstance) {
    const userRepository = createUserRepository(prisma);
    userServiceInstance = new UserService(userRepository);
  }
  return userServiceInstance;
};

#!/usr/bin/env node

/**
 * Development script to start the server with proper environment loading
 */

import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env.local') });

// Create required directories
const requiredDirs = [
  path.join(__dirname, '../logs'),
  path.join(__dirname, '../src/uploads'),
  path.join(__dirname, '../src/uploads/temp'),
  path.join(__dirname, '../src/uploads/documents'),
  path.join(__dirname, '../src/uploads/images'),
];

requiredDirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`✅ Created directory: ${dir}`);
  }
});

// Start the application
console.log('🚀 Starting Obatku Backend API...');
console.log(`📱 Environment: ${process.env.NODE_ENV || 'development'}`);
console.log(`🔧 Port: ${process.env.PORT || 3001}`);

// Import and start the main application
import('../src/main');

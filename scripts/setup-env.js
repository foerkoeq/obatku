#!/usr/bin/env node

/**
 * Environment Setup Script
 * Helps configure environment variables for ObatKu Frontend
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function setupEnvironment() {
  console.log('🚀 ObatKu Frontend Environment Setup');
  console.log('=====================================\n');

  try {
    // Check if .env.local already exists
    const envLocalPath = path.join(process.cwd(), '.env.local');
    if (fs.existsSync(envLocalPath)) {
      const overwrite = await question('.env.local already exists. Overwrite? (y/N): ');
      if (overwrite.toLowerCase() !== 'y') {
        console.log('Setup cancelled.');
        rl.close();
        return;
      }
    }

    // Get environment configuration
    console.log('📝 Please provide the following configuration:\n');

    const apiBaseUrl = await question(`API Base URL [http://localhost:3001]: `) || 'http://localhost:3001';
    const backendUrl = await question(`Backend URL [http://localhost:3001]: `) || 'http://localhost:3001';
    const debugMode = await question(`Enable Debug Mode? (y/N): `).toLowerCase() === 'y';
    const logLevel = await question(`Log Level [info]: `) || 'info';
    const enableAnalytics = await question(`Enable Analytics? (y/N): `).toLowerCase() === 'y';
    const enableNotifications = await question(`Enable Notifications? (y/N): `).toLowerCase() === 'y';
    const googleMapsApiKey = await question(`Google Maps API Key (optional): `) || '';
    const stripePublishableKey = await question(`Stripe Publishable Key (optional): `) || '';

    // Generate .env.local content
    const envContent = `# Frontend Environment Configuration
NODE_ENV=development
NEXT_PUBLIC_APP_NAME=ObatKu Frontend
NEXT_PUBLIC_APP_VERSION=1.0.0

# API Configuration
NEXT_PUBLIC_API_BASE_URL=${apiBaseUrl}
NEXT_PUBLIC_API_TIMEOUT=10000

# Backend URLs
NEXT_PUBLIC_BACKEND_URL=${backendUrl}
NEXT_PUBLIC_BACKEND_API_URL=${backendUrl}/api

# Authentication
NEXT_PUBLIC_JWT_STORAGE_KEY=obatku_token
NEXT_PUBLIC_REFRESH_TOKEN_KEY=obatku_refresh_token

# File Upload
NEXT_PUBLIC_MAX_FILE_SIZE=5242880
NEXT_PUBLIC_ALLOWED_FILE_TYPES=jpg,jpeg,png,pdf,doc,docx
NEXT_PUBLIC_UPLOAD_ENDPOINT=${backendUrl}/api/upload

# Development Settings
NEXT_PUBLIC_DEBUG_MODE=${debugMode}
NEXT_PUBLIC_LOG_LEVEL=${logLevel}

# Feature Flags
NEXT_PUBLIC_ENABLE_ANALYTICS=${enableAnalytics}
NEXT_PUBLIC_ENABLE_NOTIFICATIONS=${enableNotifications}
NEXT_PUBLIC_ENABLE_OFFLINE_MODE=false

# External Services
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=${googleMapsApiKey}
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=${stripePublishableKey}

# Performance & Security
NEXT_PUBLIC_ENABLE_HTTPS=false
NEXT_PUBLIC_ENABLE_COMPRESSION=false
`;

    // Write .env.local file
    fs.writeFileSync(envLocalPath, envContent);
    console.log('\n✅ .env.local file created successfully!');

    // Generate .env.production template
    const envProductionPath = path.join(process.cwd(), '.env.production');
    const productionContent = `# Frontend Production Environment Configuration
NODE_ENV=production
NEXT_PUBLIC_APP_NAME=ObatKu Frontend
NEXT_PUBLIC_APP_VERSION=1.0.0

# API Configuration
NEXT_PUBLIC_API_BASE_URL=https://api.obatku.com
NEXT_PUBLIC_API_TIMEOUT=15000

# Backend URLs
NEXT_PUBLIC_BACKEND_URL=https://api.obatku.com
NEXT_PUBLIC_BACKEND_API_URL=https://api.obatku.com/api

# Authentication
NEXT_PUBLIC_JWT_STORAGE_KEY=obatku_token
NEXT_PUBLIC_REFRESH_TOKEN_KEY=obatku_refresh_token

# File Upload
NEXT_PUBLIC_MAX_FILE_SIZE=10485760
NEXT_PUBLIC_ALLOWED_FILE_TYPES=jpg,jpeg,png,pdf,doc,docx
NEXT_PUBLIC_UPLOAD_ENDPOINT=https://api.obatku.com/api/upload

# Production Settings
NEXT_PUBLIC_DEBUG_MODE=false
NEXT_PUBLIC_LOG_LEVEL=error

# Feature Flags
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_NOTIFICATIONS=true
NEXT_PUBLIC_ENABLE_OFFLINE_MODE=false

# External Services
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=${googleMapsApiKey || 'YOUR_GOOGLE_MAPS_API_KEY'}
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=${stripePublishableKey || 'YOUR_STRIPE_PUBLISHABLE_KEY'}

# Performance & Security
NEXT_PUBLIC_ENABLE_HTTPS=true
NEXT_PUBLIC_ENABLE_COMPRESSION=true
`;

    fs.writeFileSync(envProductionPath, productionContent);
    console.log('✅ .env.production file created successfully!');

    // Create .env.example
    const envExamplePath = path.join(process.cwd(), '.env.example');
    fs.copyFileSync(envLocalPath, envExamplePath);
    console.log('✅ .env.example file created successfully!');

    console.log('\n🎉 Environment setup completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('1. Review and customize .env.local if needed');
    console.log('2. Update .env.production with your production values');
    console.log('3. Add .env.local and .env.production to .gitignore');
    console.log('4. Restart your development server');

  } catch (error) {
    console.error('❌ Error during setup:', error.message);
  } finally {
    rl.close();
  }
}

// Run setup if called directly
if (require.main === module) {
  setupEnvironment();
}

module.exports = { setupEnvironment };

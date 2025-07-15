import { config } from '../src/core/config/app.config';

// Setup test environment
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = config.database.testUrl;
process.env.LOG_LEVEL = 'error'; // Reduce log noise during tests

// Global test utilities
const testUtils = {
  generateTestId: () => `test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  
  createTestUser: (overrides = {}) => ({
    id: testUtils.generateTestId(),
    name: 'Test User',
    nip: '123456789',
    phone: '081234567890',
    role: 'ppl',
    status: 'active',
    birthDate: new Date('1990-01-01'),
    passwordHash: 'hashedpassword',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides
  }),
  
  createTestMedicine: (overrides = {}) => ({
    id: testUtils.generateTestId(),
    name: 'Test Medicine',
    producer: 'Test Producer',
    category: 'pesticide',
    unit: 'liter',
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides
  }),
  
  createTestSubmission: (overrides = {}) => ({
    id: testUtils.generateTestId(),
    submissionNumber: `SUB-${Date.now()}`,
    district: 'Test District',
    village: 'Test Village',
    farmerGroup: 'Test Farmer Group',
    groupLeader: 'Test Leader',
    commodity: 'Test Commodity',
    totalArea: 100,
    affectedArea: 50,
    pestTypes: ['test pest'],
    letterNumber: 'TEST-001',
    letterDate: new Date(),
    letterFileUrl: '/uploads/test-letter.pdf',
    status: 'pending',
    priority: 'medium',
    submitterId: testUtils.generateTestId(),
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides
  })
};

// Global setup
beforeAll(async () => {
  console.log('🧪 Setting up test environment');
});

afterAll(async () => {
  console.log('🧪 Cleaning up test environment');
});

// Export test utilities
export { testUtils };

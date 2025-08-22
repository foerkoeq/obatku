import 'jest';

// Global test setup
beforeAll(() => {
  // Set test environment
  process.env.NODE_ENV = 'test';
  
  // Set test database URL if available
  if (process.env.DATABASE_URL_TEST) {
    process.env.DATABASE_URL = process.env.DATABASE_URL_TEST;
  }
  
  // Set other test-specific environment variables
  process.env.JWT_SECRET = 'test-secret-key-for-jwt';
  process.env.BCRYPT_ROUNDS = '10';
  process.env.PORT = '3001';
});

// Global test teardown
afterAll(() => {
  // Cleanup
  jest.clearAllMocks();
  jest.resetAllMocks();
});

// Mock console methods in tests to reduce noise
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Increase timeout for all tests
jest.setTimeout(10000);

// Suppress specific console warnings during tests
const originalWarn = console.warn;
beforeAll(() => {
  console.warn = (...args: any[]) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('Jest did not exit') || 
       args[0].includes('Warning: ReactDOM.render'))
    ) {
      return;
    }
    originalWarn.call(console, ...args);
  };
});

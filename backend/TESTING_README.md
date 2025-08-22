# 🧪 Backend Testing Guide

## Overview
This guide covers testing setup, execution, and troubleshooting for the Obatku backend application.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Test Environment
```bash
# Copy test environment file
cp .env.example.test .env.test

# Edit .env.test with your test database credentials
```

### 3. Run Tests
```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run specific test suites
npm run test:auth
npm run test:inventory
npm run test:utils

# Run tests in watch mode
npm run test:watch
```

## 📋 Test Scripts

| Script | Description |
|--------|-------------|
| `npm test` | Run all tests with coverage |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Run tests with detailed coverage report |
| `npm run test:fast` | Run tests with single worker (for debugging) |
| `npm run test:unit` | Run only unit tests |
| `npm run test:integration` | Run only integration tests |
| `npm run test:clean` | Clear Jest cache |
| `npm run test:debug` | Run tests with debug options |

## 🏗️ Test Structure

```
tests/
├── setup.ts              # Global test setup
├── helpers/              # Test helper functions
├── fixtures/             # Test data fixtures
├── integration/          # Integration tests
└── unit/                 # Unit tests

src/
├── **/*.test.ts         # Unit tests alongside source
└── **/*.spec.ts         # Alternative test naming
```

## ⚙️ Configuration

### Jest Configuration (`jest.config.js`)
- **Test Environment**: Node.js
- **Coverage Thresholds**: 30% (lowered for development)
- **Test Timeout**: 10 seconds
- **Max Workers**: 50% of CPU cores

### Test Setup (`tests/setup.ts`)
- Environment variable configuration
- Console mocking
- Global test timeout
- Warning suppression

## 🔧 Troubleshooting

### Common Issues & Solutions

#### 1. Test Timeout Errors
```bash
# Increase timeout for specific test
jest.setTimeout(30000);

# Or run with debug mode
npm run test:debug
```

#### 2. Coverage Below Threshold
```bash
# Current thresholds are set to 30% for development
# Increase gradually as you add more tests

# Check coverage report
npm run test:coverage
```

#### 3. Database Connection Issues
```bash
# Ensure test database is running
# Check .env.test configuration
# Use in-memory database for unit tests
```

#### 4. Module Import Errors
```bash
# Clear Jest cache
npm run test:clean

# Check tsconfig.json paths
# Verify moduleNameMapper in jest.config.js
```

#### 5. Slow Test Execution
```bash
# Run with single worker for debugging
npm run test:fast

# Check for async operations not being awaited
# Ensure proper cleanup in afterEach/afterAll
```

### Performance Optimization

#### 1. Parallel Execution
```bash
# Jest runs tests in parallel by default
# Use --maxWorkers=1 for debugging
npm run test:fast
```

#### 2. Test Isolation
```bash
# Clear mocks between tests
jest.clearAllMocks();
jest.resetAllMocks();
```

#### 3. Selective Testing
```bash
# Run only changed files
npm run test:watch

# Run specific test file
npm test -- validation.test.ts
```

## 📊 Coverage Reports

### Understanding Coverage
- **Statements**: Percentage of code statements executed
- **Branches**: Percentage of conditional branches executed
- **Functions**: Percentage of functions called
- **Lines**: Percentage of lines executed

### Coverage Goals
- **Current**: 30% (development phase)
- **Target**: 70% (production ready)
- **Stretch**: 90% (enterprise grade)

## 🧪 Writing Tests

### Test File Naming
```typescript
// ✅ Good
user.service.test.ts
auth.middleware.spec.ts

// ❌ Avoid
test.ts
spec.ts
```

### Test Structure
```typescript
describe('Feature Name', () => {
  describe('Method Name', () => {
    it('should do something specific', () => {
      // Arrange
      const input = 'test';
      
      // Act
      const result = method(input);
      
      // Assert
      expect(result).toBe('expected');
    });
  });
});
```

### Best Practices
1. **Test Isolation**: Each test should be independent
2. **Descriptive Names**: Test names should explain the scenario
3. **AAA Pattern**: Arrange, Act, Assert
4. **Mock External Dependencies**: Don't test external services
5. **Clean Setup/Teardown**: Use beforeEach/afterEach properly

## 🚨 Common Test Patterns

### Async Testing
```typescript
it('should handle async operation', async () => {
  const result = await asyncFunction();
  expect(result).toBeDefined();
});
```

### Error Testing
```typescript
it('should throw error for invalid input', () => {
  expect(() => {
    functionWithError('invalid');
  }).toThrow('Invalid input');
});
```

### Mock Testing
```typescript
it('should call external service', () => {
  const mockService = jest.fn();
  const result = functionUsingService(mockService);
  
  expect(mockService).toHaveBeenCalledWith('expected');
});
```

## 📝 Debugging Tests

### Debug Mode
```bash
npm run test:debug
```

### Console Output
```typescript
// Temporarily enable console.log for debugging
const originalLog = console.log;
beforeEach(() => {
  console.log = jest.fn();
});

afterEach(() => {
  console.log = originalLog;
});
```

### Breakpoints
```typescript
// Add debugger statement in test
it('should debug this', () => {
  debugger;
  // Your test code
});
```

## 🔄 Continuous Integration

### GitHub Actions Example
```yaml
- name: Run Tests
  run: |
    npm ci
    npm run test:coverage
```

### Pre-commit Hooks
```json
{
  "husky": {
    "hooks": {
      "pre-commit": "npm test"
    }
  }
}
```

## 📚 Additional Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)
- [Node.js Testing Guide](https://nodejs.org/en/docs/guides/testing-and-debugging/)

## 🤝 Contributing

When adding new tests:
1. Follow the existing test structure
2. Ensure proper coverage
3. Add to appropriate test suite
4. Update this documentation if needed

## 📞 Support

For testing issues:
1. Check this troubleshooting guide
2. Review Jest configuration
3. Check test setup files
4. Create issue with detailed error information

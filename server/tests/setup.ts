// Test setup file
import dotenv from 'dotenv';

// Load test environment variables
dotenv.config({ path: '.env.test' });

// Set test environment
process.env.NODE_ENV = 'test';

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Increase timeout for integration tests
jest.setTimeout(10000);

// Global test utilities
global.testUtils = {
  createMockVerificationRequest: () => ({
    proof: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    publicSignals: ['0x1111111111111111111111111111111111111111', '0x2222222222222222222222222222222222222222'],
    attestationId: 1,
    userContextData: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
    merchantAddress: '0x742d35Cc6634C0532925a3b8D'
  }),
  
  createMockSelfVerificationResult: (isValid: boolean = true) => ({
    isValidDetails: { isValid, error: isValid ? undefined : 'Invalid proof' },
    discloseOutput: isValid ? { nationality: 'US', age: 25 } : {}
  }),
  
  createMockContractResult: (success: boolean = true) => ({
    success,
    transactionHash: success ? '0x1234567890abcdef' : undefined,
    error: success ? undefined : 'Contract error',
    gasUsed: success ? 100000 : undefined
  })
};

// Cleanup after each test
afterEach(() => {
  jest.clearAllMocks();
});

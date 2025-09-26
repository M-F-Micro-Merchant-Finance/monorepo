import request from 'supertest';
import app from '../../src/app';
import { ConfigService } from '../../src/services/config.service';

// Mock the Self Protocol and contract services
jest.mock('@selfxyz/core');
jest.mock('ethers');

describe('Verification Integration Tests', () => {
  let server: any;

  beforeAll(async () => {
    // Mock environment variables
    process.env.NODE_ENV = 'test';
    process.env.PORT = '0'; // Use random port for testing
    process.env.SELF_APP_NAME = 'test-app';
    process.env.SELF_SCOPE = 'test-scope';
    process.env.SELF_ENDPOINT = 'https://test.self.xyz/verify';
    process.env.CELO_RPC_URL = 'https://test.celo.org';
    process.env.CONTRACT_ADDRESS = '0x742d35Cc6634C0532925a3b8D';
    process.env.PRIVATE_KEY = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
    process.env.MINIMUM_AGE = '18';
    process.env.EXCLUDED_COUNTRIES = 'IRN,PRK';
    process.env.OFAC_ENABLED = 'true';
    process.env.MOCK_PASSPORT = 'true';

    server = app.getApp();
  });

  afterAll(async () => {
    // Cleanup
    jest.clearAllMocks();
  });

  describe('POST /api/verify/identity', () => {
    const validVerificationRequest = {
      proof: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
      publicSignals: ['0x1111111111111111111111111111111111111111', '0x2222222222222222222222222222222222222222'],
      attestationId: 1,
      userContextData: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
      merchantAddress: '0x742d35Cc6634C0532925a3b8D'
    };

    it('should verify identity successfully with valid data', async () => {
      // Mock successful Self Protocol verification
      const { SelfBackendVerifier } = require('@selfxyz/core');
      const mockVerifier = {
        verify: jest.fn().mockResolvedValue({
          isValidDetails: { isValid: true },
          discloseOutput: { nationality: 'US', age: 25 }
        })
      };
      SelfBackendVerifier.mockImplementation(() => mockVerifier);

      // Mock successful contract interaction
      const { ethers } = require('ethers');
      const mockContract = {
        verifyMerchantIdentity: jest.fn().mockResolvedValue({
          hash: '0x1234567890abcdef',
          wait: jest.fn().mockResolvedValue({
            hash: '0x1234567890abcdef',
            gasUsed: 100000
          })
        })
      };
      const mockWallet = {
        address: '0x742d35Cc6634C0532925a3b8D'
      };
      ethers.JsonRpcProvider.mockImplementation(() => ({}));
      ethers.Wallet.mockImplementation(() => mockWallet);
      ethers.Contract.mockImplementation(() => mockContract);

      const response = await request(server)
        .post('/api/verify/identity')
        .send(validVerificationRequest)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.transactionHash).toBeDefined();
      expect(response.body.verificationId).toBeDefined();
    });

    it('should return 400 for invalid request data', async () => {
      const invalidRequest = {
        proof: '', // Invalid empty proof
        publicSignals: [], // Invalid empty array
        attestationId: 4, // Invalid attestation ID
        userContextData: 'invalid', // Invalid hex string
        merchantAddress: 'invalid-address' // Invalid address
      };

      const response = await request(server)
        .post('/api/verify/identity')
        .send(invalidRequest)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for missing required fields', async () => {
      const incompleteRequest = {
        proof: '0x1234567890abcdef',
        // Missing other required fields
      };

      const response = await request(server)
        .post('/api/verify/identity')
        .send(incompleteRequest)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.code).toBe('VALIDATION_ERROR');
    });

    it('should handle Self Protocol verification failure', async () => {
      // Mock failed Self Protocol verification
      const { SelfBackendVerifier } = require('@selfxyz/core');
      const mockVerifier = {
        verify: jest.fn().mockResolvedValue({
          isValidDetails: { isValid: false, error: 'Invalid proof' },
          discloseOutput: {}
        })
      };
      SelfBackendVerifier.mockImplementation(() => mockVerifier);

      const response = await request(server)
        .post('/api/verify/identity')
        .send(validVerificationRequest)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Invalid proof');
      expect(response.body.code).toBe('VERIFICATION_FAILED');
    });

    it('should handle contract interaction failure', async () => {
      // Mock successful Self Protocol verification but failed contract interaction
      const { SelfBackendVerifier } = require('@selfxyz/core');
      const mockVerifier = {
        verify: jest.fn().mockResolvedValue({
          isValidDetails: { isValid: true },
          discloseOutput: { nationality: 'US', age: 25 }
        })
      };
      SelfBackendVerifier.mockImplementation(() => mockVerifier);

      // Mock failed contract interaction
      const { ethers } = require('ethers');
      const mockContract = {
        verifyMerchantIdentity: jest.fn().mockRejectedValue(new Error('Contract error'))
      };
      const mockWallet = {
        address: '0x742d35Cc6634C0532925a3b8D'
      };
      ethers.JsonRpcProvider.mockImplementation(() => ({}));
      ethers.Wallet.mockImplementation(() => mockWallet);
      ethers.Contract.mockImplementation(() => mockContract);

      const response = await request(server)
        .post('/api/verify/identity')
        .send(validVerificationRequest)
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.code).toBe('CONTRACT_ERROR');
    });
  });

  describe('GET /api/verify/status/:merchantAddress', () => {
    const validMerchantAddress = '0x742d35Cc6634C0532925a3b8D';

    it('should return verification status for valid address', async () => {
      // Mock contract interaction
      const { ethers } = require('ethers');
      const mockContract = {
        isVerifiedMerchant: jest.fn().mockResolvedValue(true)
      };
      const mockWallet = {
        address: '0x742d35Cc6634C0532925a3b8D'
      };
      ethers.JsonRpcProvider.mockImplementation(() => ({}));
      ethers.Wallet.mockImplementation(() => mockWallet);
      ethers.Contract.mockImplementation(() => mockContract);

      const response = await request(server)
        .get(`/api/verify/status/${validMerchantAddress}`)
        .expect(200);

      expect(response.body.isVerified).toBe(true);
      expect(response.body.merchantAddress).toBe(validMerchantAddress);
    });

    it('should return 400 for invalid merchant address', async () => {
      const invalidAddress = 'invalid-address';

      const response = await request(server)
        .get(`/api/verify/status/${invalidAddress}`)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.code).toBe('INVALID_ADDRESS');
    });

    it('should handle contract errors when checking status', async () => {
      // Mock contract error
      const { ethers } = require('ethers');
      const mockContract = {
        isVerifiedMerchant: jest.fn().mockRejectedValue(new Error('Contract error'))
      };
      const mockWallet = {
        address: '0x742d35Cc6634C0532925a3b8D'
      };
      ethers.JsonRpcProvider.mockImplementation(() => ({}));
      ethers.Wallet.mockImplementation(() => mockWallet);
      ethers.Contract.mockImplementation(() => mockContract);

      const response = await request(server)
        .get(`/api/verify/status/${validMerchantAddress}`)
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.code).toBe('STATUS_ERROR');
    });
  });

  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(server)
        .get('/health')
        .expect(200);

      expect(response.body.status).toBe('healthy');
      expect(response.body.timestamp).toBeDefined();
    });
  });

  describe('GET /api/health', () => {
    it('should return detailed health status', async () => {
      // Mock network and contract info
      const { ethers } = require('ethers');
      const mockProvider = {
        getNetwork: jest.fn().mockResolvedValue({ chainId: 42220n }),
        getBlockNumber: jest.fn().mockResolvedValue(12345678),
        getFeeData: jest.fn().mockResolvedValue({ gasPrice: 1000000000n })
      };
      const mockContract = {
        isVerifiedMerchant: jest.fn().mockResolvedValue(true)
      };
      const mockWallet = {
        address: '0x742d35Cc6634C0532925a3b8D'
      };
      ethers.JsonRpcProvider.mockImplementation(() => mockProvider);
      ethers.Wallet.mockImplementation(() => mockWallet);
      ethers.Contract.mockImplementation(() => mockContract);

      const response = await request(server)
        .get('/api/health')
        .expect(200);

      expect(response.body.status).toBe('healthy');
      expect(response.body.services).toBeDefined();
      expect(response.body.network).toBeDefined();
      expect(response.body.contract).toBeDefined();
    });
  });

  describe('GET /api/metrics', () => {
    it('should return verification metrics', async () => {
      const response = await request(server)
        .get('/api/metrics')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.metrics).toBeDefined();
    });
  });

  describe('Error handling', () => {
    it('should handle 404 for unknown routes', async () => {
      const response = await request(server)
        .get('/unknown-route')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.code).toBe('NOT_FOUND');
    });

    it('should handle invalid JSON in request body', async () => {
      const response = await request(server)
        .post('/api/verify/identity')
        .set('Content-Type', 'application/json')
        .send('invalid json')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.code).toBe('INVALID_JSON');
    });

    it('should handle requests with invalid content type', async () => {
      const response = await request(server)
        .post('/api/verify/identity')
        .set('Content-Type', 'text/plain')
        .send('some data')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.code).toBe('INVALID_CONTENT_TYPE');
    });
  });
});

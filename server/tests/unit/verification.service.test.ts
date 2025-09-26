import { VerificationService } from '../../src/services/verification.service';
import { VerificationRequest, SelfVerificationResult } from '../../src/types/verification.types';

// Mock the dependencies
jest.mock('@selfxyz/core');
jest.mock('../../src/services/config.service');
jest.mock('../../src/utils/logger');

describe('VerificationService', () => {
  let verificationService: VerificationService;
  let mockSelfVerifier: any;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Mock SelfBackendVerifier
    mockSelfVerifier = {
      verify: jest.fn()
    };

    // Mock the constructor to return our mock
    const { SelfBackendVerifier } = require('@selfxyz/core');
    SelfBackendVerifier.mockImplementation(() => mockSelfVerifier);

    verificationService = new VerificationService();
  });

  describe('verifyIdentity', () => {
    const validRequest: VerificationRequest = {
      proof: '0x1234567890abcdef',
      publicSignals: ['0x1111', '0x2222'],
      attestationId: 1,
      userContextData: '0xabcdef1234567890',
      merchantAddress: '0x742d35Cc6634C0532925a3b8D'
    };

    it('should successfully verify a valid proof', async () => {
      // Arrange
      const mockResult: SelfVerificationResult = {
        isValidDetails: { isValid: true },
        discloseOutput: { nationality: 'US', age: 25 }
      };
      mockSelfVerifier.verify.mockResolvedValue(mockResult);

      // Act
      const result = await verificationService.verifyIdentity(validRequest);

      // Assert
      expect(result.success).toBe(true);
      expect(result.verificationId).toBeDefined();
      expect(result.timestamp).toBeDefined();
      expect(mockSelfVerifier.verify).toHaveBeenCalledWith(
        1,
        validRequest.proof,
        validRequest.publicSignals,
        validRequest.userContextData
      );
    });

    it('should fail verification for invalid proof', async () => {
      // Arrange
      const mockResult: SelfVerificationResult = {
        isValidDetails: { isValid: false, error: 'Invalid proof' },
        discloseOutput: {}
      };
      mockSelfVerifier.verify.mockResolvedValue(mockResult);

      // Act
      const result = await verificationService.verifyIdentity(validRequest);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid proof');
    });

    it('should handle Self Protocol errors', async () => {
      // Arrange
      mockSelfVerifier.verify.mockRejectedValue(new Error('Self Protocol error'));

      // Act
      const result = await verificationService.verifyIdentity(validRequest);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toContain('Self Protocol verification failed');
    });

    it('should validate request parameters', async () => {
      // Arrange
      const invalidRequest = {
        ...validRequest,
        proof: '', // Invalid empty proof
        merchantAddress: 'invalid-address' // Invalid address
      };

      // Act
      const result = await verificationService.verifyIdentity(invalidRequest as VerificationRequest);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toContain('Validation failed');
    });

    it('should validate attestation ID', async () => {
      // Arrange
      const invalidRequest = {
        ...validRequest,
        attestationId: 4 // Invalid attestation ID
      };

      // Act
      const result = await verificationService.verifyIdentity(invalidRequest);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toContain('Attestation ID must be 1 (Passport), 2 (EU ID Card), or 3 (Aadhaar)');
    });

    it('should validate merchant address format', async () => {
      // Arrange
      const invalidRequest = {
        ...validRequest,
        merchantAddress: '0xinvalid' // Invalid address format
      };

      // Act
      const result = await verificationService.verifyIdentity(invalidRequest);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toContain('Merchant address is required and must be a valid Ethereum address');
    });
  });

  describe('getVerificationStatus', () => {
    it('should return verification status', async () => {
      // Arrange
      const merchantAddress = '0x742d35Cc6634C0532925a3b8D';

      // Act
      const result = await verificationService.getVerificationStatus(merchantAddress);

      // Assert
      expect(result).toHaveProperty('isVerified');
      expect(result).toHaveProperty('details');
    });

    it('should handle errors when getting status', async () => {
      // Arrange
      const merchantAddress = '0x742d35Cc6634C0532925a3b8D';
      
      // Mock an error in the status check
      jest.spyOn(verificationService as any, 'getVerificationStatus')
        .mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(verificationService.getVerificationStatus(merchantAddress))
        .rejects.toThrow('Failed to get verification status');
    });
  });

  describe('getVerificationMetrics', () => {
    it('should return verification metrics', () => {
      // Act
      const metrics = verificationService.getVerificationMetrics();

      // Assert
      expect(metrics).toHaveProperty('totalVerifications');
      expect(metrics).toHaveProperty('successfulVerifications');
      expect(metrics).toHaveProperty('failedVerifications');
      expect(metrics).toHaveProperty('averageVerificationTime');
      expect(metrics).toHaveProperty('lastVerificationTime');
    });
  });
});

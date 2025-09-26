import request from 'supertest';
import app from '../../src/app';
import { MerchantOnboardingFormData, SelfVerificationResult } from '../../src/types/verification.types';

// Mock the Self Protocol and contract services
jest.mock('@selfxyz/core');
jest.mock('ethers');

describe('Frontend Integration E2E Tests', () => {
  let server: any;

  beforeAll(async () => {
    // Mock environment variables
    process.env.NODE_ENV = 'test';
    process.env.PORT = '0';
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
    jest.clearAllMocks();
  });

  describe('POST /api/merchant/onboard', () => {
    const mockFormData: MerchantOnboardingFormData = {
      businessName: 'Test Business',
      businessType: 'sole_proprietorship',
      industry: 'technology',
      businessAge: 24, // 2 years
      legalStructure: 'formal',
      registrationStatus: 'registered',
      monthlyRevenue: {
        current: 5000,
        average: 4500,
        growthRate: 10,
        seasonality: 'low'
      },
      monthlyExpenses: {
        fixed: 2000,
        variable: 1500,
        total: 3500
      },
      cashFlow: {
        operating: 1500,
        free: 1000,
        workingCapital: 5000
      },
      balanceSheet: {
        totalAssets: 50000,
        currentAssets: 20000,
        totalLiabilities: 10000,
        currentLiabilities: 5000,
        equity: 40000
      },
      fundIntention: {
        purpose: 'working_capital',
        amount: {
          requested: 10000,
          minimum: 5000,
          maximum: 15000
        },
        duration: {
          preferred: 12,
          minimum: 6,
          maximum: 18
        },
        repaymentCapacity: {
          monthlyCapacity: 1000,
          percentageOfRevenue: 20
        },
        collateral: {
          available: true,
          type: 'equipment',
          value: 15000,
          liquidity: 'medium'
        }
      },
      riskFactors: {
        marketRisk: 'medium',
        operationalRisk: 'low',
        financialRisk: 'low',
        economicSensitivity: 'medium',
        regulatoryRisk: 'low',
        currencyRisk: 'low',
        paymentHistory: {
          onTime: 95,
          late: 5,
          default: 0
        },
        industryRisks: ['technology_risk']
      },
      marketContext: {
        primaryMarket: 'US',
        operatingRegions: ['US'],
        marketSize: 'small',
        competitionLevel: 'medium',
        marketGrowth: 'growing'
      },
      complianceProfile: {
        kycLevel: 'enhanced',
        amlRisk: 'low',
        regulatoryRequirements: ['kyc'],
        jurisdiction: 'US'
      }
    };

    const mockVerificationResult: SelfVerificationResult = {
      isValid: true,
      credentialSubject: {
        nationality: 'US',
        age: 30,
        gender: 'male'
      },
      attestationId: 1,
      proof: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
      publicSignals: ['0x1111111111111111111111111111111111111111', '0x2222222222222222222222222222222222222222'],
      userContextData: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890'
    };

    const merchantAddress = '0x742d35Cc6634C0532925a3b8D';

    it('should process complete merchant onboarding successfully', async () => {
      // Mock successful Self Protocol verification
      const { SelfBackendVerifier } = require('@selfxyz/core');
      const mockVerifier = {
        verify: jest.fn().mockResolvedValue({
          isValidDetails: { isValid: true },
          discloseOutput: { nationality: 'US', age: 30 }
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
      ethers.keccak256.mockReturnValue('0x1234567890abcdef1234567890abcdef12345678');
      ethers.toUtf8Bytes.mockReturnValue(new Uint8Array([1, 2, 3, 4]));

      const response = await request(server)
        .post('/api/merchant/onboard')
        .send({
          formData: mockFormData,
          verificationResult: mockVerificationResult,
          merchantAddress
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.transactionHash).toBeDefined();
      expect(response.body.verificationId).toBeDefined();
      expect(response.body.contractData).toBeDefined();
      expect(response.body.contractData.businessId).toBeDefined();
      expect(response.body.contractData.creditScore).toBeGreaterThan(0);
      expect(response.body.contractData.creditScore).toBeLessThanOrEqual(100);
    });

    it('should handle invalid Self Protocol verification', async () => {
      const invalidVerificationResult = {
        ...mockVerificationResult,
        isValid: false
      };

      const response = await request(server)
        .post('/api/merchant/onboard')
        .send({
          formData: mockFormData,
          verificationResult: invalidVerificationResult,
          merchantAddress
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.code).toBe('INVALID_VERIFICATION');
    });

    it('should handle age verification failure', async () => {
      const underageVerificationResult = {
        ...mockVerificationResult,
        credentialSubject: {
          ...mockVerificationResult.credentialSubject,
          age: 16 // Under 18
        }
      };

      const response = await request(server)
        .post('/api/merchant/onboard')
        .send({
          formData: mockFormData,
          verificationResult: underageVerificationResult,
          merchantAddress
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.code).toBe('INVALID_VERIFICATION');
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
        .post('/api/merchant/onboard')
        .send({
          formData: mockFormData,
          verificationResult: mockVerificationResult,
          merchantAddress
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.code).toBe('VERIFICATION_FAILED');
    });

    it('should handle contract interaction failure', async () => {
      // Mock successful Self Protocol verification but failed contract interaction
      const { SelfBackendVerifier } = require('@selfxyz/core');
      const mockVerifier = {
        verify: jest.fn().mockResolvedValue({
          isValidDetails: { isValid: true },
          discloseOutput: { nationality: 'US', age: 30 }
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
      ethers.keccak256.mockReturnValue('0x1234567890abcdef1234567890abcdef12345678');
      ethers.toUtf8Bytes.mockReturnValue(new Uint8Array([1, 2, 3, 4]));

      const response = await request(server)
        .post('/api/merchant/onboard')
        .send({
          formData: mockFormData,
          verificationResult: mockVerificationResult,
          merchantAddress
        })
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.code).toBe('CONTRACT_ERROR');
    });

    it('should validate required fields', async () => {
      const response = await request(server)
        .post('/api/merchant/onboard')
        .send({
          // Missing required fields
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should calculate credit scores correctly', async () => {
      // Mock successful verification
      const { SelfBackendVerifier } = require('@selfxyz/core');
      const mockVerifier = {
        verify: jest.fn().mockResolvedValue({
          isValidDetails: { isValid: true },
          discloseOutput: { nationality: 'US', age: 30 }
        })
      };
      SelfBackendVerifier.mockImplementation(() => mockVerifier);

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
      ethers.keccak256.mockReturnValue('0x1234567890abcdef1234567890abcdef12345678');
      ethers.toUtf8Bytes.mockReturnValue(new Uint8Array([1, 2, 3, 4]));

      const response = await request(server)
        .post('/api/merchant/onboard')
        .send({
          formData: mockFormData,
          verificationResult: mockVerificationResult,
          merchantAddress
        })
        .expect(200);

      const contractData = response.body.contractData;
      
      // Verify credit score calculation
      expect(contractData.creditScore).toBeGreaterThan(0);
      expect(contractData.creditScore).toBeLessThanOrEqual(100);
      
      // Verify risk metrics
      expect(contractData.defaultProbability).toBeGreaterThan(0);
      expect(contractData.defaultProbability).toBeLessThanOrEqual(100);
      expect(contractData.lossGivenDefault).toBeGreaterThan(0);
      expect(contractData.lossGivenDefault).toBeLessThanOrEqual(100);
      expect(contractData.recoveryRate).toBeGreaterThan(0);
      expect(contractData.recoveryRate).toBeLessThanOrEqual(100);
      
      // Verify business fundamentals
      expect(contractData.businessAgeScore).toBeGreaterThan(0);
      expect(contractData.businessAgeScore).toBeLessThanOrEqual(100);
      expect(contractData.revenueStabilityScore).toBeGreaterThan(0);
      expect(contractData.revenueStabilityScore).toBeLessThanOrEqual(100);
      
      // Verify financial health
      expect(contractData.liquidityScore).toBeGreaterThan(0);
      expect(contractData.liquidityScore).toBeLessThanOrEqual(100);
      expect(contractData.leverageScore).toBeGreaterThan(0);
      expect(contractData.leverageScore).toBeLessThanOrEqual(100);
    });

    it('should handle different business types correctly', async () => {
      const corporationFormData = {
        ...mockFormData,
        businessType: 'corporation' as const,
        businessAge: 60, // 5 years
        registrationStatus: 'registered' as const
      };

      // Mock successful verification
      const { SelfBackendVerifier } = require('@selfxyz/core');
      const mockVerifier = {
        verify: jest.fn().mockResolvedValue({
          isValidDetails: { isValid: true },
          discloseOutput: { nationality: 'US', age: 30 }
        })
      };
      SelfBackendVerifier.mockImplementation(() => mockVerifier);

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
      ethers.keccak256.mockReturnValue('0x1234567890abcdef1234567890abcdef12345678');
      ethers.toUtf8Bytes.mockReturnValue(new Uint8Array([1, 2, 3, 4]));

      const response = await request(server)
        .post('/api/merchant/onboard')
        .send({
          formData: corporationFormData,
          verificationResult: mockVerificationResult,
          merchantAddress
        })
        .expect(200);

      const contractData = response.body.contractData;
      
      // Corporation should have higher scores due to age and registration
      expect(contractData.businessAgeScore).toBeGreaterThan(50);
      expect(contractData.regulatoryComplianceScore).toBeGreaterThan(50);
    });
  });
});

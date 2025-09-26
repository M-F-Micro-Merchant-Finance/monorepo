import request from 'supertest';
import app from '../../src/app';

// Mock the Self Protocol and contract services
jest.mock('@selfxyz/core');
jest.mock('ethers');

describe('Full Integration Tests - Frontend to Backend to Contract', () => {
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

  describe('Complete Merchant Onboarding Flow', () => {
    const completeFormData = {
      businessName: 'Green Valley Farm',
      businessType: 'sole_proprietorship',
      industry: 'agriculture',
      businessAge: 24, // 2 years
      legalStructure: 'informal',
      registrationStatus: 'unregistered',
      monthlyRevenue: {
        current: 2500,
        average: 2200,
        growthRate: 15,
        seasonality: 'high'
      },
      monthlyExpenses: {
        fixed: 800,
        variable: 1200,
        total: 2000
      },
      cashFlow: {
        operating: 500,
        free: 300,
        workingCapital: 1500
      },
      balanceSheet: {
        totalAssets: 15000,
        currentAssets: 5000,
        totalLiabilities: 3000,
        currentLiabilities: 2000,
        equity: 12000
      },
      fundIntention: {
        purpose: 'working_capital',
        amount: {
          requested: 5000,
          minimum: 3000,
          maximum: 8000
        },
        duration: {
          preferred: 12,
          minimum: 6,
          maximum: 18
        },
        repaymentCapacity: {
          monthlyCapacity: 400,
          percentageOfRevenue: 16
        },
        collateral: {
          available: true,
          type: 'equipment',
          value: 8000,
          liquidity: 'medium'
        }
      },
      riskFactors: {
        marketRisk: 'medium',
        operationalRisk: 'high',
        financialRisk: 'medium',
        economicSensitivity: 'high',
        regulatoryRisk: 'low',
        currencyRisk: 'low',
        paymentHistory: {
          onTime: 85,
          late: 15,
          default: 0
        },
        industryRisks: ['seasonal', 'weather', 'price_volatility']
      },
      marketContext: {
        primaryMarket: 'KE',
        operatingRegions: ['KE'],
        marketSize: 'micro',
        competitionLevel: 'medium',
        marketGrowth: 'growing'
      },
      complianceProfile: {
        kycLevel: 'basic',
        amlRisk: 'low',
        regulatoryRequirements: ['kyc'],
        jurisdiction: 'KE'
      }
    };

    const validSelfVerification = {
      isValid: true,
      credentialSubject: {
        nationality: 'KE',
        age: 35,
        gender: 'female'
      },
      attestationId: 1, // Passport
      proof: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
      publicSignals: [
        '0x1111111111111111111111111111111111111111',
        '0x2222222222222222222222222222222222222222'
      ],
      userContextData: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890'
    };

    const merchantAddress = '0x742d35Cc6634C0532925a3b8D';

    it('should complete full onboarding flow successfully', async () => {
      // Mock successful Self Protocol verification
      const { SelfBackendVerifier } = require('@selfxyz/core');
      const mockVerifier = {
        verify: jest.fn().mockResolvedValue({
          isValidDetails: { isValid: true },
          discloseOutput: { nationality: 'KE', age: 35 }
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
            gasUsed: 150000
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
          formData: completeFormData,
          verificationResult: validSelfVerification,
          merchantAddress
        })
        .expect(200);

      // Verify response structure
      expect(response.body.success).toBe(true);
      expect(response.body.transactionHash).toBe('0x1234567890abcdef');
      expect(response.body.verificationId).toBeDefined();
      expect(response.body.contractData).toBeDefined();
      expect(response.body.timestamp).toBeDefined();

      // Verify contract data structure
      const contractData = response.body.contractData;
      expect(contractData.businessId).toBeDefined();
      expect(contractData.countryCodeHash).toBeDefined();
      expect(contractData.creditAssessmentId).toBeDefined();
      expect(contractData.collateralAddress).toBe(merchantAddress);
      expect(contractData.collateralType).toBe(0); // equipment
      expect(contractData.protectionSeller).toBe(merchantAddress);
      expect(contractData.merchantWallet).toBe(merchantAddress);

      // Verify risk metrics are calculated correctly
      expect(contractData.creditScore).toBeGreaterThan(0);
      expect(contractData.creditScore).toBeLessThanOrEqual(100);
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
      expect(contractData.marketPositionScore).toBeGreaterThan(0);
      expect(contractData.marketPositionScore).toBeLessThanOrEqual(100);
      expect(contractData.industryRiskScore).toBeGreaterThan(0);
      expect(contractData.industryRiskScore).toBeLessThanOrEqual(100);
      expect(contractData.regulatoryComplianceScore).toBeGreaterThan(0);
      expect(contractData.regulatoryComplianceScore).toBeLessThanOrEqual(100);

      // Verify financial health
      expect(contractData.liquidityScore).toBeGreaterThan(0);
      expect(contractData.liquidityScore).toBeLessThanOrEqual(100);
      expect(contractData.leverageScore).toBeGreaterThan(0);
      expect(contractData.leverageScore).toBeLessThanOrEqual(100);
      expect(contractData.cashFlowScore).toBeGreaterThan(0);
      expect(contractData.cashFlowScore).toBeLessThanOrEqual(100);
      expect(contractData.profitabilityScore).toBeGreaterThan(0);
      expect(contractData.profitabilityScore).toBeLessThanOrEqual(100);

      // Verify risk factors
      expect(contractData.marketVolatility).toBeGreaterThan(0);
      expect(contractData.marketVolatility).toBeLessThanOrEqual(100);
      expect(contractData.economicCyclePosition).toBeGreaterThan(0);
      expect(contractData.economicCyclePosition).toBeLessThanOrEqual(5);
      expect(contractData.regulatoryStability).toBeGreaterThan(0);
      expect(contractData.regulatoryStability).toBeLessThanOrEqual(5);
      expect(contractData.seasonality).toBeGreaterThan(0);
      expect(contractData.seasonality).toBeLessThanOrEqual(5);
    });

    it('should handle different business types correctly', async () => {
      const corporationData = {
        ...completeFormData,
        businessType: 'corporation',
        businessAge: 60, // 5 years
        registrationStatus: 'registered',
        legalStructure: 'formal'
      };

      // Mock successful verification
      const { SelfBackendVerifier } = require('@selfxyz/core');
      const mockVerifier = {
        verify: jest.fn().mockResolvedValue({
          isValidDetails: { isValid: true },
          discloseOutput: { nationality: 'KE', age: 35 }
        })
      };
      SelfBackendVerifier.mockImplementation(() => mockVerifier);

      const { ethers } = require('ethers');
      const mockContract = {
        verifyMerchantIdentity: jest.fn().mockResolvedValue({
          hash: '0x1234567890abcdef',
          wait: jest.fn().mockResolvedValue({
            hash: '0x1234567890abcdef',
            gasUsed: 150000
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
          formData: corporationData,
          verificationResult: validSelfVerification,
          merchantAddress
        })
        .expect(200);

      const contractData = response.body.contractData;

      // Corporation should have higher scores due to age and registration
      expect(contractData.businessAgeScore).toBeGreaterThan(50);
      expect(contractData.regulatoryComplianceScore).toBeGreaterThan(50);
    });

    it('should handle high-risk merchants correctly', async () => {
      const highRiskData = {
        ...completeFormData,
        riskFactors: {
          ...completeFormData.riskFactors,
          financialRisk: 'high',
          operationalRisk: 'high',
          marketRisk: 'high',
          paymentHistory: {
            onTime: 60,
            late: 30,
            default: 10
          }
        }
      };

      // Mock successful verification
      const { SelfBackendVerifier } = require('@selfxyz/core');
      const mockVerifier = {
        verify: jest.fn().mockResolvedValue({
          isValidDetails: { isValid: true },
          discloseOutput: { nationality: 'KE', age: 35 }
        })
      };
      SelfBackendVerifier.mockImplementation(() => mockVerifier);

      const { ethers } = require('ethers');
      const mockContract = {
        verifyMerchantIdentity: jest.fn().mockResolvedValue({
          hash: '0x1234567890abcdef',
          wait: jest.fn().mockResolvedValue({
            hash: '0x1234567890abcdef',
            gasUsed: 150000
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
          formData: highRiskData,
          verificationResult: validSelfVerification,
          merchantAddress
        })
        .expect(200);

      const contractData = response.body.contractData;

      // High-risk merchants should have lower credit scores and higher default probability
      expect(contractData.creditScore).toBeLessThan(70);
      expect(contractData.defaultProbability).toBeGreaterThan(20);
    });

    it('should handle merchants with collateral correctly', async () => {
      const collateralData = {
        ...completeFormData,
        fundIntention: {
          ...completeFormData.fundIntention,
          collateral: {
            available: true,
            type: 'real_estate',
            value: 50000,
            liquidity: 'high'
          }
        }
      };

      // Mock successful verification
      const { SelfBackendVerifier } = require('@selfxyz/core');
      const mockVerifier = {
        verify: jest.fn().mockResolvedValue({
          isValidDetails: { isValid: true },
          discloseOutput: { nationality: 'KE', age: 35 }
        })
      };
      SelfBackendVerifier.mockImplementation(() => mockVerifier);

      const { ethers } = require('ethers');
      const mockContract = {
        verifyMerchantIdentity: jest.fn().mockResolvedValue({
          hash: '0x1234567890abcdef',
          wait: jest.fn().mockResolvedValue({
            hash: '0x1234567890abcdef',
            gasUsed: 150000
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
          formData: collateralData,
          verificationResult: validSelfVerification,
          merchantAddress
        })
        .expect(200);

      const contractData = response.body.contractData;

      // Merchants with high-liquidity collateral should have better scores
      expect(contractData.creditScore).toBeGreaterThan(50);
      expect(contractData.lossGivenDefault).toBeLessThan(30); // Lower LGD due to collateral
      expect(contractData.collateralType).toBe(1); // real_estate
    });
  });

  describe('Error Handling in Full Flow', () => {
    it('should handle Self Protocol verification failure gracefully', async () => {
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
          formData: completeFormData,
          verificationResult: {
            isValid: true,
            credentialSubject: { nationality: 'KE', age: 35 },
            attestationId: 1,
            proof: '0xproof',
            publicSignals: ['0x1111'],
            userContextData: '0xcontext'
          },
          merchantAddress: '0x742d35Cc6634C0532925a3b8D'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.code).toBe('VERIFICATION_FAILED');
    });

    it('should handle contract interaction failure gracefully', async () => {
      const { SelfBackendVerifier } = require('@selfxyz/core');
      const mockVerifier = {
        verify: jest.fn().mockResolvedValue({
          isValidDetails: { isValid: true },
          discloseOutput: { nationality: 'KE', age: 35 }
        })
      };
      SelfBackendVerifier.mockImplementation(() => mockVerifier);

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
          formData: completeFormData,
          verificationResult: {
            isValid: true,
            credentialSubject: { nationality: 'KE', age: 35 },
            attestationId: 1,
            proof: '0xproof',
            publicSignals: ['0x1111'],
            userContextData: '0xcontext'
          },
          merchantAddress: '0x742d35Cc6634C0532925a3b8D'
        })
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.code).toBe('CONTRACT_ERROR');
    });
  });
});

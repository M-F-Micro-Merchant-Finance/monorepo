import { BackendIntegrationService } from '../backendIntegration.service';
import { MerchantOnboardingFormData, SelfVerificationResult } from '../../types/contracts';

// Mock fetch
global.fetch = jest.fn();

describe('BackendIntegrationService', () => {
  let service: BackendIntegrationService;
  const mockBaseUrl = 'http://localhost:3000';

  beforeEach(() => {
    service = new BackendIntegrationService(mockBaseUrl);
    jest.clearAllMocks();
  });

  describe('processMerchantOnboarding', () => {
    const mockFormData: MerchantOnboardingFormData = {
      businessName: 'Test Business',
      businessType: 'sole_proprietorship',
      industry: 'technology',
      businessAge: 24,
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
      proof: '0x1234567890abcdef',
      publicSignals: ['0x1111', '0x2222'],
      userContextData: '0xabcdef1234567890'
    };

    const merchantAddress = '0x742d35Cc6634C0532925a3b8D';

    it('should process merchant onboarding successfully', async () => {
      const mockResponse = {
        success: true,
        transactionHash: '0x1234567890abcdef',
        verificationId: 'verification_123',
        contractData: {
          businessId: '0x1234567890abcdef',
          creditScore: 85,
          defaultProbability: 10
        },
        timestamp: 1234567890
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await service.processMerchantOnboarding(
        mockFormData,
        mockVerificationResult,
        merchantAddress
      );

      expect(fetch).toHaveBeenCalledWith(`${mockBaseUrl}/api/merchant/onboard`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          formData: mockFormData,
          verificationResult: mockVerificationResult,
          merchantAddress
        })
      });

      expect(result).toEqual(mockResponse);
    });

    it('should handle backend errors', async () => {
      const mockErrorResponse = {
        success: false,
        error: 'Verification failed',
        code: 'VERIFICATION_FAILED'
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => mockErrorResponse
      });

      await expect(
        service.processMerchantOnboarding(
          mockFormData,
          mockVerificationResult,
          merchantAddress
        )
      ).rejects.toThrow('Verification failed');
    });

    it('should handle network errors', async () => {
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      await expect(
        service.processMerchantOnboarding(
          mockFormData,
          mockVerificationResult,
          merchantAddress
        )
      ).rejects.toThrow('Network error');
    });
  });

  describe('verifyIdentity', () => {
    it('should verify identity successfully', async () => {
      const mockResponse = {
        success: true,
        transactionHash: '0x1234567890abcdef',
        verificationId: 'verification_123'
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await service.verifyIdentity(
        '0xproof',
        ['0x1111', '0x2222'],
        1,
        '0xcontext',
        '0x742d35Cc6634C0532925a3b8D'
      );

      expect(fetch).toHaveBeenCalledWith(`${mockBaseUrl}/api/verify/identity`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          proof: '0xproof',
          publicSignals: ['0x1111', '0x2222'],
          attestationId: 1,
          userContextData: '0xcontext',
          merchantAddress: '0x742d35Cc6634C0532925a3b8D'
        })
      });

      expect(result).toEqual(mockResponse);
    });
  });

  describe('getVerificationStatus', () => {
    it('should get verification status successfully', async () => {
      const mockResponse = {
        isVerified: true,
        merchantAddress: '0x742d35Cc6634C0532925a3b8D',
        verificationTimestamp: 1234567890
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await service.getVerificationStatus('0x742d35Cc6634C0532925a3b8D');

      expect(fetch).toHaveBeenCalledWith(`${mockBaseUrl}/api/verify/status/0x742d35Cc6634C0532925a3b8D`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      expect(result).toEqual(mockResponse);
    });
  });

  describe('getHealthStatus', () => {
    it('should get health status successfully', async () => {
      const mockResponse = {
        status: 'healthy',
        timestamp: '2024-01-01T00:00:00.000Z',
        services: {
          selfProtocol: 'connected',
          celoNetwork: 'connected',
          contract: 'connected'
        }
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await service.getHealthStatus();

      expect(fetch).toHaveBeenCalledWith(`${mockBaseUrl}/api/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      expect(result).toEqual(mockResponse);
    });
  });

  describe('validateSelfVerificationResult', () => {
    it('should validate valid verification result', () => {
      const validResult: SelfVerificationResult = {
        isValid: true,
        credentialSubject: {
          nationality: 'US',
          age: 25
        },
        attestationId: 1,
        proof: '0xproof',
        publicSignals: ['0x1111'],
        userContextData: '0xcontext'
      };

      expect(service.validateSelfVerificationResult(validResult)).toBe(true);
    });

    it('should reject invalid verification result', () => {
      const invalidResult: SelfVerificationResult = {
        isValid: false,
        credentialSubject: {
          nationality: 'US',
          age: 25
        },
        attestationId: 1,
        proof: '0xproof',
        publicSignals: ['0x1111'],
        userContextData: '0xcontext'
      };

      expect(service.validateSelfVerificationResult(invalidResult)).toBe(false);
    });

    it('should reject verification result with missing credential subject', () => {
      const invalidResult = {
        isValid: true,
        credentialSubject: null,
        attestationId: 1,
        proof: '0xproof',
        publicSignals: ['0x1111'],
        userContextData: '0xcontext'
      } as any;

      expect(service.validateSelfVerificationResult(invalidResult)).toBe(false);
    });

    it('should reject verification result with underage user', () => {
      const underageResult: SelfVerificationResult = {
        isValid: true,
        credentialSubject: {
          nationality: 'US',
          age: 16 // Under 18
        },
        attestationId: 1,
        proof: '0xproof',
        publicSignals: ['0x1111'],
        userContextData: '0xcontext'
      };

      expect(service.validateSelfVerificationResult(underageResult)).toBe(false);
    });
  });

  describe('handleBackendError', () => {
    it('should handle different error codes', () => {
      expect(service.handleBackendError({ code: 'INVALID_VERIFICATION' }))
        .toBe('Identity verification failed. Please try again with valid credentials.');
      
      expect(service.handleBackendError({ code: 'VERIFICATION_FAILED' }))
        .toBe('Self Protocol verification failed. Please check your identity documents.');
      
      expect(service.handleBackendError({ code: 'CONTRACT_ERROR' }))
        .toBe('Blockchain transaction failed. Please try again.');
      
      expect(service.handleBackendError({ code: 'VALIDATION_ERROR' }))
        .toBe('Please check your form data and try again.');
      
      expect(service.handleBackendError({ code: 'RATE_LIMIT_EXCEEDED' }))
        .toBe('Too many requests. Please wait a moment and try again.');
    });

    it('should handle unknown error codes', () => {
      expect(service.handleBackendError({ code: 'UNKNOWN_ERROR', message: 'Custom error' }))
        .toBe('Custom error');
      
      expect(service.handleBackendError({ message: 'Generic error' }))
        .toBe('Generic error');
      
      expect(service.handleBackendError({}))
        .toBe('An unexpected error occurred. Please try again.');
    });
  });

  describe('transformFormDataForBackend', () => {
    it('should transform form data correctly', () => {
      const mockFormData: MerchantOnboardingFormData = {
        businessName: 'Test Business',
        businessType: 'sole_proprietorship',
        industry: 'technology',
        businessAge: 24,
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

      const result = service.transformFormDataForBackend(mockFormData);

      expect(result).toEqual({
        ...mockFormData,
        processedAt: expect.any(String)
      });
    });
  });
});

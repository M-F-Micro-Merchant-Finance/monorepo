import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Create a custom render function that includes providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

// Mock form data for testing
export const mockFormData = {
  businessName: 'Test Business',
  businessType: 'sole_proprietorship' as const,
  industry: 'Technology',
  businessAge: 24,
  legalStructure: 'formal' as const,
  registrationStatus: 'registered' as const,
  monthlyRevenue: {
    current: 10000,
    average: 9500,
    growthRate: 15,
    seasonality: 'medium' as const,
  },
  monthlyExpenses: {
    fixed: 3000,
    variable: 2000,
    total: 5000,
  },
  cashFlow: {
    operating: 5000,
    free: 2000,
    workingCapital: 10000,
  },
  balanceSheet: {
    totalAssets: 100000,
    currentAssets: 25000,
    totalLiabilities: 20000,
    currentLiabilities: 5000,
    equity: 80000,
  },
  fundIntention: {
    purpose: 'working_capital' as const,
    amount: {
      requested: 50000,
      minimum: 30000,
      maximum: 80000,
    },
    duration: {
      preferred: 12,
      minimum: 6,
      maximum: 18,
    },
    repaymentCapacity: {
      monthlyCapacity: 5000,
      percentageOfRevenue: 50,
    },
    collateral: {
      available: true,
      type: 'equipment' as const,
      value: 75000,
      liquidity: 'medium' as const,
    },
  },
  riskFactors: {
    marketRisk: 'medium' as const,
    operationalRisk: 'low' as const,
    financialRisk: 'low' as const,
    economicSensitivity: 'medium' as const,
    regulatoryRisk: 'low' as const,
    currencyRisk: 'low' as const,
    paymentHistory: {
      onTime: 95,
      late: 5,
      default: 0,
    },
    industryRisks: ['technology', 'competition'],
  },
  marketContext: {
    primaryMarket: 'US',
    operatingRegions: ['US', 'CA'],
    marketSize: 'small' as const,
    competitionLevel: 'medium' as const,
    marketGrowth: 'growing' as const,
  },
  complianceProfile: {
    kycLevel: 'enhanced' as const,
    amlRisk: 'low' as const,
    regulatoryRequirements: ['kyc', 'aml'],
    jurisdiction: 'US',
  },
  verificationResult: {
    isValid: true,
    credentialSubject: {
      nationality: 'US',
      age: 25,
    },
    attestationId: 1,
    proof: 'mock-proof',
    publicSignals: ['mock-signal'],
    userContextData: 'mock-context',
  },
};

// Mock verification result
export const mockVerificationResult = {
  isValid: true,
  credentialSubject: {
    nationality: 'US',
    age: 25,
  },
  attestationId: 1,
  proof: 'mock-proof',
  publicSignals: ['mock-signal'],
  userContextData: 'mock-context',
};

// Helper function to create mock form
export const createMockForm = (overrides = {}) => ({
  getValues: jest.fn().mockReturnValue({ ...mockFormData, ...overrides }),
  setValue: jest.fn(),
  watch: jest.fn().mockReturnValue(mockFormData),
  handleSubmit: jest.fn().mockImplementation((fn) => (e) => {
    e.preventDefault();
    fn(mockFormData);
  }),
  formState: {
    errors: {},
  },
  register: jest.fn(),
  ...overrides,
});

// Re-export everything
export * from '@testing-library/react';
export { customRender as render };

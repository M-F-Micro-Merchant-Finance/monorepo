// Contract types based on Shared.sol and IMerchantIdentityVerification.sol

export type Score = number; // 0-100 scale
export type Rating = number; // 1-5 scale

export enum CollateralType {
  CURRENCY = 0,
  NFT = 1,
  CRYPTO = 2,
  REAL_ESTATE = 3,
  OTHER = 4
}

export interface MerchantOnboardingData {
  // Business identification
  businessId: string; // bytes32 - hash of business name, type, industry
  countryCodeHash: string; // bytes32 - hash of country code
  creditAssessmentId: string; // bytes32 - unique assessment ID
  
  // Collateral information
  collateralAddress: string; // address
  collateralType: CollateralType; // uint8
  
  // CDS entity management
  protectionSeller: string; // address - initial protection seller
  merchantWallet: string; // address - merchant's wallet address
  
  // Core risk metrics (0-100 scale)
  creditScore: Score;
  defaultProbability: Score;
  lossGivenDefault: Score;
  recoveryRate: Score;
  
  // Business fundamentals (0-100 scale)
  businessAgeScore: Score;
  revenueStabilityScore: Score;
  marketPositionScore: Score;
  industryRiskScore: Score;
  regulatoryComplianceScore: Score;
  
  // Financial health (0-100 scale)
  liquidityScore: Score;
  leverageScore: Score;
  cashFlowScore: Score;
  profitabilityScore: Score;
  
  // Risk factors
  marketVolatility: Score; // Market volatility (0-100)
  economicCyclePosition: Rating; // Economic cycle position (1-5)
  regulatoryStability: Rating; // Regulatory stability (1-5)
  seasonality: Rating; // Seasonal impact (1-5)
}

export interface Metrics {
  financialHealth: FinancialHealth;
  marketRisk: MarketRisk;
  businessFundamentals: BusinessFundamentals;
  creditRisk: CreditRisk;
}

export interface FinancialHealth {
  liquidityScore: Score;
  leverageScore: Score;
  cashFlowScore: Score;
  profitabilityScore: Score;
}

export interface MarketRisk {
  marketVolatility: Score;
  economicCyclePosition: Rating;
  regulatoryStability: Rating;
  seasonality: Rating;
}

export interface BusinessFundamentals {
  businessAgeScore: Score;
  revenueStabilityScore: Score;
  marketPositionScore: Score;
  industryRiskScore: Score;
  regulatoryComplianceScore: Score;
}

export interface CreditRisk {
  creditScore: Score;
  defaultProbability: Score;
  lossGivenDefault: Score;
  recoveryRate: Score;
}

// Form data types for frontend
export interface MerchantOnboardingFormData {
  // Business Information
  businessName: string;
  businessType: 'sole_proprietorship' | 'partnership' | 'corporation' | 'llc' | 'other';
  industry: string;
  businessAge: number;
  legalStructure: 'formal' | 'informal';
  registrationStatus: 'registered' | 'unregistered';
  
  // Financial Information
  monthlyRevenue: {
    current: number;
    average: number;
    growthRate: number;
    seasonality: 'low' | 'medium' | 'high';
  };
  monthlyExpenses: {
    fixed: number;
    variable: number;
    total: number;
  };
  cashFlow: {
    operating: number;
    free: number;
    workingCapital: number;
  };
  balanceSheet: {
    totalAssets: number;
    currentAssets: number;
    totalLiabilities: number;
    currentLiabilities: number;
    equity: number;
  };
  
  // Funding Intentions
  fundIntention: {
    purpose: 'working_capital' | 'equipment' | 'expansion' | 'inventory' | 'other';
    amount: {
      requested: number;
      minimum: number;
      maximum: number;
    };
    duration: {
      preferred: number;
      minimum: number;
      maximum: number;
    };
    repaymentCapacity: {
      monthlyCapacity: number;
      percentageOfRevenue: number;
    };
    collateral: {
      available: boolean;
      type: 'equipment' | 'real_estate' | 'inventory' | 'crypto' | 'other';
      value: number;
      liquidity: 'low' | 'medium' | 'high';
    };
  };
  
  // Risk Factors
  riskFactors: {
    marketRisk: 'low' | 'medium' | 'high';
    operationalRisk: 'low' | 'medium' | 'high';
    financialRisk: 'low' | 'medium' | 'high';
    economicSensitivity: 'low' | 'medium' | 'high';
    regulatoryRisk: 'low' | 'medium' | 'high';
    currencyRisk: 'low' | 'medium' | 'high';
    paymentHistory: {
      onTime: number;
      late: number;
      default: number;
    };
    industryRisks: string[];
  };
  
  // Market Context
  marketContext: {
    primaryMarket: string; // 2-letter country code
    operatingRegions: string[]; // Array of 2-letter country codes
    marketSize: 'micro' | 'small' | 'medium' | 'large';
    competitionLevel: 'low' | 'medium' | 'high';
    marketGrowth: 'declining' | 'stable' | 'growing' | 'rapidly_growing';
  };
  
  // Compliance Profile
  complianceProfile: {
    kycLevel: 'basic' | 'enhanced' | 'comprehensive';
    amlRisk: 'low' | 'medium' | 'high';
    regulatoryRequirements: string[];
    jurisdiction: string; // 2-letter country code
  };
  
  // Verification result from Self Protocol
  verificationResult?: any;
}

// Self Protocol verification result
export interface SelfVerificationResult {
  isValid: boolean;
  credentialSubject: {
    nationality?: string;
    age?: number;
    gender?: string;
    // Add other disclosed attributes
  };
  attestationId: number;
  proof: string;
  publicSignals: string[];
  userContextData: string;
}

// Country information for Self Protocol integration
export interface CountryInfo {
  code: string;
  name: string;
  supported: boolean; // Whether Self Protocol supports this country
}

// Contract addresses configuration
export interface ContractAddresses {
  merchantDataMediator: string;
  cdsFactory: string;
  merchantIdentityVerification: string;
}

// Environment configuration
export interface AppConfig {
  selfAppName: string;
  selfScope: string;
  selfEndpoint: string;
  celoRpcUrl: string;
  contractAddresses: ContractAddresses;
}

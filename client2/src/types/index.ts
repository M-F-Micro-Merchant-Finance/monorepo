export interface MerchantOnboardingData {
  businessName: string;
  countryCode: string;
  businessId: string; // Hashed business name
  countryCodeHash: string; // Hashed country code
  creditAssesmentId: string;
  collateralAddress: string;
  collateralType: CollateralType;
  
  // CDS Entity Management
  protectionSeller: string;
  merchantWallet: string;

  // Core risk metrics (0-100 scale)
  creditScore: number;
  defaultProbability: number;
  lossGivenDefault: number;
  recoveryRate: number;

  // Business fundamentals (0-100 scale)
  businessAgeScore: number;
  revenueStabilityScore: number;
  marketPositionScore: number;
  industryRiskScore: number;
  regulatoryComplianceScore: number;

  // Financial health (0-100 scale)
  liquidityScore: number;
  leverageScore: number;
  cashFlowScore: number;
  profitabilityScore: number;

  // Risk factors
  marketVolatility: number;
  economicCyclePosition: number;
  regulatoryStability: number;
  seasonality: number;
}

export enum CollateralType {
  CURRENCY = 0,
  NFT = 1,
  CRYPTO = 2,
  REAL_ESTATE = 3,
  OTHER = 4
}

export interface Collateral {
  currency: string;
  collateralType: CollateralType;
}

export interface SelfProtocolData {
  scope: string;
  address: string;
  merchantData: MerchantOnboardingData;
}

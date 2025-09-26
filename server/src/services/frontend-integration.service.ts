import { 
  MerchantOnboardingFormData, 
  SelfVerificationResult,
  MerchantOnboardingData 
} from '../types/verification.types';
import { Logger } from '../utils/logger';
import { ethers } from 'ethers';

export class FrontendIntegrationService {
  private logger: Logger;

  constructor() {
    this.logger = Logger.getInstance();
  }

  /**
   * Transforms frontend form data to contract-compatible format
   */
  public transformFormDataToContractData(
    formData: MerchantOnboardingFormData,
    verificationResult: SelfVerificationResult,
    merchantAddress: string
  ): MerchantOnboardingData {
    this.logger.info('Transforming form data to contract format', {
      merchantAddress,
      businessName: formData.businessName
    });

    // Calculate business ID hash (name + type + industry + age + legal structure)
    const businessIdData = JSON.stringify({
      businessName: formData.businessName,
      businessType: formData.businessType,
      industry: formData.industry,
      businessAge: formData.businessAge,
      legalStructure: formData.legalStructure
    });
    const businessId = ethers.keccak256(ethers.toUtf8Bytes(businessIdData));

    // Calculate country code hash
    const countryCodeHash = ethers.keccak256(ethers.toUtf8Bytes(formData.marketContext.primaryMarket));

    // Generate unique credit assessment ID
    const creditAssessmentId = ethers.keccak256(
      ethers.toUtf8Bytes(`${merchantAddress}-${Date.now()}`)
    );

    // Calculate credit score based on form data
    const creditScore = this.calculateCreditScore(formData);

    // Calculate risk metrics
    const defaultProbability = this.calculateDefaultProbability(formData);
    const lossGivenDefault = this.calculateLossGivenDefault(formData);
    const recoveryRate = 100 - lossGivenDefault;

    // Calculate business fundamental scores
    const businessAgeScore = this.calculateBusinessAgeScore(formData.businessAge);
    const revenueStabilityScore = this.calculateRevenueStabilityScore(formData);
    const marketPositionScore = this.calculateMarketPositionScore(formData);
    const industryRiskScore = this.calculateIndustryRiskScore(formData);
    const regulatoryComplianceScore = this.calculateRegulatoryComplianceScore(formData);

    // Calculate financial health scores
    const liquidityScore = this.calculateLiquidityScore(formData);
    const leverageScore = this.calculateLeverageScore(formData);
    const cashFlowScore = this.calculateCashFlowScore(formData);
    const profitabilityScore = this.calculateProfitabilityScore(formData);

    // Map risk factors
    const marketVolatility = this.mapRiskLevel(formData.riskFactors.marketRisk);
    const economicCyclePosition = this.mapEconomicCycle(formData.marketContext.marketGrowth);
    const regulatoryStability = this.mapRegulatoryStability(formData.riskFactors.regulatoryRisk);
    const seasonality = this.mapSeasonality(formData.monthlyRevenue.seasonality);

    // Map collateral type
    const collateralType = this.mapCollateralType(formData.fundIntention.collateral.type);

    const contractData: MerchantOnboardingData = {
      // Business identification
      businessId,
      countryCodeHash,
      creditAssessmentId,
      
      // Collateral information
      collateralAddress: merchantAddress, // Using merchant address as collateral for now
      collateralType,
      
      // CDS entity management
      protectionSeller: merchantAddress, // Initial protection seller
      merchantWallet: merchantAddress,
      
      // Core risk metrics
      creditScore,
      defaultProbability,
      lossGivenDefault,
      recoveryRate,
      
      // Business fundamentals
      businessAgeScore,
      revenueStabilityScore,
      marketPositionScore,
      industryRiskScore,
      regulatoryComplianceScore,
      
      // Financial health
      liquidityScore,
      leverageScore,
      cashFlowScore,
      profitabilityScore,
      
      // Risk factors
      marketVolatility,
      economicCyclePosition,
      regulatoryStability,
      seasonality
    };

    this.logger.info('Form data transformation completed', {
      merchantAddress,
      creditScore,
      defaultProbability,
      businessId
    });

    return contractData;
  }

  /**
   * Validates Self Protocol verification result
   */
  public validateSelfVerificationResult(result: SelfVerificationResult): boolean {
    if (!result.isValid) {
      this.logger.warn('Self Protocol verification result is invalid');
      return false;
    }

    if (!result.credentialSubject) {
      this.logger.warn('Self Protocol verification result missing credential subject');
      return false;
    }

    // Check minimum age requirement
    const minAge = 18;
    if (result.credentialSubject.age && result.credentialSubject.age < minAge) {
      this.logger.warn('User does not meet minimum age requirement', {
        age: result.credentialSubject.age,
        minAge
      });
      return false;
    }

    this.logger.info('Self Protocol verification result validated successfully', {
      nationality: result.credentialSubject.nationality,
      age: result.credentialSubject.age
    });

    return true;
  }

  /**
   * Creates verification request for backend API
   */
  public createVerificationRequest(
    formData: MerchantOnboardingFormData,
    selfResult: SelfVerificationResult,
    merchantAddress: string
  ) {
    return {
      proof: selfResult.proof,
      publicSignals: selfResult.publicSignals,
      attestationId: selfResult.attestationId,
      userContextData: selfResult.userContextData,
      merchantAddress,
      formData // Include form data for processing
    };
  }

  // Private helper methods for calculations

  private calculateCreditScore(formData: MerchantOnboardingFormData): number {
    let score = 50; // Base score

    // Business age factor
    if (formData.businessAge >= 24) score += 20; // 2+ years
    else if (formData.businessAge >= 12) score += 10; // 1+ year
    else if (formData.businessAge >= 6) score += 5; // 6+ months

    // Payment history factor
    const onTimePercentage = formData.riskFactors.paymentHistory.onTime;
    if (onTimePercentage >= 95) score += 15;
    else if (onTimePercentage >= 85) score += 10;
    else if (onTimePercentage >= 70) score += 5;

    // Revenue stability factor
    if (formData.monthlyRevenue.growthRate > 0) score += 10;
    if (formData.monthlyRevenue.seasonality === 'low') score += 5;

    // Risk factors penalty
    const riskPenalty = this.calculateRiskPenalty(formData.riskFactors);
    score -= riskPenalty;

    // Collateral factor
    if (formData.fundIntention.collateral.available) {
      if (formData.fundIntention.collateral.liquidity === 'high') score += 10;
      else if (formData.fundIntention.collateral.liquidity === 'medium') score += 5;
    }

    return Math.max(0, Math.min(100, score));
  }

  private calculateDefaultProbability(formData: MerchantOnboardingFormData): number {
    let probability = 10; // Base probability

    // Risk factors
    const riskFactors = formData.riskFactors;
    if (riskFactors.financialRisk === 'high') probability += 15;
    if (riskFactors.operationalRisk === 'high') probability += 10;
    if (riskFactors.marketRisk === 'high') probability += 10;

    // Payment history
    const defaultRate = riskFactors.paymentHistory.default;
    probability += defaultRate;

    // Business age (newer businesses are riskier)
    if (formData.businessAge < 6) probability += 20;
    else if (formData.businessAge < 12) probability += 10;

    // Revenue volatility
    if (formData.monthlyRevenue.seasonality === 'high') probability += 5;

    return Math.min(100, probability);
  }

  private calculateLossGivenDefault(formData: MerchantOnboardingFormData): number {
    let lgd = 40; // Base LGD

    // Collateral reduces LGD
    if (formData.fundIntention.collateral.available) {
      if (formData.fundIntention.collateral.liquidity === 'high') lgd -= 20;
      else if (formData.fundIntention.collateral.liquidity === 'medium') lgd -= 10;
      else lgd -= 5;
    }

    // Business fundamentals
    if (formData.businessAge >= 24) lgd -= 5; // Established businesses
    if (formData.riskFactors.paymentHistory.onTime >= 95) lgd -= 5;

    return Math.max(0, lgd);
  }

  private calculateBusinessAgeScore(age: number): number {
    if (age >= 60) return 100; // 5+ years
    if (age >= 36) return 80;  // 3+ years
    if (age >= 24) return 60;  // 2+ years
    if (age >= 12) return 40;  // 1+ year
    if (age >= 6) return 20;   // 6+ months
    return 0;
  }

  private calculateRevenueStabilityScore(formData: MerchantOnboardingFormData): number {
    let score = 50;

    // Growth rate factor
    if (formData.monthlyRevenue.growthRate > 20) score += 20;
    else if (formData.monthlyRevenue.growthRate > 0) score += 10;
    else if (formData.monthlyRevenue.growthRate < -10) score -= 20;

    // Seasonality factor
    if (formData.monthlyRevenue.seasonality === 'low') score += 20;
    else if (formData.monthlyRevenue.seasonality === 'medium') score += 10;
    else score -= 10;

    return Math.max(0, Math.min(100, score));
  }

  private calculateMarketPositionScore(formData: MerchantOnboardingFormData): number {
    let score = 50;

    // Market size factor
    if (formData.marketContext.marketSize === 'large') score += 20;
    else if (formData.marketContext.marketSize === 'medium') score += 10;

    // Competition level
    if (formData.marketContext.competitionLevel === 'low') score += 15;
    else if (formData.marketContext.competitionLevel === 'medium') score += 5;

    // Market growth
    if (formData.marketContext.marketGrowth === 'rapidly_growing') score += 15;
    else if (formData.marketContext.marketGrowth === 'growing') score += 10;

    return Math.max(0, Math.min(100, score));
  }

  private calculateIndustryRiskScore(formData: MerchantOnboardingFormData): number {
    // Industry-specific risk scoring
    const industryRisks = formData.riskFactors.industryRisks;
    let score = 50;

    if (industryRisks.includes('seasonal')) score -= 10;
    if (industryRisks.includes('weather')) score -= 15;
    if (industryRisks.includes('price_volatility')) score -= 20;
    if (industryRisks.includes('regulatory')) score -= 10;

    return Math.max(0, Math.min(100, score));
  }

  private calculateRegulatoryComplianceScore(formData: MerchantOnboardingFormData): number {
    let score = 50;

    // Registration status
    if (formData.registrationStatus === 'registered') score += 20;
    else score -= 10;

    // Legal structure
    if (formData.legalStructure === 'formal') score += 10;

    // Compliance profile
    if (formData.complianceProfile.kycLevel === 'comprehensive') score += 15;
    else if (formData.complianceProfile.kycLevel === 'enhanced') score += 10;

    // AML risk
    if (formData.complianceProfile.amlRisk === 'low') score += 10;
    else if (formData.complianceProfile.amlRisk === 'high') score -= 15;

    return Math.max(0, Math.min(100, score));
  }

  private calculateLiquidityScore(formData: MerchantOnboardingFormData): number {
    const currentAssets = formData.balanceSheet.currentAssets;
    const currentLiabilities = formData.balanceSheet.currentLiabilities;
    
    if (currentLiabilities === 0) return 100;
    
    const currentRatio = currentAssets / currentLiabilities;
    if (currentRatio >= 2) return 100;
    if (currentRatio >= 1.5) return 80;
    if (currentRatio >= 1) return 60;
    if (currentRatio >= 0.5) return 40;
    return 20;
  }

  private calculateLeverageScore(formData: MerchantOnboardingFormData): number {
    const totalDebt = formData.balanceSheet.totalLiabilities;
    const totalAssets = formData.balanceSheet.totalAssets;
    
    if (totalAssets === 0) return 0;
    
    const leverageRatio = totalDebt / totalAssets;
    if (leverageRatio <= 0.2) return 100;
    if (leverageRatio <= 0.4) return 80;
    if (leverageRatio <= 0.6) return 60;
    if (leverageRatio <= 0.8) return 40;
    return 20;
  }

  private calculateCashFlowScore(formData: MerchantOnboardingFormData): number {
    const operatingCashFlow = formData.cashFlow.operating;
    const monthlyRevenue = formData.monthlyRevenue.current;
    
    if (monthlyRevenue === 0) return 0;
    
    const cashFlowRatio = operatingCashFlow / monthlyRevenue;
    if (cashFlowRatio >= 0.3) return 100;
    if (cashFlowRatio >= 0.2) return 80;
    if (cashFlowRatio >= 0.1) return 60;
    if (cashFlowRatio >= 0) return 40;
    return 20;
  }

  private calculateProfitabilityScore(formData: MerchantOnboardingFormData): number {
    const freeCashFlow = formData.cashFlow.free;
    const monthlyRevenue = formData.monthlyRevenue.current;
    
    if (monthlyRevenue === 0) return 0;
    
    const profitMargin = freeCashFlow / monthlyRevenue;
    if (profitMargin >= 0.2) return 100;
    if (profitMargin >= 0.1) return 80;
    if (profitMargin >= 0.05) return 60;
    if (profitMargin >= 0) return 40;
    return 20;
  }

  private calculateRiskPenalty(riskFactors: any): number {
    let penalty = 0;
    
    if (riskFactors.financialRisk === 'high') penalty += 15;
    if (riskFactors.operationalRisk === 'high') penalty += 10;
    if (riskFactors.marketRisk === 'high') penalty += 10;
    if (riskFactors.economicSensitivity === 'high') penalty += 5;
    
    return penalty;
  }

  private mapRiskLevel(risk: string): number {
    switch (risk) {
      case 'low': return 20;
      case 'medium': return 50;
      case 'high': return 80;
      default: return 50;
    }
  }

  private mapEconomicCycle(growth: string): number {
    switch (growth) {
      case 'declining': return 1;
      case 'stable': return 2;
      case 'growing': return 3;
      case 'rapidly_growing': return 4;
      default: return 2;
    }
  }

  private mapRegulatoryStability(risk: string): number {
    switch (risk) {
      case 'low': return 4;
      case 'medium': return 3;
      case 'high': return 2;
      default: return 3;
    }
  }

  private mapSeasonality(seasonality: string): number {
    switch (seasonality) {
      case 'low': return 1;
      case 'medium': return 2;
      case 'high': return 3;
      default: return 2;
    }
  }

  private mapCollateralType(type: string): number {
    switch (type) {
      case 'equipment': return 0;
      case 'real_estate': return 1;
      case 'inventory': return 2;
      case 'crypto': return 3;
      default: return 4;
    }
  }
}

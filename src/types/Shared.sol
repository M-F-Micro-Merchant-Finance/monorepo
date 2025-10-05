// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import {Currency} from "@uniswap/v4-core/src/types/Currency.sol";

type Score is uint8;
type Rating is uint8;

struct MerchantOnboardingData{
    bytes32 businessId; // NOTE: This is for market context
    bytes32 countryCodeHash; // NOTE: This is for market context
    bytes32 creditAssesmentId; // NOTE For compliance profile
    // Collateral collateral;
    address collateralAddress;
    uint8 collateralType;
    uint256 amount;
    // TODO: The amount of collateral entered ...
    
    // CDS Entity Management
    address protectionSeller; // Initial protection seller (can be changed later)
    address merchantWallet; // Merchant's wallet address for receiving tokens

    // Core risk metrics (0-100 scale)
    uint8 creditScore;
    uint8 defaultProbability;
    uint8 lossGivenDefault;
    uint8 recoveryRate;
    // uint256 correlationFactor;
    

    // Business fundamentals (0-100 scale)
    uint8 businessAgeScore;         // Based on business age
    uint8 revenueStabilityScore;    // Revenue consistency
    uint8 marketPositionScore;      // Competitive position
    uint8 industryRiskScore; 
    uint8 regulatoryComplianceScore; 

    // Financial health (0-100 scale)
    uint8 liquidityScore;           // Liquidity ratio assessment
    uint8 leverageScore;            // Debt-to-equity assessment
    uint8 cashFlowScore;            // Cash flow coverage
    uint8 profitabilityScore;       // Profit margin assessment

    // Risk factors
    // NOTE: This values can be defined on a type
    // that is 256 bits
    uint8 marketVolatility;         // Market volatility (0-100)
    uint8 economicCyclePosition;    // Economic cycle position (1-5)
    uint8 regulatoryStability;      // Regulatory stability (1-5)
    uint8 seasonality;        // Seasonal impact (1-5)

}


enum CollateralType{
    CURRENCY,
    NFT,
    CRYPTO,
    REAL_ESTATE,
    OTHER
}


struct Collateral{
    Currency currency;
    CollateralType collateralType;
    uint256 amount;
}


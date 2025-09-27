// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

// NOTE: Its is hard to verify against all the countries on-chain
// this is delegated to the back end sucha that it returns the business name hash
// of a valid country code 

// Now for the businesss Id all the name, type, industry, age and legal structure
// necessary details are handled off-chain. The back end should return
// the hash of it as well and this is the BusinessId



// const microAgricultureData = JSON.stringify({
//   businessProfile: {
//     businessName: "Green Valley Farm",
//     businessType: "sole_proprietorship",
//     industry: "agriculture",
//     businessAge: 24, // 2 years
//     legalStructure: "informal",
//     registrationStatus: "unregistered"
//   },
//   financialProfile: {
//     monthlyRevenue: {
//       current: 2500,
//       average: 2200,
//       growthRate: 15,
//       seasonality: "high"
//     },
//     monthlyExpenses: {
//       fixed: 800,
//       variable: 1200,
//       total: 2000
//     },
//     cashFlow: {
//       operating: 500,
//       free: 300,
//       workingCapital: 1500
//     },
//     balanceSheet: {
//       totalAssets: 15000,
//       currentAssets: 5000,
//       totalLiabilities: 3000,
//       currentLiabilities: 2000,
//       equity: 12000
//     }
//   },
//   fundIntention: {
//     purpose: "working_capital",
//     amount: {
//       requested: 5000,
//       minimum: 3000,
//       maximum: 8000
//     },
//     duration: {
//       preferred: 12,
//       minimum: 6,
//       maximum: 18
//     },
//     repaymentCapacity: {
//       monthlyCapacity: 400,
//       percentageOfRevenue: 16
//     },
//     collateral: {
//       available: true,
//       type: "equipment",
//       value: 8000,
//       liquidity: "medium"
//     }
//   },
//   riskFactors: {
//     marketRisk: "medium",
//     operationalRisk: "high",
//     financialRisk: "medium",
//     economicSensitivity: "high",
//     regulatoryRisk: "low",
//     currencyRisk: "low",
//     paymentHistory: {
//       onTime: 85,
//       late: 15,
//       default: 0
//     },
//     industryRisks: ["seasonal", "weather", "price_volatility"]
//   },
//   tokenParameters: {
//     supplyCalculation: {
//       baseSupply: 10000,
//       riskMultiplier: 1.2,
//       liquidityFactor: 0.8,
//       totalSupply: 9600 // Calculated
//     },
//     riskParameters: {
//       defaultProbability: 12,
//       lossGivenDefault: 40,
//       recoveryRate: 60,
//       correlationFactor: 0.3
//     },
//     pricingParameters: {
//       baseRate: 8,
//       riskPremium: 4,
//       liquidityPremium: 2,
//       finalRate: 14 // Calculated
//     }
//   },
//   marketContext: {
//     primaryMarket: "KE",
//     operatingRegions: ["KE"],
//     marketSize: "micro",
//     competitionLevel: "medium",
//     marketGrowth: "growing"
//   },
//   complianceProfile: {
//     kycLevel: "basic",
//     amlRisk: "low",
//     regulatoryRequirements: ["kyc"],
//     jurisdiction: "KE"
//   },
//   metadata: {
//     timestamp: Date.now(),
//     version: "1.0",
//     verificationId: "merchant_001",
//     dataSource: "self_reported",
//     confidence: "medium"
//   }
// });

import "./self/ISelfVerificationRoot.sol";
import {Currency} from "@uniswap/v4-core/src/types/Currency.sol";
import {SelfStructs} from "../libraries/self/SelfStructs.sol";
interface IMerchantIdentityVerification is  ISelfVerificationRoot{
    struct SelfConfig{
        bytes32 configId;
        SelfStructs.VerificationConfigV2 verificationConfig;
    }

    event MerchantVerified(
        address indexed merchant,
        uint256 documentType,
        uint256 timestamp,
        uint256 nullifier
    );

    event VerificationRevoked(
        address indexed merchant,
        uint256 timestamp,
        string reason
    );
    
    event VerificationUpdated(
        address indexed merchant,
        uint256 newDocumentType,
        uint256 timestamp
    );

    event VerificationConfigUpdated(
        bytes32 indexed configId
    );

    event MinAgeRequirementUpdated(
        uint256 newMinAgeRequirement
    );

    error MinAgeRequirementTooLow();
    error VerificationConfigNotFound();
    error MechantAlreadyVerified();
    error InvalidMerchantAddress();
    error UnderageMerchant();
    
    function verifyMerchantIdentity(
        bytes calldata proofPayload,
        bytes calldata userContextData
    ) external;

    function setMinAgeRequirement(uint256 _minAgeRequirement) external;
    function isVerifiedMerchant(bytes32 _creditAssesmentId) external view returns (bool);



}
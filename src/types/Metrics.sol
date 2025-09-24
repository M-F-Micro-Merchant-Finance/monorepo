// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;


import {FinancialHealth, FinancialHealthLibrary} from "./FinancialHealth.sol";
import {MarketRisk, MarketRiskLibrary} from "./MarketRisk.sol";
import {BusinessFundamentals, BusinessFundamentalsLibrary} from "./BusinessFundamentals.sol";
import {CreditRisk, CreditRiskLibrary} from "./CreditRisk.sol";

import "./Shared.sol";

struct Metrics{
    FinancialHealth financialHealth;
    MarketRisk marketRisk;
    BusinessFundamentals businessFundamentals;
    CreditRisk creditRisk;
}

library MetricsLibrary {
    function buildMetrics(MerchantOnboardingData memory merchantOnboardingData) internal pure returns (Metrics memory) {
        return Metrics(
            FinancialHealthLibrary.pack(
                Score.wrap(merchantOnboardingData.liquidityScore),
                Score.wrap(merchantOnboardingData.leverageScore),
                Score.wrap(merchantOnboardingData.cashFlowScore),
                Score.wrap(merchantOnboardingData.profitabilityScore)
            ),
            MarketRiskLibrary.pack(
                Score.wrap(merchantOnboardingData.marketVolatility),
                Rating.wrap(merchantOnboardingData.economicCyclePosition),
                Rating.wrap(merchantOnboardingData.regulatoryStability),
                Rating.wrap(merchantOnboardingData.seasonality)
            ),
            BusinessFundamentalsLibrary.pack(
                Score.wrap(merchantOnboardingData.businessAgeScore),
                Score.wrap(merchantOnboardingData.revenueStabilityScore),
                Score.wrap(merchantOnboardingData.marketPositionScore),
                Score.wrap(merchantOnboardingData.industryRiskScore),
                Score.wrap(merchantOnboardingData.regulatoryComplianceScore)
            ),
            CreditRiskLibrary.pack(
                Score.wrap(merchantOnboardingData.creditScore),
                Score.wrap(merchantOnboardingData.defaultProbability),
                Score.wrap(merchantOnboardingData.lossGivenDefault),
                Score.wrap(merchantOnboardingData.recoveryRate)
            )
        );
    }
}
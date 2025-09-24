// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import {Score} from "./Shared.sol";

// // Business fundamentals (0-100 scale)
// uint256 businessAgeScore;         // Based on business age
// uint256 revenueStabilityScore;    // Revenue consistency
// uint256 marketPositionScore;      // Competitive position
// uint256 industryRiskScore; 
// uint256 regulatoryComplianceScore;

type BusinessFundamentals is uint256;

library BusinessFundamentalsLibrary {
    // Constants for bit positions and masks
    uint256 private constant SCORE_BITS = 8;
    uint256 private constant SCORE_MASK = (1 << SCORE_BITS) - 1; // 0xFF
    
    // Bit positions for each score
    uint256 private constant BUSINESS_AGE_POS = 0;
    uint256 private constant REVENUE_STABILITY_POS = 8;
    uint256 private constant MARKET_POSITION_POS = 16;
    uint256 private constant INDUSTRY_RISK_POS = 24;
    uint256 private constant REGULATORY_COMPLIANCE_POS = 32;
    
    /**
     * @dev Packs five business fundamental scores into a single uint256
     * @param _businessAgeScore Business age score (0-100)
     * @param _revenueStabilityScore Revenue stability score (0-100)
     * @param _marketPositionScore Market position score (0-100)
     * @param _industryRiskScore Industry risk score (0-100)
     * @param _regulatoryComplianceScore Regulatory compliance score (0-100)
     * @return Packed business fundamentals data
     */
    function pack(
        Score _businessAgeScore,
        Score _revenueStabilityScore,
        Score _marketPositionScore,
        Score _industryRiskScore,
        Score _regulatoryComplianceScore
    ) internal pure returns (BusinessFundamentals) {
        uint256 businessAge = uint256(Score.unwrap(_businessAgeScore));
        uint256 revenueStability = uint256(Score.unwrap(_revenueStabilityScore));
        uint256 marketPosition = uint256(Score.unwrap(_marketPositionScore));
        uint256 industryRisk = uint256(Score.unwrap(_industryRiskScore));
        uint256 regulatoryCompliance = uint256(Score.unwrap(_regulatoryComplianceScore));
        
        // Validate ranges (0-100)
        require(businessAge <= 100, "Business age score out of range");
        require(revenueStability <= 100, "Revenue stability score out of range");
        require(marketPosition <= 100, "Market position score out of range");
        require(industryRisk <= 100, "Industry risk score out of range");
        require(regulatoryCompliance <= 100, "Regulatory compliance score out of range");
        
        uint256 packed = 0;
        packed |= (businessAge << BUSINESS_AGE_POS);
        packed |= (revenueStability << REVENUE_STABILITY_POS);
        packed |= (marketPosition << MARKET_POSITION_POS);
        packed |= (industryRisk << INDUSTRY_RISK_POS);
        packed |= (regulatoryCompliance << REGULATORY_COMPLIANCE_POS);
        
        return BusinessFundamentals.wrap(packed);
    }
    
    /**
     * @dev Unpacks business fundamentals data into individual scores
     * @param _businessFundamentals Packed business fundamentals data
     * @return businessAgeScore Business age score
     * @return revenueStabilityScore Revenue stability score
     * @return marketPositionScore Market position score
     * @return industryRiskScore Industry risk score
     * @return regulatoryComplianceScore Regulatory compliance score
     */
    function unpack(BusinessFundamentals _businessFundamentals) internal pure returns (
        Score businessAgeScore,
        Score revenueStabilityScore,
        Score marketPositionScore,
        Score industryRiskScore,
        Score regulatoryComplianceScore
    ) {
        uint256 packed = BusinessFundamentals.unwrap(_businessFundamentals);
        
        businessAgeScore = Score.wrap(uint8((packed >> BUSINESS_AGE_POS) & SCORE_MASK));
        revenueStabilityScore = Score.wrap(uint8((packed >> REVENUE_STABILITY_POS) & SCORE_MASK));
        marketPositionScore = Score.wrap(uint8((packed >> MARKET_POSITION_POS) & SCORE_MASK));
        industryRiskScore = Score.wrap(uint8((packed >> INDUSTRY_RISK_POS) & SCORE_MASK));
        regulatoryComplianceScore = Score.wrap(uint8((packed >> REGULATORY_COMPLIANCE_POS) & SCORE_MASK));
    }
    
    /**
     * @dev Gets business age score
     * @param _businessFundamentals Packed business fundamentals data
     * @return Business age score
     */
    function getBusinessAgeScore(BusinessFundamentals _businessFundamentals) internal pure returns (Score) {
        uint256 packed = BusinessFundamentals.unwrap(_businessFundamentals);
        return Score.wrap(uint8((packed >> BUSINESS_AGE_POS) & SCORE_MASK));
    }
    
    /**
     * @dev Gets revenue stability score
     * @param _businessFundamentals Packed business fundamentals data
     * @return Revenue stability score
     */
    function getRevenueStabilityScore(BusinessFundamentals _businessFundamentals) internal pure returns (Score) {
        uint256 packed = BusinessFundamentals.unwrap(_businessFundamentals);
        return Score.wrap(uint8((packed >> REVENUE_STABILITY_POS) & SCORE_MASK));
    }
    
    /**
     * @dev Gets market position score
     * @param _businessFundamentals Packed business fundamentals data
     * @return Market position score
     */
    function getMarketPositionScore(BusinessFundamentals _businessFundamentals) internal pure returns (Score) {
        uint256 packed = BusinessFundamentals.unwrap(_businessFundamentals);
        return Score.wrap(uint8((packed >> MARKET_POSITION_POS) & SCORE_MASK));
    }
    
    /**
     * @dev Gets industry risk score
     * @param _businessFundamentals Packed business fundamentals data
     * @return Industry risk score
     */
    function getIndustryRiskScore(BusinessFundamentals _businessFundamentals) internal pure returns (Score) {
        uint256 packed = BusinessFundamentals.unwrap(_businessFundamentals);
        return Score.wrap(uint8((packed >> INDUSTRY_RISK_POS) & SCORE_MASK));
    }
    
    /**
     * @dev Gets regulatory compliance score
     * @param _businessFundamentals Packed business fundamentals data
     * @return Regulatory compliance score
     */
    function getRegulatoryComplianceScore(BusinessFundamentals _businessFundamentals) internal pure returns (Score) {
        uint256 packed = BusinessFundamentals.unwrap(_businessFundamentals);
        return Score.wrap(uint8((packed >> REGULATORY_COMPLIANCE_POS) & SCORE_MASK));
    }
    
    /**
     * @dev Updates a specific score in the packed data
     * @param _businessFundamentals Current packed business fundamentals data
     * @param _scoreType Type of score to update (0=businessAge, 1=revenueStability, 2=marketPosition, 3=industryRisk, 4=regulatoryCompliance)
     * @param _newScore New score value
     * @return Updated packed business fundamentals data
     */
    function updateScore(
        BusinessFundamentals _businessFundamentals,
        uint8 _scoreType,
        Score _newScore
    ) internal pure returns (BusinessFundamentals) {
        uint256 packed = BusinessFundamentals.unwrap(_businessFundamentals);
        uint256 newScoreValue = uint256(Score.unwrap(_newScore));
        
        require(newScoreValue <= 100, "Score out of range");
        require(_scoreType < 5, "Invalid score type");
        
        // Clear the existing score
        uint256 bitPosition = _scoreType * SCORE_BITS;
        packed &= ~(SCORE_MASK << bitPosition);
        
        // Set the new score
        packed |= (newScoreValue << bitPosition);
        
        return BusinessFundamentals.wrap(packed);
    }
    
    /**
     * @dev Calculates a weighted business fundamentals score
     * @param _businessFundamentals Packed business fundamentals data
     * @param _weights Array of weights [businessAge, revenueStability, marketPosition, industryRisk, regulatoryCompliance]
     * @return Weighted business fundamentals score
     */
    function calculateWeightedScore(
        BusinessFundamentals _businessFundamentals,
        uint256[5] memory _weights
    ) internal pure returns (uint256) {
        (Score businessAge, Score revenueStability, Score marketPosition, Score industryRisk, Score regulatoryCompliance) = unpack(_businessFundamentals);
        
        uint256 weightedSum = 
            uint256(Score.unwrap(businessAge)) * _weights[0] +
            uint256(Score.unwrap(revenueStability)) * _weights[1] +
            uint256(Score.unwrap(marketPosition)) * _weights[2] +
            uint256(Score.unwrap(industryRisk)) * _weights[3] +
            uint256(Score.unwrap(regulatoryCompliance)) * _weights[4];
            
        uint256 totalWeight = _weights[0] + _weights[1] + _weights[2] + _weights[3] + _weights[4];
        
        return totalWeight > 0 ? weightedSum / totalWeight : 0;
    }
    
    /**
     * @dev Calculates overall business health score with default weights
     * @param _businessFundamentals Packed business fundamentals data
     * @return Overall business health score (0-100)
     */
    function calculateBusinessHealthScore(BusinessFundamentals _businessFundamentals) internal pure returns (uint256) {
        // Default weights: [businessAge: 20%, revenueStability: 30%, marketPosition: 25%, industryRisk: 15%, regulatoryCompliance: 10%]
        uint256[5] memory defaultWeights = [uint256(20), uint256(30), uint256(25), uint256(15), uint256(10)];
        return calculateWeightedScore(_businessFundamentals, defaultWeights);
    }
}
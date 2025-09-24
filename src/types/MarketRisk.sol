// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import {Score} from "./Shared.sol";
import {Rating} from "./Shared.sol";

// // Risk factors
// // NOTE: This values can be defined on a type
// // that is 256 bits
// uint256 marketVolatility;         // Market volatility (0-100)
// uint256 economicCyclePosition;    // Economic cycle position (1-5)
// uint256 regulatoryStability;      // Regulatory stability (1-5)
// uint256 seasonality;        // Seasonal impact (1-5)

type MarketRisk is uint256;

library MarketRiskLibrary {
    // Constants for bit positions and masks
    uint256 private constant SCORE_BITS = 8;
    uint256 private constant RATING_BITS = 3; // 1-5 fits in 3 bits
    uint256 private constant SCORE_MASK = (1 << SCORE_BITS) - 1; // 0xFF
    uint256 private constant RATING_MASK = (1 << RATING_BITS) - 1; // 0x7
    
    // Bit positions for each field
    uint256 private constant MARKET_VOLATILITY_POS = 0;        // 8 bits (Score: 0-100)
    uint256 private constant ECONOMIC_CYCLE_POS = 8;           // 3 bits (Rating: 1-5)
    uint256 private constant REGULATORY_STABILITY_POS = 11;    // 3 bits (Rating: 1-5)
    uint256 private constant SEASONALITY_POS = 14;             // 3 bits (Rating: 1-5)
    
    /**
     * @dev Packs market risk data into a single uint256
     * @param _marketVolatility Market volatility (0-100)
     * @param _economicCyclePosition Economic cycle position (1-5)
     * @param _regulatoryStability Regulatory stability (1-5)
     * @param _seasonality Seasonal impact (1-5)
     * @return Packed market risk data
     */
    function pack(
        Score _marketVolatility,
        Rating _economicCyclePosition,
        Rating _regulatoryStability,
        Rating _seasonality
    ) internal pure returns (MarketRisk) {
        uint256 marketVolatility = uint256(Score.unwrap(_marketVolatility));
        uint256 economicCycle = uint256(Rating.unwrap(_economicCyclePosition));
        uint256 regulatoryStability = uint256(Rating.unwrap(_regulatoryStability));
        uint256 seasonality = uint256(Rating.unwrap(_seasonality));
        
        // Validate ranges
        require(marketVolatility <= 100, "Market volatility out of range");
        require(economicCycle >= 1 && economicCycle <= 5, "Economic cycle position out of range");
        require(regulatoryStability >= 1 && regulatoryStability <= 5, "Regulatory stability out of range");
        require(seasonality >= 1 && seasonality <= 5, "Seasonality out of range");
        
        uint256 packed = 0;
        packed |= (marketVolatility << MARKET_VOLATILITY_POS);
        packed |= (economicCycle << ECONOMIC_CYCLE_POS);
        packed |= (regulatoryStability << REGULATORY_STABILITY_POS);
        packed |= (seasonality << SEASONALITY_POS);
        
        return MarketRisk.wrap(packed);
    }
    
    /**
     * @dev Unpacks market risk data into individual values
     * @param _marketRisk Packed market risk data
     * @return marketVolatility Market volatility
     * @return economicCyclePosition Economic cycle position
     * @return regulatoryStability Regulatory stability
     * @return seasonality Seasonal impact
     */
    function unpack(MarketRisk _marketRisk) internal pure returns (
        Score marketVolatility,
        Rating economicCyclePosition,
        Rating regulatoryStability,
        Rating seasonality
    ) {
        uint256 packed = MarketRisk.unwrap(_marketRisk);
        
        marketVolatility = Score.wrap(uint8((packed >> MARKET_VOLATILITY_POS) & SCORE_MASK));
        economicCyclePosition = Rating.wrap(uint8((packed >> ECONOMIC_CYCLE_POS) & RATING_MASK));
        regulatoryStability = Rating.wrap(uint8((packed >> REGULATORY_STABILITY_POS) & RATING_MASK));
        seasonality = Rating.wrap(uint8((packed >> SEASONALITY_POS) & RATING_MASK));
    }
    
    /**
     * @dev Gets market volatility score
     * @param _marketRisk Packed market risk data
     * @return Market volatility score
     */
    function getMarketVolatility(MarketRisk _marketRisk) internal pure returns (Score) {
        uint256 packed = MarketRisk.unwrap(_marketRisk);
        return Score.wrap(uint8((packed >> MARKET_VOLATILITY_POS) & SCORE_MASK));
    }
    
    /**
     * @dev Gets economic cycle position rating
     * @param _marketRisk Packed market risk data
     * @return Economic cycle position rating
     */
    function getEconomicCyclePosition(MarketRisk _marketRisk) internal pure returns (Rating) {
        uint256 packed = MarketRisk.unwrap(_marketRisk);
        return Rating.wrap(uint8((packed >> ECONOMIC_CYCLE_POS) & RATING_MASK));
    }
    
    /**
     * @dev Gets regulatory stability rating
     * @param _marketRisk Packed market risk data
     * @return Regulatory stability rating
     */
    function getRegulatoryStability(MarketRisk _marketRisk) internal pure returns (Rating) {
        uint256 packed = MarketRisk.unwrap(_marketRisk);
        return Rating.wrap(uint8((packed >> REGULATORY_STABILITY_POS) & RATING_MASK));
    }
    
    /**
     * @dev Gets seasonality rating
     * @param _marketRisk Packed market risk data
     * @return Seasonality rating
     */
    function getSeasonality(MarketRisk _marketRisk) internal pure returns (Rating) {
        uint256 packed = MarketRisk.unwrap(_marketRisk);
        return Rating.wrap(uint8((packed >> SEASONALITY_POS) & RATING_MASK));
    }
    
    /**
     * @dev Updates a specific field in the packed data
     * @param _marketRisk Current packed market risk data
     * @param _fieldType Type of field to update (0=marketVolatility, 1=economicCycle, 2=regulatoryStability, 3=seasonality)
     * @param _newValue New value (Score for marketVolatility, Rating for others)
     * @return Updated packed market risk data
     */
    function updateField(
        MarketRisk _marketRisk,
        uint8 _fieldType,
        uint8 _newValue
    ) internal pure returns (MarketRisk) {
        uint256 packed = MarketRisk.unwrap(_marketRisk);
        
        require(_fieldType < 4, "Invalid field type");
        
        if (_fieldType == 0) {
            // Market volatility (Score: 0-100)
            require(_newValue <= 100, "Market volatility out of range");
            packed &= ~(SCORE_MASK << MARKET_VOLATILITY_POS);
            packed |= (uint256(_newValue) << MARKET_VOLATILITY_POS);
        } else {
            // Rating fields (1-5)
            require(_newValue >= 1 && _newValue <= 5, "Rating out of range");
            uint256 bitPosition = _fieldType == 1 ? ECONOMIC_CYCLE_POS : 
                                 _fieldType == 2 ? REGULATORY_STABILITY_POS : SEASONALITY_POS;
            packed &= ~(RATING_MASK << bitPosition);
            packed |= (uint256(_newValue) << bitPosition);
        }
        
        return MarketRisk.wrap(packed);
    }
    
    /**
     * @dev Calculates overall market risk score
     * @param _marketRisk Packed market risk data
     * @return Overall market risk score (0-100)
     */
    function calculateMarketRiskScore(MarketRisk _marketRisk) internal pure returns (uint256) {
        (Score marketVolatility, Rating economicCycle, Rating regulatoryStability, Rating seasonality) = unpack(_marketRisk);
        
        // Convert ratings to 0-100 scale for calculation
        uint256 economicCycleScore = (uint256(Rating.unwrap(economicCycle)) - 1) * 25; // 1-5 -> 0-100
        uint256 regulatoryStabilityScore = (uint256(Rating.unwrap(regulatoryStability)) - 1) * 25; // 1-5 -> 0-100
        uint256 seasonalityScore = (uint256(Rating.unwrap(seasonality)) - 1) * 25; // 1-5 -> 0-100
        
        // Weighted calculation: volatility 40%, others 20% each
        uint256 weightedSum = 
            uint256(Score.unwrap(marketVolatility)) * 40 +
            economicCycleScore * 20 +
            regulatoryStabilityScore * 20 +
            seasonalityScore * 20;
            
        return weightedSum / 100;
    }
    
    /**
     * @dev Calculates market stability index (inverse of risk)
     * @param _marketRisk Packed market risk data
     * @return Market stability index (0-100, higher is more stable)
     */
    function calculateMarketStabilityIndex(MarketRisk _marketRisk) internal pure returns (uint256) {
        uint256 riskScore = calculateMarketRiskScore(_marketRisk);
        return 100 - riskScore;
    }
    
    /**
     * @dev Calculates economic cycle risk factor
     * @param _marketRisk Packed market risk data
     * @return Economic cycle risk factor (0-100)
     */
    function calculateEconomicCycleRiskFactor(MarketRisk _marketRisk) internal pure returns (uint256) {
        Rating economicCycle = getEconomicCyclePosition(_marketRisk);
        uint256 cycleValue = uint256(Rating.unwrap(economicCycle));
        
        // Risk increases as we move away from the middle (3)
        // 1 and 5 are highest risk, 3 is lowest risk
        if (cycleValue == 3) return 0; // Optimal position
        if (cycleValue == 2 || cycleValue == 4) return 25; // Moderate risk
        return 50; // High risk (1 or 5)
    }
    
    /**
     * @dev Calculates seasonal risk adjustment
     * @param _marketRisk Packed market risk data
     * @return Seasonal risk adjustment multiplier (0.5-1.5)
     */
    function calculateSeasonalRiskAdjustment(MarketRisk _marketRisk) internal pure returns (uint256) {
        Rating seasonality = getSeasonality(_marketRisk);
        uint256 seasonalityValue = uint256(Rating.unwrap(seasonality));
        
        // Convert 1-5 rating to 0.5-1.5 multiplier
        // 1 = low seasonality (0.5x), 5 = high seasonality (1.5x)
        return 500 + (seasonalityValue - 1) * 250; // 500-1500 (0.5-1.5 as basis points)
    }
    
    /**
     * @dev Checks if market conditions are favorable for lending
     * @param _marketRisk Packed market risk data
     * @return True if conditions are favorable
     */
    function isFavorableForLending(MarketRisk _marketRisk) internal pure returns (bool) {
        uint256 riskScore = calculateMarketRiskScore(_marketRisk);
        Rating economicCycle = getEconomicCyclePosition(_marketRisk);
        Rating regulatoryStability = getRegulatoryStability(_marketRisk);
        
        // Favorable if: low risk score, good economic cycle, stable regulation
        return riskScore <= 40 && 
               uint256(Rating.unwrap(economicCycle)) >= 3 && 
               uint256(Rating.unwrap(regulatoryStability)) >= 3;
    }
}
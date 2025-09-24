// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import {Score} from "./Shared.sol";
// // Financial health (0-100 scale)
// uint256 liquidityScore;           // Liquidity ratio assessment
// uint256 leverageScore;            // Debt-to-equity assessment
// uint256 cashFlowScore;            // Cash flow coverage
// uint256 profitabilityScore;       // Profit margin assessment

type FinancialHealth is uint256;

library FinancialHealthLibrary {
    // Constants for bit positions and masks
    uint256 private constant SCORE_BITS = 8;
    uint256 private constant SCORE_MASK = (1 << SCORE_BITS) - 1; // 0xFF
    
    // Bit positions for each score
    uint256 private constant LIQUIDITY_POS = 0;
    uint256 private constant LEVERAGE_POS = 8;
    uint256 private constant CASH_FLOW_POS = 16;
    uint256 private constant PROFITABILITY_POS = 24;
    
    /**
     * @dev Packs four financial health scores into a single uint256
     * @param _liquidityScore Liquidity ratio assessment (0-100)
     * @param _leverageScore Debt-to-equity assessment (0-100)
     * @param _cashFlowScore Cash flow coverage (0-100)
     * @param _profitabilityScore Profit margin assessment (0-100)
     * @return Packed financial health data
     */
    function pack(
        Score _liquidityScore,
        Score _leverageScore,
        Score _cashFlowScore,
        Score _profitabilityScore
    ) internal pure returns (FinancialHealth) {
        uint256 liquidity = uint256(Score.unwrap(_liquidityScore));
        uint256 leverage = uint256(Score.unwrap(_leverageScore));
        uint256 cashFlow = uint256(Score.unwrap(_cashFlowScore));
        uint256 profitability = uint256(Score.unwrap(_profitabilityScore));
        
        // Validate ranges (0-100)
        require(liquidity <= 100, "Liquidity score out of range");
        require(leverage <= 100, "Leverage score out of range");
        require(cashFlow <= 100, "Cash flow score out of range");
        require(profitability <= 100, "Profitability score out of range");
        
        uint256 packed = 0;
        packed |= (liquidity << LIQUIDITY_POS);
        packed |= (leverage << LEVERAGE_POS);
        packed |= (cashFlow << CASH_FLOW_POS);
        packed |= (profitability << PROFITABILITY_POS);
        
        return FinancialHealth.wrap(packed);
    }
    
    /**
     * @dev Unpacks financial health data into individual scores
     * @param _financialHealth Packed financial health data
     * @return liquidityScore Liquidity ratio assessment
     * @return leverageScore Debt-to-equity assessment
     * @return cashFlowScore Cash flow coverage
     * @return profitabilityScore Profit margin assessment
     */
    function unpack(FinancialHealth _financialHealth) internal pure returns (
        Score liquidityScore,
        Score leverageScore,
        Score cashFlowScore,
        Score profitabilityScore
    ) {
        uint256 packed = FinancialHealth.unwrap(_financialHealth);
        
        liquidityScore = Score.wrap(uint8((packed >> LIQUIDITY_POS) & SCORE_MASK));
        leverageScore = Score.wrap(uint8((packed >> LEVERAGE_POS) & SCORE_MASK));
        cashFlowScore = Score.wrap(uint8((packed >> CASH_FLOW_POS) & SCORE_MASK));
        profitabilityScore = Score.wrap(uint8((packed >> PROFITABILITY_POS) & SCORE_MASK));
    }
    
    /**
     * @dev Gets liquidity score
     * @param _financialHealth Packed financial health data
     * @return Liquidity score
     */
    function getLiquidityScore(FinancialHealth _financialHealth) internal pure returns (Score) {
        uint256 packed = FinancialHealth.unwrap(_financialHealth);
        return Score.wrap(uint8((packed >> LIQUIDITY_POS) & SCORE_MASK));
    }
    
    /**
     * @dev Gets leverage score
     * @param _financialHealth Packed financial health data
     * @return Leverage score
     */
    function getLeverageScore(FinancialHealth _financialHealth) internal pure returns (Score) {
        uint256 packed = FinancialHealth.unwrap(_financialHealth);
        return Score.wrap(uint8((packed >> LEVERAGE_POS) & SCORE_MASK));
    }
    
    /**
     * @dev Gets cash flow score
     * @param _financialHealth Packed financial health data
     * @return Cash flow score
     */
    function getCashFlowScore(FinancialHealth _financialHealth) internal pure returns (Score) {
        uint256 packed = FinancialHealth.unwrap(_financialHealth);
        return Score.wrap(uint8((packed >> CASH_FLOW_POS) & SCORE_MASK));
    }
    
    /**
     * @dev Gets profitability score
     * @param _financialHealth Packed financial health data
     * @return Profitability score
     */
    function getProfitabilityScore(FinancialHealth _financialHealth) internal pure returns (Score) {
        uint256 packed = FinancialHealth.unwrap(_financialHealth);
        return Score.wrap(uint8((packed >> PROFITABILITY_POS) & SCORE_MASK));
    }
    
    /**
     * @dev Updates a specific score in the packed data
     * @param _financialHealth Current packed financial health data
     * @param _scoreType Type of score to update (0=liquidity, 1=leverage, 2=cashFlow, 3=profitability)
     * @param _newScore New score value
     * @return Updated packed financial health data
     */
    function updateScore(
        FinancialHealth _financialHealth,
        uint8 _scoreType,
        Score _newScore
    ) internal pure returns (FinancialHealth) {
        uint256 packed = FinancialHealth.unwrap(_financialHealth);
        uint256 newScoreValue = uint256(Score.unwrap(_newScore));
        
        require(newScoreValue <= 100, "Score out of range");
        require(_scoreType < 4, "Invalid score type");
        
        // Clear the existing score
        uint256 bitPosition = _scoreType * SCORE_BITS;
        packed &= ~(SCORE_MASK << bitPosition);
        
        // Set the new score
        packed |= (newScoreValue << bitPosition);
        
        return FinancialHealth.wrap(packed);
    }
    
    /**
     * @dev Calculates a weighted financial health score
     * @param _financialHealth Packed financial health data
     * @param _weights Array of weights [liquidity, leverage, cashFlow, profitability]
     * @return Weighted financial health score
     */
    function calculateWeightedScore(
        FinancialHealth _financialHealth,
        uint256[4] memory _weights
    ) internal pure returns (uint256) {
        (Score liquidity, Score leverage, Score cashFlow, Score profitability) = unpack(_financialHealth);
        
        uint256 weightedSum = 
            uint256(Score.unwrap(liquidity)) * _weights[0] +
            uint256(Score.unwrap(leverage)) * _weights[1] +
            uint256(Score.unwrap(cashFlow)) * _weights[2] +
            uint256(Score.unwrap(profitability)) * _weights[3];
            
        uint256 totalWeight = _weights[0] + _weights[1] + _weights[2] + _weights[3];
        
        return totalWeight > 0 ? weightedSum / totalWeight : 0;
    }
    
    /**
     * @dev Calculates overall financial health score with default weights
     * @param _financialHealth Packed financial health data
     * @return Overall financial health score (0-100)
     */
    function calculateFinancialHealthScore(FinancialHealth _financialHealth) internal pure returns (uint256) {
        // Default weights: [liquidity: 30%, leverage: 25%, cashFlow: 30%, profitability: 15%]
        uint256[4] memory defaultWeights = [uint256(30), uint256(25), uint256(30), uint256(15)];
        return calculateWeightedScore(_financialHealth, defaultWeights);
    }
    
    /**
     * @dev Calculates financial stability ratio (liquidity + cash flow) / 2
     * @param _financialHealth Packed financial health data
     * @return Financial stability ratio (0-100)
     */
    function calculateFinancialStabilityRatio(FinancialHealth _financialHealth) internal pure returns (uint256) {
        Score liquidity = getLiquidityScore(_financialHealth);
        Score cashFlow = getCashFlowScore(_financialHealth);
        
        return (uint256(Score.unwrap(liquidity)) + uint256(Score.unwrap(cashFlow))) / 2;
    }
    
    /**
     * @dev Calculates risk-adjusted profitability (profitability adjusted by leverage risk)
     * @param _financialHealth Packed financial health data
     * @return Risk-adjusted profitability score (0-100)
     */
    function calculateRiskAdjustedProfitability(FinancialHealth _financialHealth) internal pure returns (uint256) {
        Score profitability = getProfitabilityScore(_financialHealth);
        Score leverage = getLeverageScore(_financialHealth);
        
        // Higher leverage (lower score) reduces profitability
        uint256 leverageAdjustment = uint256(Score.unwrap(leverage));
        uint256 baseProfitability = uint256(Score.unwrap(profitability));
        
        // Risk adjustment: profitability * (leverage_score / 100)
        return (baseProfitability * leverageAdjustment) / 100;
    }
}
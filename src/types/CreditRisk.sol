// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import {Score} from "./Shared.sol";


// Score credit;
// Score defaultProbability;
// Score lossGivenDefault;
// Score recoveryRate;

// credit | defaultProbability | lossGivenDefault | recoveryRate | empty ...
type CreditRisk is uint256;

library CreditRiskLibrary {
    // Constants for bit positions and masks
    uint256 private constant SCORE_BITS = 8;
    uint256 private constant SCORE_MASK = (1 << SCORE_BITS) - 1; // 0xFF
    
    // Bit positions for each score
    uint256 private constant CREDIT_POS = 0;
    uint256 private constant DEFAULT_PROBABILITY_POS = 8;
    uint256 private constant LOSS_GIVEN_DEFAULT_POS = 16;
    uint256 private constant RECOVERY_RATE_POS = 24;
    
    /**
     * @dev Packs four credit risk scores into a single uint256
     * @param _credit Credit score (0-100)
     * @param _defaultProbability Default probability (0-100)
     * @param _lossGivenDefault Loss given default (0-100)
     * @param _recoveryRate Recovery rate (0-100)
     * @return Packed credit risk data
     */
    function pack(
        Score _credit,
        Score _defaultProbability,
        Score _lossGivenDefault,
        Score _recoveryRate
    ) internal pure returns (CreditRisk) {
        uint256 credit = uint256(Score.unwrap(_credit));
        uint256 defaultProbability = uint256(Score.unwrap(_defaultProbability));
        uint256 lossGivenDefault = uint256(Score.unwrap(_lossGivenDefault));
        uint256 recoveryRate = uint256(Score.unwrap(_recoveryRate));
        
        // Validate ranges (0-100)
        require(credit <= 100, "Credit score out of range");
        require(defaultProbability <= 100, "Default probability out of range");
        require(lossGivenDefault <= 100, "Loss given default out of range");
        require(recoveryRate <= 100, "Recovery rate out of range");
        
        uint256 packed = 0;
        packed |= (credit << CREDIT_POS);
        packed |= (defaultProbability << DEFAULT_PROBABILITY_POS);
        packed |= (lossGivenDefault << LOSS_GIVEN_DEFAULT_POS);
        packed |= (recoveryRate << RECOVERY_RATE_POS);
        
        return CreditRisk.wrap(packed);
    }
    
    /**
     * @dev Unpacks credit risk data into individual scores
     * @param _creditRisk Packed credit risk data
     * @return credit Credit score
     * @return defaultProbability Default probability
     * @return lossGivenDefault Loss given default
     * @return recoveryRate Recovery rate
     */
    function unpack(CreditRisk _creditRisk) internal pure returns (
        Score credit,
        Score defaultProbability,
        Score lossGivenDefault,
        Score recoveryRate
    ) {
        uint256 packed = CreditRisk.unwrap(_creditRisk);
        
        credit = Score.wrap(uint8((packed >> CREDIT_POS) & SCORE_MASK));
        defaultProbability = Score.wrap(uint8((packed >> DEFAULT_PROBABILITY_POS) & SCORE_MASK));
        lossGivenDefault = Score.wrap(uint8((packed >> LOSS_GIVEN_DEFAULT_POS) & SCORE_MASK));
        recoveryRate = Score.wrap(uint8((packed >> RECOVERY_RATE_POS) & SCORE_MASK));
    }
    
    /**
     * @dev Gets individual credit score
     * @param _creditRisk Packed credit risk data
     * @return Credit score
     */
    function getCredit(CreditRisk _creditRisk) internal pure returns (Score) {
        uint256 packed = CreditRisk.unwrap(_creditRisk);
        return Score.wrap(uint8((packed >> CREDIT_POS) & SCORE_MASK));
    }
    
    /**
     * @dev Gets default probability score
     * @param _creditRisk Packed credit risk data
     * @return Default probability score
     */
    function getDefaultProbability(CreditRisk _creditRisk) internal pure returns (Score) {
        uint256 packed = CreditRisk.unwrap(_creditRisk);
        return Score.wrap(uint8((packed >> DEFAULT_PROBABILITY_POS) & SCORE_MASK));
    }
    
    /**
     * @dev Gets loss given default score
     * @param _creditRisk Packed credit risk data
     * @return Loss given default score
     */
    function getLossGivenDefault(CreditRisk _creditRisk) internal pure returns (Score) {
        uint256 packed = CreditRisk.unwrap(_creditRisk);
        return Score.wrap(uint8((packed >> LOSS_GIVEN_DEFAULT_POS) & SCORE_MASK));
    }
    
    /**
     * @dev Gets recovery rate score
     * @param _creditRisk Packed credit risk data
     * @return Recovery rate score
     */
    function getRecoveryRate(CreditRisk _creditRisk) internal pure returns (Score) {
        uint256 packed = CreditRisk.unwrap(_creditRisk);
        return Score.wrap(uint8((packed >> RECOVERY_RATE_POS) & SCORE_MASK));
    }
    
    /**
     * @dev Updates a specific score in the packed data
     * @param _creditRisk Current packed credit risk data
     * @param _scoreType Type of score to update (0=credit, 1=defaultProbability, 2=lossGivenDefault, 3=recoveryRate)
     * @param _newScore New score value
     * @return Updated packed credit risk data
     */
    function updateScore(
        CreditRisk _creditRisk,
        uint8 _scoreType,
        Score _newScore
    ) internal pure returns (CreditRisk) {
        uint256 packed = CreditRisk.unwrap(_creditRisk);
        uint256 newScoreValue = uint256(Score.unwrap(_newScore));
        
        require(newScoreValue <= 100, "Score out of range");
        require(_scoreType < 4, "Invalid score type");
        
        // Clear the existing score
        uint256 bitPosition = _scoreType * SCORE_BITS;
        packed &= ~(SCORE_MASK << bitPosition);
        
        // Set the new score
        packed |= (newScoreValue << bitPosition);
        
        return CreditRisk.wrap(packed);
    }
    
    /**
     * @dev Calculates a weighted risk score
     * @param _creditRisk Packed credit risk data
     * @param _weights Array of weights [credit, defaultProbability, lossGivenDefault, recoveryRate]
     * @return Weighted risk score
     */
    function calculateWeightedRisk(
        CreditRisk _creditRisk,
        uint256[4] memory _weights
    ) internal pure returns (uint256) {
        (Score credit, Score defaultProbability, Score lossGivenDefault, Score recoveryRate) = unpack(_creditRisk);
        
        uint256 weightedSum = 
            uint256(Score.unwrap(credit)) * _weights[0] +
            uint256(Score.unwrap(defaultProbability)) * _weights[1] +
            uint256(Score.unwrap(lossGivenDefault)) * _weights[2] +
            uint256(Score.unwrap(recoveryRate)) * _weights[3];
            
        uint256 totalWeight = _weights[0] + _weights[1] + _weights[2] + _weights[3];
        
        return totalWeight > 0 ? weightedSum / totalWeight : 0;
    }
}
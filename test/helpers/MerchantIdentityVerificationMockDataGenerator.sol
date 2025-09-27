// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;


import {MerchantOnboardingData} from "../../src/types/Shared.sol";
import {CollateralType} from "../../src/types/Shared.sol";
import {Vm} from "forge-std/Vm.sol";
import {CommonBase} from "forge-std/Base.sol";
struct MockData {
    MerchantOnboardingData merchantOnboardingData;
    bytes mockProofPayload;
    bytes mockUserContextData;
}

import {StdCheatsSafe} from "forge-std/StdCheats.sol";

contract MerchantIdentityVerificationMockDataGenerator is StdCheatsSafe {
    
    
    function _setupMockData() internal returns (MockData memory) {
    // Create mock merchant data
        return MockData({
            merchantOnboardingData: MerchantOnboardingData({
            businessId: keccak256("Green Valley Farm"),
            countryCodeHash: keccak256("KE"),
            creditAssesmentId: keccak256("credit_assessment_001"),
            collateralAddress: makeAddr("collateral"),
            collateralType: uint8(CollateralType.CRYPTO),
            protectionSeller: makeAddr("protection_seller"),
            merchantWallet: makeAddr("merchant"),
            creditScore: 75,
            defaultProbability: 12,
            lossGivenDefault: 40,
            recoveryRate: 60,
            businessAgeScore: 80,
            revenueStabilityScore: 70,
            marketPositionScore: 65,
            industryRiskScore: 60,
            regulatoryComplianceScore: 85,
            liquidityScore: 75,
            leverageScore: 80,
            cashFlowScore: 70,
            profitabilityScore: 65,
            marketVolatility: 60,
            economicCyclePosition: 3,
            regulatoryStability: 4,
            seasonality: 2
        }),
            mockProofPayload: _generateMockProofPayload(),
            mockUserContextData: _generateMockUserContextData()
        });
    }


    function _generateMockProofPayload() internal returns (bytes memory) {
        // Mock proof data structure: | 32 bytes attestationId | proof data |
        bytes32 attestationId = bytes32(uint256(1)); // Passport
        
        // Mock proof elements (simplified for testing)
        uint256[2] memory a = [uint256(123456789), uint256(987654321)];
        uint256[2][2] memory b = [[uint256(111111111), uint256(222222222)], 
                                [uint256(333333333), uint256(444444444)]];
        uint256[2] memory c = [uint256(555555555), uint256(666666666)];
        uint256[21] memory pubSignals = [
            uint256(777777777), // nullifier
            uint256(18),        // age
            uint256(1),         // nationality (US)
            uint256(0),         // gender (Male)
            uint256(1234567890), // dateOfBirth
            uint256(9876543210), // expiryDate
            uint256(1),         // issuingState
            uint256(0),         // ofac[0]
            uint256(0),         // ofac[1]
            uint256(0),         // ofac[2]
            uint256(0),         // forbiddenCountries[0]
            uint256(0),         // forbiddenCountries[1]
            uint256(0),         // forbiddenCountries[2]
            uint256(0),         // forbiddenCountries[3]
            uint256(0),         // name[0]
            uint256(0),         // name[1]
            uint256(0),         // name[2]
            uint256(0),         // idNumber
            uint256(0),         // olderThan
            uint256(0),         // userIdentifier
            uint256(0)          // padding
        ];
        
        // Encode proof data
        bytes memory proofData = abi.encode(a, b, c, pubSignals);
        
        // Combine attestationId + proof data
        return abi.encodePacked(attestationId, proofData);
    }

    function _generateMockUserContextData() internal returns (bytes memory) {
        // Format: | 32 bytes destChainId | 32 bytes userIdentifier | merchant data |
        bytes32 destChainId = bytes32(uint256(42220)); // Celo mainnet
        bytes32 userIdentifier = bytes32(uint256(12345));
        MerchantOnboardingData memory mockMerchantData = _setupMockData().merchantOnboardingData;
        // Encode merchant data
        bytes memory merchantDataBytes = abi.encode(mockMerchantData);
        
        // Combine all data
        return abi.encodePacked(destChainId, userIdentifier, merchantDataBytes);
    }






}
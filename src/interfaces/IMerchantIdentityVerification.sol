// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "@self/interfaces/ISelfVerificationRoot.sol";

interface IMerchantIdentityVerification is  ISelfVerificationRoot{
    
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

    error MinAgeRequirementTooLow();

    function verifyMerchantIdentity(
        bytes calldata proofPayload,
        bytes calldata userContextData
    ) external;

    function setMinAgeRequirement(uint256 _minAgeRequirement) external;



}
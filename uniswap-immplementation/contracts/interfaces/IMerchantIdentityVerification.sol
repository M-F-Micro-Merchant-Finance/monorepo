// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;



import "@selfxyz/contracts/interfaces/ISelfVerificationRoot.sol";
import {Currency} from "@uniswap/v4-core/src/types/Currency.sol";
import {SelfStructs} from "@selfxyz/contracts/libraries/SelfStructs.sol";
interface IMerchantIdentityVerification is  ISelfVerificationRoot{
    struct SelfConfig{
        bytes32 configId;
        SelfStructs.VerificationConfigV2 verificationConfig;
    }

    event MerchantVerified(
        uint256 indexed nullifier,
        address indexed merchant,
        uint256 indexed documentType
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
    


    function setMinAgeRequirement(uint256 _minAgeRequirement) external;



}
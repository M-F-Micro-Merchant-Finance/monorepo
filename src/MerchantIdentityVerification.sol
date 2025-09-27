// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;



import "./base/self/SelfVerificationRoot.sol";
import "./interfaces/IMerchantIdentityVerification.sol";
import "./interfaces/IMerchantDataMediator.sol";

import {SelfUtils} from "./libraries/self/SelfUtils.sol";
import {SelfStructs} from "./libraries/self/SelfStructs.sol";


import {IIdentityVerificationHubV2} from "./interfaces/self/IIdentityVerificationHubV2.sol";

import "./types/Shared.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

// B->>B: Verify proof with SelfBackendVerifier
// B->>C: Call verifyMerchantIdentity
// C->>C: Verify proof on-chain
// C->>B: Return verification result

contract MerchantIdentityVerification is IMerchantIdentityVerification, SelfVerificationRoot, Ownable {
    using SelfUtils for SelfUtils.UnformattedVerificationConfigV2;
    // keccak256("merchant-identity-verification")
    uint256 public constant MERCHANT_IDENTITY_VERIFICATION_SCOPE = 0xc129bc5f93e22c183334b9b2c30177e2d57dcd51ff7fe00f2d197be4ae3507e8;


    uint256 private minAgeRequirement;
    IMerchantDataMediator private userDataRouter;
    SelfConfig private _verificationConfig;

   
   /// @notice Maps nullifiers to user identifiers for registration tracking
   mapping(uint256 nullifier => bytes32 creditAssesmentId) internal _nullifierToUserIdentifier;
   mapping(bytes32 creditAssesmentId => bool isRegistered) internal _registeredUserIdentifiers;


    
    constructor(
        address _hubAddress,
        IMerchantDataMediator _userDataRouter,
        uint256 scopeValue,
        SelfUtils.UnformattedVerificationConfigV2 memory rawVerificationConfig
    ) SelfVerificationRoot(_hubAddress, scopeValue) {
        userDataRouter = _userDataRouter;
        _verificationConfig.verificationConfig = rawVerificationConfig.formatVerificationConfigV2();
        _verificationConfig.configId = IIdentityVerificationHubV2(
            _hubAddress
        ).setVerificationConfigV2(_verificationConfig.verificationConfig);
        emit VerificationConfigUpdated(_verificationConfig.configId);
    }

    function setScope(uint256 scopeValue) external onlyOwner{
        _setScope(scopeValue);
    }

    function getScope() external view returns (uint256){
        return _scope;
    }

    
    // TODO: This function is only callabale by governance
    function setMinAgeRequirement(uint256 _minAgeRequirement) external onlyOwner{
        if (_minAgeRequirement < uint256(0x12)) {
            revert MinAgeRequirementTooLow();
        }
        minAgeRequirement = _minAgeRequirement;
        emit MinAgeRequirementUpdated(_minAgeRequirement);
    }

    function getMinAgeRequirement() external view returns (uint256){
        return minAgeRequirement;
    }

    function verifyMerchantIdentity(
        bytes calldata proofPayload,
        bytes calldata userContextData
    ) external onlyOwner{
        // Minimum userContextData length: 32 (destChainId) + 32 (userIdentifier) 
        // + 288 (MerchantOnboardingData struct size)
        if (userContextData.length < 352) {
            revert InvalidDataFormat();
        }
        address merchantAddress = abi.decode(userContextData[64:96], (address));
        bytes32 creditAssesmentId = abi.decode(userContextData[96:128], (bytes32));
        if (_registeredUserIdentifiers[creditAssesmentId]) {
            revert MechantAlreadyVerified();
        }

        //TODO: userContextData contains information specifigc to the credit score context
        // as well as project to be funded metrics thus,

        // There needs to be type checkign for this whe defining a type for this
        verifySelfProof(proofPayload, userContextData);
    }

    function getConfigId(
        bytes32 /*destinationChainId*/,
        bytes32 /*userIdentifier*/,
        bytes memory userDefinedData
    ) public view virtual override returns (bytes32){
        // TODO: This is the naive implementation but should be overridden by child contracts
        MerchantOnboardingData memory merchantOnboardingData = abi.decode(userDefinedData, (MerchantOnboardingData));
        return merchantOnboardingData.creditAssesmentId;
    }

    // NOTE: This function can be further overridden by child contracts
    function customVerificationHook(
        ISelfVerificationRoot.GenericDiscloseOutputV2 memory output,
        bytes memory userData
    ) internal virtual override {
        
        MerchantOnboardingData memory merchantOnboardingData = abi.decode(userData, (MerchantOnboardingData));
        
        address merchantAddress = merchantOnboardingData.merchantWallet;
        
        if (merchantAddress == address(0x00)) {
            revert InvalidMerchantAddress();
        }

        if (output.olderThan < minAgeRequirement) {
            revert UnderageMerchant();
        }




        // TODO: This is a place holder but shoudl include 
        // additional logic required for merchant verification and
        // identification
        userDataRouter.onUserDataHook(userData);

        // TODO This is the last thing it does in the verification process
        // TODO: Is the msg.sender the merchant Id ??
        _nullifierToUserIdentifier[output.nullifier] = merchantOnboardingData.creditAssesmentId;
        _registeredUserIdentifiers[merchantOnboardingData.creditAssesmentId] = true;
        emit MerchantVerified(merchantAddress, uint256(output.attestationId), block.timestamp, output.nullifier);

    }

    function isVerifiedMerchant(bytes32 _creditAssesmentId) external view returns (bool) {
        return _registeredUserIdentifiers[_creditAssesmentId];
    }




    
}
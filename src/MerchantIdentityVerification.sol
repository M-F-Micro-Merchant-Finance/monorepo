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

import {EnumerableMap} from "@openzeppelin/contracts/utils/structs/EnumerableMap.sol";
// B->>B: Verify proof with SelfBackendVerifier
// B->>C: Call verifyMerchantIdentity
// C->>C: Verify proof on-chain
// C->>B: Return verification result

contract MerchantIdentityVerification is IMerchantIdentityVerification, SelfVerificationRoot {
    using SelfUtils for SelfUtils.UnformattedVerificationConfigV2;
    using EnumerableMap for EnumerableMap.Bytes32ToBytes32Map;



    uint256 private minAgeRequirement;
    IMerchantDataMediator private userDataRouter;
    SelfConfig private _verificationConfig;

   
   /// @notice Maps nullifiers to user identifiers for registration tracking
   // The nullifier is the id of each person
   // One person here can only have one merchant account

   mapping(uint256 nullifier => address merchantAddress) internal merchantAccounts;

   // One merchant account can have many creditAssesments
   // Thus the key is the nullifier and the values are the creditAssesments
   EnumerableMap.Bytes32ToBytes32Map internal merchantCreditAssesments;

   
   mapping(address merchantAddress => bool isRegistered) internal _registeredMerchants;


    constructor(
        address identityVerificationHubV2Address,
        IMerchantDataMediator _userDataRouter,
        uint256 scopeValue,
        SelfUtils.UnformattedVerificationConfigV2 memory rawVerificationConfig
    ) SelfVerificationRoot(identityVerificationHubV2Address, scopeValue) {
        userDataRouter = _userDataRouter;
        
        _verificationConfig.verificationConfig = rawVerificationConfig.formatVerificationConfigV2();
        _verificationConfig.configId = IIdentityVerificationHubV2(
            identityVerificationHubV2Address
        ).setVerificationConfigV2(_verificationConfig.verificationConfig);
        emit VerificationConfigUpdated(_verificationConfig.configId);
    }

    function setScope(uint256 scopeValue) external {
        _setScope(scopeValue);
    }

    function getScope() external view returns (uint256){
        return _scope;
    }

    
    // TODO: This function is only callabale by governance
    function setMinAgeRequirement(uint256 _minAgeRequirement) external{
        if (_minAgeRequirement < uint256(0x12)) {
            revert MinAgeRequirementTooLow();
        }
        minAgeRequirement = _minAgeRequirement;
        emit MinAgeRequirementUpdated(_minAgeRequirement);
    }

    function getMinAgeRequirement() external view returns (uint256){
        return minAgeRequirement;
    }



    function getConfigId(
        bytes32 /*destinationChainId*/,
        bytes32 /*userIdentifier*/,
        bytes memory /*userDefinedData*/
    ) public view virtual override returns (bytes32){
        return _verificationConfig.configId;
    }

    // NOTE: This function can be further overridden by child contracts
    function customVerificationHook(
        ISelfVerificationRoot.GenericDiscloseOutputV2 memory output,
        bytes memory userData
    ) internal virtual override {
        if (userData.length < 288) {
            revert InvalidDataFormat();
        }
        userDataRouter.onUserDataHook(userData);


        if (output.olderThan < minAgeRequirement) {
            revert UnderageMerchant();
        }


        address merchantAddress = address(uint160(output.userIdentifier));
        if (merchantAccounts[output.nullifier] != address(0x00) && merchantAccounts[output.nullifier] != merchantAddress) {
            revert InvalidMerchantAddress();
        }
        merchantAccounts[output.nullifier] = merchantAddress;
        _registeredMerchants[merchantAddress] = true;

        // TODO: This is a place holder but shoudl include 
        // additional logic required for merchant verification and
        // identification
        MerchantOnboardingData memory merchantOnboardingData = abi.decode(userData, (MerchantOnboardingData));
        // TODO This is the last thing it does in the verification process
        // TODO: Is the msg.sender the merchant Id ??
        merchantCreditAssesments.set(bytes32(output.nullifier), merchantOnboardingData.creditAssesmentId);

        emit MerchantVerified(output.nullifier, merchantAddress, uint256(output.attestationId));

    }






    
}
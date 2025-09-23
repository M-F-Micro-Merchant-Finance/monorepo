// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;



import "@self/abstract/SelfVerificationRoot.sol";
import "../interfaces/IMerchantIdentityVerification.sol";
// B->>B: Verify proof with SelfBackendVerifier
// B->>C: Call verifyMerchantIdentity
// C->>C: Verify proof on-chain
// C->>B: Return verification result
abstract contract MerchantIdentityVerificationBase is IMerchantIdentityVerification, SelfVerificationRoot {
    // keccak256("merchant-identity-verification")
    uint256 public constant MERCHANT_IDENTITY_VERIFICATION_SCOPE = 0xc129bc5f93e22c183334b9b2c30177e2d57dcd51ff7fe00f2d197be4ae3507e8;


    uint256 public minAgeRequirement;

    mapping(address => bool) public isVerifiedMerchant;

    constructor(address _hubAddress) SelfVerificationRoot(_hubAddress, MERCHANT_IDENTITY_VERIFICATION_SCOPE) {}

    
    // TODO: This function is only callabale by governance
    function setMinAgeRequirement(uint256 _minAgeRequirement) external {
        if (_minAgeRequirement < uint256(0x12)) {
            revert MinAgeRequirementTooLow();
        }
        minAgeRequirement = _minAgeRequirement;
    }
    
    function verifyMerchantIdentity(
        bytes calldata proofPayload,
        bytes calldata userContextData
    ) external{
        //TODO: userContextData contains information specifigc to the credit score context
        // as well as project to be funded metrics thus,

        // There needs to be type checkign for this whe defining a type for this
        verifySelfProof(proofPayload, userContextData);
    }

    function customVerificationHook(
        ISelfVerificationRoot.GenericDiscloseOutputV2 memory output,
        bytes memory userData
    ) internal override {
        // TODO: This is a place holder but shoudl include 
        // additional logic required for merchant verification and
        // identification
        _onUserData(userData);

        // TODO This is the last thing it does in the verification process
        // TODO: Is the msg.sender the merchant Id ??
        isVerifiedMerchant[msg.sender] = true;
        emit MerchantVerified(msg.sender, uint256(output.attestationId), block.timestamp, output.nullifier);

    }


    // TODO: This function can be named differently is just a place holder that child conracts
    // need to override for custom logc required for merchan verification and identification

    function _onUserData(bytes memory userData) internal virtual;

    
}
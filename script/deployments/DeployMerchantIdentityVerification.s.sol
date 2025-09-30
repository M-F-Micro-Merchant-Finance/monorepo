// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;
pragma abicoder v2;

import {
    Script,
    console2
} from "forge-std/Script.sol";

import {SelfUtils} from "../../src/libraries/self/SelfUtils.sol";
import {IMerchantDataMediator} from "../../src/interfaces/IMerchantDataMediator.sol";
import {MerchantIdentityVerification} from "../../src/MerchantIdentityVerification.sol";

contract DeployMerchantIdentityVerification is Script {
    function run() public {
        // Get the merchant data mediator address from environment or use the provided one
        address merchantDataMediatorAddress = vm.envOr("MERCHANT_DATA_MEDIATOR", address(0x71542aEe829993145Cdd8B98829081d2fc358355));
        
        // Create the verification config
        SelfUtils.UnformattedVerificationConfigV2 memory rawVerificationConfig = SelfUtils.UnformattedVerificationConfigV2({
            olderThan: 18,
            forbiddenCountries: new string[](0),
            ofacEnabled: false
        });
        
        // Hub address for Self Protocol
        address hubAddress = address(0x16ECBA51e18a4a7e61fdC417f0d47AFEeDfbed74);
        
        // Scope value
        uint256 scopeValue = uint256(16509021853945345868436772242014050830557849314816012934116460838688206719767);
        
        console2.log("Deploying MerchantIdentityVerification with:");
        console2.log("  Hub Address:", hubAddress);
        console2.log("  Merchant Data Mediator:", merchantDataMediatorAddress);
        console2.log("  Scope Value:", scopeValue);
        console2.log("  Older Than:", rawVerificationConfig.olderThan);
        console2.log("  Forbidden Countries Count:", rawVerificationConfig.forbiddenCountries.length);
        console2.log("  OFAC Enabled:", rawVerificationConfig.ofacEnabled);
        
        vm.startBroadcast();
        
        // Deploy the contract directly
        MerchantIdentityVerification merchantIdentityVerification = new MerchantIdentityVerification(
            hubAddress,
            IMerchantDataMediator(merchantDataMediatorAddress),
            scopeValue,
            rawVerificationConfig
        );
        
        vm.stopBroadcast();
        
        console2.log("MerchantIdentityVerification deployed at:", address(merchantIdentityVerification));
    }
}
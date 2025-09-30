// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;
pragma abicoder v2;

import {
    Script,
    console2
} from "forge-std/Script.sol";

import {SelfUtils} from "../../src/libraries/self/SelfUtils.sol";
import {IMerchantDataMediator} from "../../src/interfaces/IMerchantDataMediator.sol";

contract DeployMerchantIdentityVerificationFoundryUnsupportedChain is Script {
    function run(IMerchantDataMediator merchantDataMediator) public {
        SelfUtils.UnformattedVerificationConfigV2 memory rawVerificationConfig = SelfUtils.UnformattedVerificationConfigV2({
            olderThan: 18,
            forbiddenCountries: new string[](0),
            ofacEnabled: false
        });
        

        bytes memory encodedVerificationConfig = abi.encode(rawVerificationConfig);
        uint256 scopeValue = uint256(16509021853945345868436772242014050830557849314816012934116460838688206719767);
        address hubAddress = address(0x16ECBA51e18a4a7e61fdC417f0d47AFEeDfbed74);
        string[] memory merchIdDeployArgs = new string[](14);
        merchIdDeployArgs[0] = "/root/.foundry/bin/forge";
        merchIdDeployArgs[1] = "create";
        merchIdDeployArgs[2] = "--broadcast";
        merchIdDeployArgs[3] = "--private-key";
        merchIdDeployArgs[4] = vm.envString("PRIVATE_KEY");
        merchIdDeployArgs[5] = "--rpc-url";
        merchIdDeployArgs[6] = vm.rpcUrl("celo_sepolia");
        merchIdDeployArgs[7] = "src/MerchantIdentityVerification.sol:MerchantIdentityVerification";
        merchIdDeployArgs[8] = "--constructor-args";
        merchIdDeployArgs[9] = vm.toString(hubAddress);
        merchIdDeployArgs[10] = vm.toString(address(merchantDataMediator));
        merchIdDeployArgs[11] = vm.toString(scopeValue);
        // Try passing the struct as a tuple format
        merchIdDeployArgs[12] = string(abi.encodePacked("(", vm.toString(rawVerificationConfig.olderThan), ",", "[]", ",", vm.toString(rawVerificationConfig.ofacEnabled), ")"));
        merchIdDeployArgs[13] = "-vvvv";
        bytes memory merchIdDeployResult = vm.ffi(merchIdDeployArgs);
        console2.log("FFI Result:");
        console2.logBytes(merchIdDeployResult);
        
    }
}
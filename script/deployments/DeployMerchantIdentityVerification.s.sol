// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;


import {Script} from "forge-std/Script.sol";
import {MerchantIdentityVerification} from "../../src/MerchantIdentityVerification.sol";
import {IMerchantIdentityVerification} from "../../src/interfaces/IMerchantIdentityVerification.sol";
import {IMerchantDataMediator} from "../../src/interfaces/IMerchantDataMediator.sol";
import {ICDSFactory} from "../../src/interfaces/ICDSFactory.sol";
import {SelfUtils} from "../../src/libraries/self/SelfUtils.sol";
import {ICDSFactory} from "../../src/interfaces/ICDSFactory.sol";

contract DeployMerchantIdentityVerification is Script {
 
    function run(
        address _hubAddress,
        IMerchantDataMediator _merchantDataMediator,
        uint256 _scopeValue,
        SelfUtils.UnformattedVerificationConfigV2 memory _rawVerificationConfig
    ) public returns (IMerchantIdentityVerification) {
        
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);
        
        MerchantIdentityVerification merchantIdentityVerification = new MerchantIdentityVerification(
            _hubAddress,
            _merchantDataMediator,
            _scopeValue,
            _rawVerificationConfig
        );

        vm.stopBroadcast();
        return IMerchantIdentityVerification(address(merchantIdentityVerification));
    }
}
// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;


import {Script} from "forge-std/Script.sol";
import {MerchantDataMediator} from "../../src/MerchantDataMediator.sol";
import {ICDSFactory} from "../../src/interfaces/ICDSFactory.sol";
import {IMerchantDataMediator} from "../../src/interfaces/IMerchantDataMediator.sol";

contract DeployMerchantDataMediator is Script {
 
 
    function run(ICDSFactory _cdsFactory) public returns (IMerchantDataMediator) {
        
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);
        MerchantDataMediator merchantDataMediator = new MerchantDataMediator(_cdsFactory);
        vm.stopBroadcast();
        return IMerchantDataMediator(address(merchantDataMediator));
    }
}
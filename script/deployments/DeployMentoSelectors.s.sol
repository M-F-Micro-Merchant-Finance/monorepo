// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;


import {Script} from "forge-std/Script.sol";
import {Always_cCOP_MentoSelector} from "../../src/mocks/Always_cCOP_MentoSelector.sol";
import {IMentoStableCoinSelector} from "../../src/interfaces/IMentoStableCoinSelector.sol";

contract DeployMentoSelectors is Script {
    function run() public returns (IMentoStableCoinSelector) {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

 
        vm.startBroadcast(deployerPrivateKey);
        Always_cCOP_MentoSelector always_cCOP_MentoSelector = new Always_cCOP_MentoSelector();
        vm.stopBroadcast();
        return IMentoStableCoinSelector(address(always_cCOP_MentoSelector));
    }
}
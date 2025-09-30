// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import {
    Script,
    console2
} from "forge-std/Script.sol";

import {
    MerchantDataMediator
} from "../../src/MerchantDataMediator.sol";



contract MerchantDataMediatorInteractions is Script {
    function run() public {}

    function onUserDataHoolCall(
        MerchantDataMediator merchantDataMediator,
        bytes memory userData
    ) public {
        string[] memory args = new string[](10);
        args[0] = "/root/.foundry/bin/cast";
        args[1] = "call";
        args[2] = "--rpc-url";
        args[3] = vm.rpcUrl("celo_sepolia");
        args[4] = "--private-key";
        args[5] = vm.envString("PRIVATE_KEY");
        args[6] = "--broadcast";
        args[7] = "onUserDataHook(bytes)";
        args[8] = vm.toString(abi.encode(userData));
        bytes memory result = vm.ffi(args);
        console2.log("Result: ", string(result));

    }
}
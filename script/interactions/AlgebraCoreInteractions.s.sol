// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import {
    Script,
    console2
} from "forge-std/Script.sol";


import {IAlgebraFactory} from "@cryptoalgebra/integral-core/contracts/interfaces/IAlgebraFactory.sol";
import {ICDSFactory} from "../../src/interfaces/ICDSFactory.sol";
import {IMerchantDataMediator} from "../../src/interfaces/IMerchantDataMediator.sol";
contract AlgebraCoreInteractions is Script {
    
    function run() public {}


    function algebraFactoryApprovals(
        address algebraFactory,
        ICDSFactory cdsFactory,
        IMerchantDataMediator merchantDataMediator
    ) public {
        // Hardcoded role values from AlgebraFactory
        bytes32 CUSTOM_POOL_DEPLOYER_ROLE = keccak256("CUSTOM_POOL_DEPLOYER");
        bytes32 POOLS_ADMINISTRATOR_ROLE = keccak256("POOLS_ADMINISTRATOR");
        
        string[] memory args = new string[](11);
        args[0] = "/root/.foundry/bin/cast";
        args[1] = "call";
        args[2] = vm.toString(algebraFactory);
        args[3] = "--rpc-url";
        args[4] = vm.rpcUrl("celo_sepolia");
        args[5] = "--private-key";
        args[6] = vm.envString("PRIVATE_KEY");
        args[7] = "--broadcast";
        args[8] = "grantRole(bytes32,address)";
        args[9] = vm.toString(CUSTOM_POOL_DEPLOYER_ROLE);
        args[10] = vm.toString(address(cdsFactory));
        bytes memory result = vm.ffi(args);
        console2.log("Result: ", string(result));
        
        
        // Grant POOLS_ADMINISTRATOR_ROLE to cdsFactory
        {
            string[] memory args = new string[](11);
            args[0] = "/root/.foundry/bin/cast";
            args[1] = "call";
            args[2] = vm.toString(algebraFactory);
            args[3] = "--rpc-url";
            args[4] = vm.rpcUrl("celo_sepolia");
            args[5] = "--private-key";
            args[6] = vm.envString("PRIVATE_KEY");
            args[7] = "--broadcast";
            args[8] = "grantRole(bytes32,address)";
            args[9] = vm.toString(POOLS_ADMINISTRATOR_ROLE);
            args[10] = vm.toString(address(cdsFactory));
            bytes memory result = vm.ffi(args);
            console2.log("Result: ", string(result));
        }
        // Grant CUSTOM_POOL_DEPLOYER role to merchantDataMediator
        {
            string[] memory args = new string[](11);
            args[0] = "/root/.foundry/bin/cast";
            args[1] = "call";
            args[2] = vm.toString(algebraFactory);
            args[3] = "--rpc-url";
            args[4] = vm.rpcUrl("celo_sepolia");
            args[5] = "--private-key";
            args[6] = vm.envString("PRIVATE_KEY");
            args[7] = "--broadcast";
            args[8] = "grantRole(bytes32,address)";
            args[9] = vm.toString(CUSTOM_POOL_DEPLOYER_ROLE);
            args[10] = vm.toString(address(merchantDataMediator));
            bytes memory result = vm.ffi(args);
            console2.log("Result: ", string(result));
        }
        // Grant POOLS_ADMINISTRATOR_ROLE to merchantDataMediator
        {
            string[] memory args = new string[](11);
            args[0] = "/root/.foundry/bin/cast";
            args[1] = "call";
            args[2] = vm.toString(algebraFactory);
            args[3] = "--rpc-url";
            args[4] = vm.rpcUrl("celo_sepolia");
            args[5] = "--private-key";
            args[6] = vm.envString("PRIVATE_KEY");
            args[7] = "--broadcast";
            args[8] = "grantRole(bytes32,address)";
            args[9] = vm.toString(POOLS_ADMINISTRATOR_ROLE);
            args[10] = vm.toString(address(merchantDataMediator));
            bytes memory result = vm.ffi(args);
            console2.log("Result: ", string(result));
        }
    
    }
}
// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import {Script} from "forge-std/Script.sol";
import {console2} from "forge-std/console2.sol";

import {CDSPoolInitializer} from "../contracts/CDSPoolInitializer.sol";

/**
 * @title DeployCDSPoolInitializer
 * @notice Deployment script for CDSPoolInitializer contract
 */
contract DeployCDSPoolInitializer is Script {
    
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        
        // Get contract addresses from environment
        address algebraFactory = vm.envAddress("ALGEBRA_FACTORY");
        address poolManager = vm.envAddress("POOL_MANAGER");
        
        console2.log("Deploying CDSPoolInitializer...");
        console2.log("Deployer:", deployer);
        console2.log("Algebra Factory:", algebraFactory);
        console2.log("Pool Manager:", poolManager);
        
        vm.startBroadcast(deployerPrivateKey);
        
        // Deploy CDSPoolInitializer
        CDSPoolInitializer poolInitializer = new CDSPoolInitializer(
            algebraFactory,
            poolManager
        );
        
        vm.stopBroadcast();
        
        console2.log("CDSPoolInitializer deployed at:", address(poolInitializer));
        
        // Verify deployment
        require(address(poolInitializer) != address(0), "Deployment failed");
        console2.log("Deployment successful!");
    }
}





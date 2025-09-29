// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import {
    Test,
    console2
} from "forge-std/Test.sol";

import {
    AlgebraFactory,
    IAlgebraFactory
} from "@cryptoalgebra/integral-core/contracts/AlgebraFactory.sol";

import {
    AlgebraPoolDeployer,
    IAlgebraPoolDeployer
} from "@cryptoalgebra/integral-core/contracts/AlgebraPoolDeployer.sol";

contract AlgebraDeployers is Test {
    AlgebraFactory public algebraFactory;
    AlgebraPoolDeployer public algebraPoolDeployer;

    function deployFreshAlgebraFactoryAndPoolDeployer(address _deployerAddress) public returns(IAlgebraFactory, IAlgebraPoolDeployer){
        // To resolve the circular dependency between Factory and PoolDeployer,
        // we'll use the official Algebra pattern with CREATE address precomputation:
        // 1. Precompute the pool deployer address using the next nonce + 1 (second contract)
        // 2. Deploy the factory with the precomputed pool deployer address
        // 3. Deploy the pool deployer with the actual factory address
        
        // Step 1: Precompute pool deployer address using CREATE address computation
        // We need the address of the SECOND contract that will be deployed (pool deployer)
        // So we use current nonce + 1
        address poolDeployerAddress = vm.computeCreateAddress(
            _deployerAddress, 
            vm.getNonce(_deployerAddress) + 1
        );
                
        // Step 2: Deploy factory with precomputed pool deployer address
        vm.startPrank(_deployerAddress);
        algebraFactory = new AlgebraFactory(poolDeployerAddress);
        // Step 3: Deploy pool deployer with actual factory address
        algebraPoolDeployer = new AlgebraPoolDeployer(address(algebraFactory));
        vm.stopPrank();
        
        // Verify the addresses match
        require(address(algebraPoolDeployer) == poolDeployerAddress, "Address mismatch");
        require(algebraFactory.poolDeployer() == address(algebraPoolDeployer), "Factory pool deployer mismatch");
        
        return (IAlgebraFactory(address(algebraFactory)), IAlgebraPoolDeployer(address(algebraPoolDeployer)));
    }
}



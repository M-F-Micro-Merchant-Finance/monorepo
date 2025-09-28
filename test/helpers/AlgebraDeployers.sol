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
 


    function deployFreshAlgebraFactoryAndPoolDeployer() public returns(IAlgebraFactory, IAlgebraPoolDeployer){
        // To resolve the circular dependency between Factory and PoolDeployer,
        // we'll use a three-step process:
        // 1. Create temporary factory with a placeholder deployer address
        address placeholderDeployer = address(0x1);
        AlgebraFactory tempFactory = new AlgebraFactory(placeholderDeployer);
        
        // 2. Create the final PoolDeployer with the tempFactory address
        //    This ensures the deployer expects calls from tempFactory
        algebraPoolDeployer = new AlgebraPoolDeployer(address(tempFactory));
        
        // 3. Create the final Factory with the final PoolDeployer address
        algebraFactory = new AlgebraFactory(address(algebraPoolDeployer));
        
        // At this point, there's still a mismatch: 
        // - algebraPoolDeployer expects calls from tempFactory
        // - algebraFactory will make calls but has the deployer address
        
        // The proper way to handle this is to have the final deployer expect
        // calls from the final factory. So let's do this in the proper order:
        
        // Create final pool deployer that expects calls from a temporary factory
        algebraPoolDeployer = new AlgebraPoolDeployer(address(0x2)); // temporary factory address
        
        // Create the final factory that will use the deployer
        algebraFactory = new AlgebraFactory(address(algebraPoolDeployer));
        
        // Now recreate the deployer to work with the actual factory
        algebraPoolDeployer = new AlgebraPoolDeployer(address(algebraFactory));
        
        // Now recreate the factory to work with the actual deployer
        algebraFactory = new AlgebraFactory(address(algebraPoolDeployer));
        
        return (IAlgebraFactory(address(algebraFactory)), IAlgebraPoolDeployer(address(algebraPoolDeployer)));
    }



    
    
}



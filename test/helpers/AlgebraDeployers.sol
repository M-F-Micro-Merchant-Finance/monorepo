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
        // Step 1: Deploy factory with a mock pool deployer address
        address mockPoolDeployer = address(0x1234567890123456789012345678901234567890);
        algebraFactory = new AlgebraFactory(mockPoolDeployer);
        
        // Step 2: Deploy pool deployer with the actual factory address
        algebraPoolDeployer = new AlgebraPoolDeployer(address(algebraFactory));
        
        // Step 3: Redeploy factory with the actual pool deployer address
        algebraFactory = new AlgebraFactory(address(algebraPoolDeployer));
        
        return (IAlgebraFactory(address(algebraFactory)), IAlgebraPoolDeployer(address(algebraPoolDeployer)));
    }



    
    
}



// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;
pragma abicoder v2;


import {Script} from "forge-std/Script.sol";
import {AlgebraFactory} from "@cryptoalgebra/integral-core/contracts/AlgebraFactory.sol";
import {AlgebraPoolDeployer} from "@cryptoalgebra/integral-core/contracts/AlgebraPoolDeployer.sol";
import {IAlgebraFactory} from "@cryptoalgebra/integral-core/contracts/interfaces/IAlgebraFactory.sol";
import {Create2} from "@openzeppelin-v5/contracts/utils/Create2.sol";
import {IAlgebraPoolDeployer} from "@cryptoalgebra/integral-core/contracts/interfaces/IAlgebraPoolDeployer.sol";


contract DeployAlgebraFactory is Script {
  
    function run() public returns (IAlgebraFactory, IAlgebraPoolDeployer){
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        
        vm.startBroadcast(deployerPrivateKey);

        // Step 1: Deploy factory with a mock pool deployer address
        address mockPoolDeployer = address(0x1234567890123456789012345678901234567890);
        AlgebraFactory algebraFactory = new AlgebraFactory(mockPoolDeployer);
        
        // Step 2: Deploy pool deployer with the actual factory address
        AlgebraPoolDeployer algebraPoolDeployer = new AlgebraPoolDeployer(address(algebraFactory));
        
        // Step 3: Redeploy factory with the actual pool deployer address
        algebraFactory = new AlgebraFactory(address(algebraPoolDeployer));
        
        vm.stopBroadcast();



        return (IAlgebraFactory(address(algebraFactory)), IAlgebraPoolDeployer(address(algebraPoolDeployer)));
    }
}

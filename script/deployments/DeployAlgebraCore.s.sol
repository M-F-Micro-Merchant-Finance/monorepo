// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;
pragma abicoder v2;


import {Script} from "forge-std/Script.sol";
import {AlgebraFactory} from "@cryptoalgebra/integral-core/contracts/AlgebraFactory.sol";
import {AlgebraPoolDeployer} from "@cryptoalgebra/integral-core/contracts/AlgebraPoolDeployer.sol";
import {IAlgebraFactory} from "@cryptoalgebra/integral-core/contracts/interfaces/IAlgebraFactory.sol";


contract DeployAlgebraFactory is Script {
  
    function run() public returns (IAlgebraFactory){
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        address poolDeployer;

        bytes memory bytecode = type(AlgebraPoolDeployer).creationCode;
        
        assembly ("memory-safe") {
            poolDeployer := create(0x00, add(bytecode, 0x20), mload(bytecode))
        }

        vm.startBroadcast(deployerPrivateKey);
        AlgebraFactory algebraFactory = new AlgebraFactory(poolDeployer);
        AlgebraPoolDeployer algebraPoolDeployer = new AlgebraPoolDeployer(address(algebraFactory));
        vm.stopBroadcast();

        return IAlgebraFactory(address(algebraFactory));

    }
}

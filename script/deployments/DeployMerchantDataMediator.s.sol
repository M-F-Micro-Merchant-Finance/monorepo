// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;


import {Script} from "forge-std/Script.sol";
import {MerchantDataMediator} from "../../src/MerchantDataMediator.sol";
import {ICDSFactory} from "../../src/interfaces/ICDSFactory.sol";
import {IMerchantDataMediator} from "../../src/interfaces/IMerchantDataMediator.sol";
import {ICollateralFilter} from "../../src/interfaces/ICollateralFilter.sol";

contract DeployMerchantDataMediator is Script {
 
 
    function run(
        ICDSFactory _cdsFactory,
        ICollateralFilter _collateralFilter
    ) public returns (IMerchantDataMediator) {
        
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address _deployerAddress = vm.addr(deployerPrivateKey);

        vm.startBroadcast(deployerPrivateKey);
        MerchantDataMediator merchantDataMediator = new MerchantDataMediator(_cdsFactory, _collateralFilter);
        vm.stopBroadcast();
        return IMerchantDataMediator(address(merchantDataMediator));
    }
}
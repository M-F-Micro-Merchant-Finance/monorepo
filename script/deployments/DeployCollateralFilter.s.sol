// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import {Script} from "forge-std/Script.sol";
import {CollateralFilter} from "../../src/CollateralFilter.sol";
import {ICollateralFilter} from "../../src/interfaces/ICollateralFilter.sol";


import {IReserve} from "@mento/core/contracts/interfaces/IReserve.sol";
import {ICurrencyCollateralValidator} from "../../src/interfaces/ICurrencyCollateralValidator.sol";
import {CurrencyCollateralValidator} from "../../src/CurrencyCollateralValidator.sol";



contract DeployCollateralFilter is Script {
    function run() public returns (ICollateralFilter) {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);
        CollateralFilter collateralFilter = new CollateralFilter();
        vm.stopBroadcast();
        return ICollateralFilter(address(collateralFilter));
    }
}

contract DeployCurrencyCollateralValidator is Script {
    function run(IReserve _mentoReserve) public returns (ICurrencyCollateralValidator) {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);
        CurrencyCollateralValidator currencyCollateralValidator = new CurrencyCollateralValidator(_mentoReserve);
        vm.stopBroadcast();
        return ICurrencyCollateralValidator(address(currencyCollateralValidator));
    }
}
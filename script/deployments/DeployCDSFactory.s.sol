// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;


import {Script} from "forge-std/Script.sol";
import {CDSFactory} from "../../src/CDSFactory.sol";

import {IAlgebraFactory} from "@cryptoalgebra/integral-core/contracts/interfaces/IAlgebraFactory.sol";
import {IMentoStableCoinSelector} from "../../src/interfaces/IMentoStableCoinSelector.sol";

import {ICDSFactory} from "../../src/interfaces/ICDSFactory.sol";

contract DeployCDSFactory is Script {
    function run(
        IAlgebraFactory _algebraFactory,
        IMentoStableCoinSelector _mentoStableCoinSelector
    ) public returns (ICDSFactory) {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);
        CDSFactory cdsFactory = new CDSFactory(_algebraFactory, _mentoStableCoinSelector);
        vm.stopBroadcast();
        return ICDSFactory(address(cdsFactory));
    }
}
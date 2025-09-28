// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;


import {
    Test,
    console2
} from "forge-std/Test.sol";

import {
    IMentoStableCoinSelector,
    Always_cCOP_MentoSelector
} from "../../src/mocks/Always_cCOP_MentoSelector.sol";

import {
    IAlgebraFactory,
    AlgebraFactory
} from "@cryptoalgebra/integral-core/contracts/AlgebraFactory.sol";


import {
    CDSFactory,
    ICDSFactory
} from "../../src/CDSFactory.sol";

contract CDSFactoryDeployers is Test {
    CDSFactory public cdsFactory;

    function deployCDSFactory(
        IAlgebraFactory algebraFactory,
        IMentoStableCoinSelector mentoStableCoinSelector
    ) public returns (ICDSFactory) {
        cdsFactory = new CDSFactory(algebraFactory, mentoStableCoinSelector);
        return ICDSFactory(address(cdsFactory));
    }

}
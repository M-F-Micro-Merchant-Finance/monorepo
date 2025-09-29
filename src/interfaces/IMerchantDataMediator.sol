// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;



import {IAlgebraCustomPluginFactory} from "@cryptoalgebra/default-plugin/contracts/interfaces/IAlgebraCustomPluginFactory.sol";
import {ICollateralModule} from "@synthetixio/synthetix/contracts/interfaces/ICollateralModule.sol";

interface IMerchantDataMediator is IAlgebraCustomPluginFactory, ICollateralModule {
    // TODO: Should this method have a return type ??
    function onUserDataHook(bytes memory userData) external;
}
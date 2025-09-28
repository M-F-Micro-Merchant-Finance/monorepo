// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;



import {IAlgebraCustomPluginFactory} from "@cryptoalgebra/default-plugin/contracts/interfaces/IAlgebraCustomPluginFactory.sol";

interface IMerchantDataMediator is IAlgebraCustomPluginFactory {
    // TODO: Should this method have a return type ??
    function onUserDataHook(bytes memory userData) external;
}
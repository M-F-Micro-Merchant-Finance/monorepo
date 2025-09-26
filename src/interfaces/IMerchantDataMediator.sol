// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;



import {IAlgebraCustomPoolEntryPoint} from "@cryptoalgebra/integral-periphery/contracts/interfaces/IAlgebraCustomPoolEntryPoint.sol";

interface IMerchantDataMediator is IAlgebraCustomPoolEntryPoint {
    // TODO: Should this method have a return type ??
    function onUserDataHook(bytes memory userData) external;
}
// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;


interface IMerchantDataMediator {
    // TODO: Should this method have a return type ??
    function onUserDataHook(bytes memory userData) external;
}
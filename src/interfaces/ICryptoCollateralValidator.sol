// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import {IValidationStrategy} from "./IValidationStrategy.sol";
import {CollateralType} from "../types/Shared.sol";

interface ICryptoCollateralValidator is IValidationStrategy {
    error CryptoCollateralValidator__InvalidCollateralType(CollateralType collateralType);
}
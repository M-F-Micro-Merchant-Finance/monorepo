// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import {Collateral} from "../types/Shared.sol";

interface IValidationStrategy {
  function validate(Collateral memory collateral) external view returns (bool);    
}
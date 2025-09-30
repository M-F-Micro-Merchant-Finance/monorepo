// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;


import {Collateral} from "../types/Shared.sol";
import {Metrics} from "../types/Metrics.sol";

interface ICreditAssesmentManager {
    function getCollateralInfo(bytes32 creditAssesmentId) external view returns (Collateral memory collateral);
    function getMetrics(bytes32 creditAssesmentId) external view returns (Metrics memory metrics);
    function setCollateralInfo(bytes32 creditAssesmentId, Collateral memory collateral) external;
    function setMetrics(bytes32 creditAssesmentId, Metrics memory metrics) external;

}
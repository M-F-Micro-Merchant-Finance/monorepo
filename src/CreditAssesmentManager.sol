// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import {ICreditAssesmentManager} from "./interfaces/ICreditAssesmentManager.sol";
import {Collateral} from "./types/Shared.sol";
import {Metrics} from "./types/Metrics.sol";

contract CreditAssesmentManager is ICreditAssesmentManager {
    bytes32 public immutable businessId;
    bytes32 public immutable countryCodeHash;
    

    

    mapping(bytes32 creditAssesmentId => Collateral collateral) private creditAssesmentIdToCollateral;
    mapping(bytes32 creditAssesmentId => Metrics metrics) private creditAssesmentIdToMetrics;

    constructor(bytes32 _businessId, bytes32 _countryCodeHash) {
        businessId = _businessId;
        countryCodeHash = _countryCodeHash;
    }
    

    function setCollateralInfo(bytes32 creditAssesmentId, Collateral memory collateral) external {
        creditAssesmentIdToCollateral[creditAssesmentId] = collateral;
    }

    function setMetrics(bytes32 creditAssesmentId, Metrics memory metrics) external {
        creditAssesmentIdToMetrics[creditAssesmentId] = metrics;
    }
 
    function getCollateralInfo(bytes32 creditAssesmentId) external view returns (Collateral memory collateral) {
        return creditAssesmentIdToCollateral[creditAssesmentId];
    }

    function getMetrics(bytes32 creditAssesmentId) external view returns (Metrics memory metrics) {
        return creditAssesmentIdToMetrics[creditAssesmentId];
    }
}
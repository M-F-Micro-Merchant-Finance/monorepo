// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;


import {Collateral} from "../types/Shared.sol";
import {Metrics} from "../types/Metrics.sol";

interface ICreditAssesmentManager {
    enum CacheSlot {
        CACHE_SLOT_0,
        CACHE_SLOT_1
    }

    function getCollateralInfo(bytes32 creditAssesmentId) external view returns (Collateral memory collateral);
    function getMetrics(bytes32 creditAssesmentId) external view returns (Metrics memory metrics);
    function setCollateralInfo(bytes32 creditAssesmentId, Collateral memory collateral) external;
    function setMetrics(bytes32 creditAssesmentId, Metrics memory metrics) external;
    function getTotalCDSTokensSupply(bytes32 creditAssesmentId) external view returns (uint256);
    function sellCDSTokens(
        bytes32 creditAssesmentId,
        uint256 amount,
        address receiver
    ) external returns (uint256 stableCoinAmount);

    function getCache(CacheSlot slot) external view returns (bytes32);
    function writeToCache(CacheSlot slot, bytes32 value) external;
    function readFromCache(CacheSlot slot) external view returns (bytes32);

    function grantFundManagerRole(address fundManager) external;

}
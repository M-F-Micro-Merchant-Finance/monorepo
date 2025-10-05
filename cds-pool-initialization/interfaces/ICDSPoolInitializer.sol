// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import {Metrics} from "../../src/types/Metrics.sol";

/**
 * @title ICDSPoolInitializer
 * @notice Interface for CDS pool initialization functionality
 */
interface ICDSPoolInitializer {
    
    // Events
    event PoolInitialized(
        address indexed pool,
        address indexed cdsToken,
        address indexed stablecoin,
        uint160 initialPrice,
        uint256 cdsLiquidity,
        uint256 stablecoinLiquidity
    );
    
    event PriceUpdated(
        address indexed pool,
        uint160 oldPrice,
        uint160 newPrice,
        uint256 timestamp
    );
    
    // Structs
    struct LiquiditySeedingParams {
        uint256 cdsTokenAmount;
        uint256 stablecoinAmount;
        uint256 minLiquidity;
        uint256 maxSlippage;
    }
    
    struct PriceBounds {
        uint160 minPrice;
        uint160 maxPrice;
        uint256 lastUpdate;
    }
    
    // Functions
    function initializeCDSPool(
        address cdsToken,
        address stablecoin,
        Metrics memory metrics,
        uint256 totalSupply,
        address creator
    ) external returns (address pool);
    
    function calculateInitialPrice(Metrics memory metrics) external pure returns (uint160);
    function calculateRiskAdjustedValue(Metrics memory metrics) external pure returns (uint256);
    function calculateInitialLiquidity(
        Metrics memory metrics, 
        uint256 totalSupply
    ) external pure returns (LiquiditySeedingParams memory);
    
    function updatePoolPrice(address pool, Metrics memory newMetrics) external;
    function getPoolPrice(address pool) external view returns (uint160 price);
    function canUpdatePool(address pool) external view returns (bool canUpdate);
    function getPoolPriceBounds(address pool) external view returns (PriceBounds memory bounds);
    
    // View functions
    function isInitializedPool(address pool) external view returns (bool);
    function poolPrices(address pool) external view returns (uint160);
    function lastPriceUpdate(address pool) external view returns (uint256);
}





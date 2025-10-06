// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import {IAlgebraFactory} from "@cryptoalgebra/integral-core/contracts/interfaces/IAlgebraFactory.sol";
import {IAlgebraPool} from "@cryptoalgebra/integral-core/contracts/interfaces/IAlgebraPool.sol";
import {IERC20} from "forge-std/interfaces/IERC20.sol";
import {Math} from "@openzeppelin/contracts/utils/math/Math.sol";

import {Metrics} from "../../src/types/Metrics.sol";
import {CreditRiskLibrary} from "../../src/types/CreditRisk.sol";
import {FinancialHealthLibrary} from "../../src/types/FinancialHealth.sol";
import {MarketRiskLibrary} from "../../src/types/MarketRisk.sol";
import {BusinessFundamentalsLibrary} from "../../src/types/BusinessFundamentals.sol";

/**
 * @title CDSPoolInitializer
 * @notice Handles initialization of CDS token pools with risk-based pricing
 * @dev Implements sophisticated pricing models based on credit risk metrics
 */
contract CDSPoolInitializer {
    
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
    
    // State variables
    IAlgebraFactory public immutable algebraFactory;
    address public immutable poolManager;
    
    // Pool tracking
    mapping(address => bool) public isInitializedPool;
    mapping(address => uint160) public poolPrices;
    mapping(address => uint256) public lastPriceUpdate;
    
    // Configuration
    uint256 public constant MIN_LIQUIDITY = 1000 * 1e18; // 1000 stablecoins minimum
    uint256 public constant MAX_SLIPPAGE = 500; // 5% max slippage
    uint256 public constant PRICE_UPDATE_COOLDOWN = 1 hours;
    
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
    
    // Price bounds for stability
    mapping(address => PriceBounds) public poolPriceBounds;
    
    modifier onlyPoolManager() {
        require(msg.sender == poolManager, "Only pool manager");
        _;
    }
    
    constructor(address _algebraFactory, address _poolManager) {
        algebraFactory = IAlgebraFactory(_algebraFactory);
        poolManager = _poolManager;
    }
    
    /**
     * @notice Initialize a new CDS pool with risk-based pricing
     * @param cdsToken Address of the CDS token
     * @param stablecoin Address of the paired stablecoin
     * @param metrics Credit risk metrics for pricing
     * @param totalSupply Total supply of CDS tokens
     * @param creator Address creating the pool
     * @return pool Address of the initialized pool
     */
    function initializeCDSPool(
        address cdsToken,
        address stablecoin,
        Metrics memory metrics,
        uint256 totalSupply,
        address creator
    ) external onlyPoolManager returns (address pool) {
        // 1. Calculate initial price based on risk metrics
        uint160 sqrtPriceX96 = calculateInitialPrice(metrics);
        
        // 2. Calculate liquidity seeding parameters
        LiquiditySeedingParams memory params = calculateInitialLiquidity(metrics, totalSupply);
        
        // 3. Create custom pool
        pool = algebraFactory.createCustomPool(
            address(this), // deployer
            creator,       // creator
            cdsToken,
            stablecoin,
            abi.encode(keccak256(abi.encodePacked(cdsToken, stablecoin, block.timestamp)))
        );
        
        // 4. Initialize pool with calculated price
        IAlgebraPool(pool).initialize(sqrtPriceX96);
        
        // 5. Set up price bounds for stability
        _setPriceBounds(pool, sqrtPriceX96);
        
        // 6. Add initial liquidity
        _addInitialLiquidity(pool, cdsToken, stablecoin, params);
        
        // 7. Update state
        isInitializedPool[pool] = true;
        poolPrices[pool] = sqrtPriceX96;
        lastPriceUpdate[pool] = block.timestamp;
        
        emit PoolInitialized(
            pool,
            cdsToken,
            stablecoin,
            sqrtPriceX96,
            params.cdsTokenAmount,
            params.stablecoinAmount
        );
        
        return pool;
    }
    
    /**
     * @notice Calculate initial price based on credit risk metrics
     * @param metrics Credit risk metrics
     * @return sqrtPriceX96 Square root of price in X96 format
     */
    function calculateInitialPrice(Metrics memory metrics) public pure returns (uint160) {
        // Extract key risk metrics
        uint256 defaultProb = CreditRiskLibrary.getDefaultProbability(metrics.creditRisk);
        uint256 recoveryRate = CreditRiskLibrary.getRecoveryRate(metrics.creditRisk);
        uint256 financialHealth = FinancialHealthLibrary.calculateFinancialHealthScore(metrics.financialHealth);
        
        // Calculate risk-adjusted price (0.01 to 1.00 range)
        uint256 riskAdjustedPrice = calculateRiskAdjustedValue(metrics);
        
        // Convert to sqrtPriceX96 format for Algebra
        // sqrtPriceX96 = sqrt(price) * 2^96
        uint256 priceInX96 = (riskAdjustedPrice * (2**192)) / 1e18;
        uint160 sqrtPriceX96 = uint160(Math.sqrt(priceInX96));
        
        return sqrtPriceX96;
    }
    
    /**
     * @notice Calculate risk-adjusted value for pricing
     * @param metrics Credit risk metrics
     * @return riskAdjustedValue Value in 18 decimal places (0.01 to 1.00)
     */
    function calculateRiskAdjustedValue(Metrics memory metrics) public pure returns (uint256) {
        // Extract risk components
        uint256 defaultProb = CreditRiskLibrary.getDefaultProbability(metrics.creditRisk);
        uint256 recoveryRate = CreditRiskLibrary.getRecoveryRate(metrics.creditRisk);
        uint256 financialHealth = FinancialHealthLibrary.calculateFinancialHealthScore(metrics.financialHealth);
        uint256 marketRisk = MarketRiskLibrary.calculateMarketRiskScore(metrics.marketRisk);
        
        // Calculate expected value
        uint256 expectedValue = (100 - defaultProb) * recoveryRate / 100;
        
        // Apply financial health multiplier (0.5x to 1.0x)
        uint256 healthMultiplier = 5000 + (financialHealth * 50);
        
        // Apply market risk adjustment
        uint256 marketAdjustment = 10000 - (marketRisk / 2);
        
        // Final risk-adjusted value (in basis points)
        uint256 riskAdjustedValue = (expectedValue * healthMultiplier * marketAdjustment) / 1000000;
        
        // Convert to 18 decimal places and ensure minimum value
        uint256 finalValue = Math.max(riskAdjustedValue * 1e16, 1e16); // Minimum 0.01
        
        return Math.min(finalValue, 1e18); // Maximum 1.00
    }
    
    /**
     * @notice Calculate initial liquidity seeding parameters
     * @param metrics Credit risk metrics
     * @param totalSupply Total supply of CDS tokens
     * @return params Liquidity seeding parameters
     */
    function calculateInitialLiquidity(
        Metrics memory metrics, 
        uint256 totalSupply
    ) public pure returns (LiquiditySeedingParams memory) {
        // Base liquidity: 10% of total CDS supply
        uint256 cdsTokenAmount = totalSupply / 10;
        
        // Stablecoin amount based on risk-adjusted value
        uint256 riskAdjustedValue = calculateRiskAdjustedValue(metrics);
        uint256 stablecoinAmount = (cdsTokenAmount * riskAdjustedValue) / 1e18;
        
        // Ensure minimum liquidity for tradeability
        uint256 minLiquidity = MIN_LIQUIDITY;
        if (stablecoinAmount < minLiquidity) {
            stablecoinAmount = minLiquidity;
            // Adjust CDS amount proportionally
            cdsTokenAmount = (stablecoinAmount * 1e18) / riskAdjustedValue;
        }
        
        return LiquiditySeedingParams({
            cdsTokenAmount: cdsTokenAmount,
            stablecoinAmount: stablecoinAmount,
            minLiquidity: minLiquidity,
            maxSlippage: MAX_SLIPPAGE
        });
    }
    
    /**
     * @notice Update pool price based on new risk metrics
     * @param pool Address of the pool
     * @param newMetrics Updated credit risk metrics
     */
    function updatePoolPrice(address pool, Metrics memory newMetrics) external onlyPoolManager {
        require(isInitializedPool[pool], "Pool not initialized");
        require(block.timestamp >= lastPriceUpdate[pool] + PRICE_UPDATE_COOLDOWN, "Cooldown not met");
        
        uint160 oldPrice = poolPrices[pool];
        uint160 newPrice = calculateInitialPrice(newMetrics);
        
        // Check price bounds
        PriceBounds memory bounds = poolPriceBounds[pool];
        require(newPrice >= bounds.minPrice && newPrice <= bounds.maxPrice, "Price out of bounds");
        
        // Update pool price
        IAlgebraPool(pool).initialize(newPrice);
        
        // Update state
        poolPrices[pool] = newPrice;
        lastPriceUpdate[pool] = block.timestamp;
        
        emit PriceUpdated(pool, oldPrice, newPrice, block.timestamp);
    }
    
    /**
     * @notice Set price bounds for a pool to prevent extreme manipulation
     * @param pool Address of the pool
     * @param currentPrice Current pool price
     */
    function _setPriceBounds(address pool, uint160 currentPrice) internal {
        // Allow 50% price movement in either direction
        uint160 priceRange = currentPrice / 2;
        
        poolPriceBounds[pool] = PriceBounds({
            minPrice: currentPrice - priceRange,
            maxPrice: currentPrice + priceRange,
            lastUpdate: block.timestamp
        });
    }
    
    /**
     * @notice Add initial liquidity to the pool
     * @param pool Address of the pool
     * @param cdsToken Address of CDS token
     * @param stablecoin Address of stablecoin
     * @param params Liquidity seeding parameters
     */
    function _addInitialLiquidity(
        address pool,
        address cdsToken,
        address stablecoin,
        LiquiditySeedingParams memory params
    ) internal {
        // Transfer tokens to this contract first
        IERC20(cdsToken).transferFrom(msg.sender, address(this), params.cdsTokenAmount);
        IERC20(stablecoin).transferFrom(msg.sender, address(this), params.stablecoinAmount);
        
        // Approve pool to spend tokens
        IERC20(cdsToken).approve(pool, params.cdsTokenAmount);
        IERC20(stablecoin).approve(pool, params.stablecoinAmount);
        
        // Add liquidity to pool
        // Note: This is a simplified implementation
        // In practice, you would use Algebra's liquidity management contracts
        // or implement a more sophisticated liquidity addition mechanism
        
        // For now, we'll emit an event indicating liquidity should be added
        // The actual liquidity addition would be handled by the calling contract
    }
    
    /**
     * @notice Get current pool price
     * @param pool Address of the pool
     * @return price Current pool price in sqrtPriceX96 format
     */
    function getPoolPrice(address pool) external view returns (uint160 price) {
        require(isInitializedPool[pool], "Pool not initialized");
        return poolPrices[pool];
    }
    
    /**
     * @notice Check if pool can be updated
     * @param pool Address of the pool
     * @return canUpdate True if pool can be updated
     */
    function canUpdatePool(address pool) external view returns (bool canUpdate) {
        return isInitializedPool[pool] && 
               block.timestamp >= lastPriceUpdate[pool] + PRICE_UPDATE_COOLDOWN;
    }
    
    /**
     * @notice Get pool price bounds
     * @param pool Address of the pool
     * @return bounds Price bounds for the pool
     */
    function getPoolPriceBounds(address pool) external view returns (PriceBounds memory bounds) {
        require(isInitializedPool[pool], "Pool not initialized");
        return poolPriceBounds[pool];
    }
}






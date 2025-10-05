// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import {Test} from "forge-std/Test.sol";
import {console2} from "forge-std/console2.sol";

import {CDSPoolInitializer} from "../contracts/CDSPoolInitializer.sol";
import {Metrics} from "../../src/types/Metrics.sol";
import {CreditRiskLibrary} from "../../src/types/CreditRisk.sol";
import {FinancialHealthLibrary} from "../../src/types/FinancialHealth.sol";
import {MarketRiskLibrary} from "../../src/types/MarketRisk.sol";
import {BusinessFundamentalsLibrary} from "../../src/types/BusinessFundamentals.sol";

contract CDSPoolInitializerTest is Test {
    
    CDSPoolInitializer poolInitializer;
    address algebraFactory;
    address poolManager;
    
    // Test addresses
    address cdsToken;
    address stablecoin;
    address creator;
    
    // Test metrics
    Metrics testMetrics;
    
    function setUp() public {
        // Deploy mock contracts
        algebraFactory = makeAddr("AlgebraFactory");
        poolManager = makeAddr("PoolManager");
        cdsToken = makeAddr("CDSToken");
        stablecoin = makeAddr("Stablecoin");
        creator = makeAddr("Creator");
        
        // Deploy pool initializer
        poolInitializer = new CDSPoolInitializer(algebraFactory, poolManager);
        
        // Create test metrics
        testMetrics = Metrics(
            FinancialHealthLibrary.pack(
                Score.wrap(80), // liquidity
                Score.wrap(70), // leverage
                Score.wrap(85), // cashFlow
                Score.wrap(75)  // profitability
            ),
            MarketRiskLibrary.pack(
                Score.wrap(30), // volatility
                Rating.wrap(3), // economic cycle
                Rating.wrap(4), // regulatory stability
                Rating.wrap(2)  // seasonality
            ),
            BusinessFundamentalsLibrary.pack(
                Score.wrap(75), // business age
                Score.wrap(80), // revenue stability
                Score.wrap(70), // market position
                Score.wrap(65), // industry risk
                Score.wrap(85)  // regulatory compliance
            ),
            CreditRiskLibrary.pack(
                Score.wrap(75), // credit score
                Score.wrap(5),  // default probability
                Score.wrap(60), // loss given default
                Score.wrap(40)  // recovery rate
            )
        );
    }
    
    function testCalculateRiskAdjustedValue() public {
        uint256 riskAdjustedValue = poolInitializer.calculateRiskAdjustedValue(testMetrics);
        
        // Should be between 0.01 and 1.00 (1e16 to 1e18)
        assertTrue(riskAdjustedValue >= 1e16, "Value too low");
        assertTrue(riskAdjustedValue <= 1e18, "Value too high");
        
        console2.log("Risk adjusted value:", riskAdjustedValue);
    }
    
    function testCalculateInitialPrice() public {
        uint160 sqrtPriceX96 = poolInitializer.calculateInitialPrice(testMetrics);
        
        // Price should be positive
        assertTrue(sqrtPriceX96 > 0, "Price should be positive");
        
        console2.log("Initial price (sqrtPriceX96):", sqrtPriceX96);
    }
    
    function testCalculateInitialLiquidity() public {
        uint256 totalSupply = 100000 * 1e18; // 100k tokens
        
        (uint256 cdsAmount, uint256 stablecoinAmount, uint256 minLiquidity, uint256 maxSlippage) = 
            poolInitializer.calculateInitialLiquidity(testMetrics, totalSupply);
        
        // CDS amount should be 10% of total supply
        assertEq(cdsAmount, totalSupply / 10, "CDS amount should be 10% of total supply");
        
        // Stablecoin amount should be positive
        assertTrue(stablecoinAmount > 0, "Stablecoin amount should be positive");
        
        // Should meet minimum liquidity requirement
        assertTrue(stablecoinAmount >= minLiquidity, "Should meet minimum liquidity");
        
        console2.log("CDS amount:", cdsAmount);
        console2.log("Stablecoin amount:", stablecoinAmount);
        console2.log("Min liquidity:", minLiquidity);
    }
    
    function testCalculateInitialLiquidityWithLowSupply() public {
        uint256 totalSupply = 5000 * 1e18; // 5k tokens (low supply)
        
        (uint256 cdsAmount, uint256 stablecoinAmount, uint256 minLiquidity, uint256 maxSlippage) = 
            poolInitializer.calculateInitialLiquidity(testMetrics, totalSupply);
        
        // Should still meet minimum liquidity requirement
        assertTrue(stablecoinAmount >= minLiquidity, "Should meet minimum liquidity even with low supply");
        
        console2.log("Low supply - CDS amount:", cdsAmount);
        console2.log("Low supply - Stablecoin amount:", stablecoinAmount);
    }
    
    function testPriceBounds() public {
        uint160 initialPrice = poolInitializer.calculateInitialPrice(testMetrics);
        
        // Price should be within reasonable bounds
        assertTrue(initialPrice > 0, "Price should be positive");
        
        // For a risk-adjusted value around 0.5, sqrtPriceX96 should be around sqrt(0.5) * 2^96
        uint256 expectedPrice = uint256(initialPrice) * uint256(initialPrice) / (2**192);
        console2.log("Expected price (1e18 units):", expectedPrice);
    }
    
    function testRiskAdjustedValueRange() public {
        // Test with different risk profiles
        
        // High risk profile
        Metrics memory highRiskMetrics = Metrics(
            FinancialHealthLibrary.pack(Score.wrap(20), Score.wrap(30), Score.wrap(25), Score.wrap(20)),
            MarketRiskLibrary.pack(Score.wrap(80), Rating.wrap(1), Rating.wrap(2), Rating.wrap(1)),
            BusinessFundamentalsLibrary.pack(Score.wrap(30), Score.wrap(25), Score.wrap(20), Score.wrap(15), Score.wrap(35)),
            CreditRiskLibrary.pack(Score.wrap(30), Score.wrap(25), Score.wrap(80), Score.wrap(20))
        );
        
        uint256 highRiskValue = poolInitializer.calculateRiskAdjustedValue(highRiskMetrics);
        console2.log("High risk value:", highRiskValue);
        
        // Low risk profile
        Metrics memory lowRiskMetrics = Metrics(
            FinancialHealthLibrary.pack(Score.wrap(95), Score.wrap(90), Score.wrap(95), Score.wrap(90)),
            MarketRiskLibrary.pack(Score.wrap(10), Rating.wrap(5), Rating.wrap(5), Rating.wrap(5)),
            BusinessFundamentalsLibrary.pack(Score.wrap(95), Score.wrap(90), Score.wrap(95), Score.wrap(90), Score.wrap(95)),
            CreditRiskLibrary.pack(Score.wrap(95), Score.wrap(2), Score.wrap(20), Score.wrap(80))
        );
        
        uint256 lowRiskValue = poolInitializer.calculateRiskAdjustedValue(lowRiskMetrics);
        console2.log("Low risk value:", lowRiskValue);
        
        // Low risk should have higher value than high risk
        assertTrue(lowRiskValue > highRiskValue, "Low risk should have higher value");
    }
    
    function testEdgeCases() public {
        // Test with minimum values
        Metrics memory minMetrics = Metrics(
            FinancialHealthLibrary.pack(Score.wrap(0), Score.wrap(0), Score.wrap(0), Score.wrap(0)),
            MarketRiskLibrary.pack(Score.wrap(100), Rating.wrap(1), Rating.wrap(1), Rating.wrap(1)),
            BusinessFundamentalsLibrary.pack(Score.wrap(0), Score.wrap(0), Score.wrap(0), Score.wrap(0), Score.wrap(0)),
            CreditRiskLibrary.pack(Score.wrap(0), Score.wrap(100), Score.wrap(100), Score.wrap(0))
        );
        
        uint256 minValue = poolInitializer.calculateRiskAdjustedValue(minMetrics);
        assertTrue(minValue >= 1e16, "Should have minimum value of 0.01");
        
        // Test with maximum values
        Metrics memory maxMetrics = Metrics(
            FinancialHealthLibrary.pack(Score.wrap(100), Score.wrap(100), Score.wrap(100), Score.wrap(100)),
            MarketRiskLibrary.pack(Score.wrap(0), Rating.wrap(5), Rating.wrap(5), Rating.wrap(5)),
            BusinessFundamentalsLibrary.pack(Score.wrap(100), Score.wrap(100), Score.wrap(100), Score.wrap(100), Score.wrap(100)),
            CreditRiskLibrary.pack(Score.wrap(100), Score.wrap(0), Score.wrap(0), Score.wrap(100))
        );
        
        uint256 maxValue = poolInitializer.calculateRiskAdjustedValue(maxMetrics);
        assertTrue(maxValue <= 1e18, "Should have maximum value of 1.00");
    }
    
    function testAccessControl() public {
        // Test that only pool manager can call restricted functions
        vm.prank(makeAddr("Unauthorized"));
        vm.expectRevert("Only pool manager");
        poolInitializer.initializeCDSPool(cdsToken, stablecoin, testMetrics, 100000 * 1e18, creator);
    }
}





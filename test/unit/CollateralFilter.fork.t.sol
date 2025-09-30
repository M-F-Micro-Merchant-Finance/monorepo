// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import {
    Test,
    console2
} from "forge-std/Test.sol";

import {CollateralFilter} from "../../src/CollateralFilter.sol";
import {IReserve} from "@mento/core/contracts/interfaces/IReserve.sol";

import {CurrencyCollateralValidator} from "../../src/CurrencyCollateralValidator.sol";
import {ICurrencyCollateralValidator} from "../../src/interfaces/ICurrencyCollateralValidator.sol";

import{
    CollateralType,
    Collateral
} from "../../src/types/Shared.sol";
import {Currency} from "@uniswap/v4-core/src/types/Currency.sol";

contract CollateralFilterTests is Test {

    CollateralFilter public collateralFilter;
    IReserve public mentoReserve;
    CurrencyCollateralValidator public currencyCollateralValidator;
    

    address whaleDeployer = address(0xf6436829Cf96EA0f8BC49d300c536FCC4f84C4ED);
    address USDC = address(0xcebA9300f2b948710d2653dD7B07f33A8B32118C);
    address mentoReserveProxy = address(0x9380fA34Fd9e4Fd14c06305fd7B6199089eD4eb9);


    bool forked;



    function setUp() public {
        try vm.envString("ALCHEMY_API_KEY") returns (string memory) {
    
            console2.log("Forked Celo mainnet");
            vm.createSelectFork(vm.rpcUrl("celo"), 47_187_910);
            mentoReserve = IReserve(mentoReserveProxy);
            vm.label(address(mentoReserve), "mentoReserve");
            vm.startPrank(whaleDeployer);
            collateralFilter = new CollateralFilter();
            currencyCollateralValidator = new CurrencyCollateralValidator(mentoReserve);
            vm.stopPrank();
            forked = true;

        
        } catch {
            console2.log(
                "Skipping forked tests, no alchemy key found. Add ALCHEMY_API_KEY env var to .env to run forked tests."
            );
        }
        

    
    }

    function test__merchantOnboarding__addCurrencyValidationStrategySuccess() public {

        vm.startPrank(whaleDeployer);
        collateralFilter.setValidationStrategy(CollateralType.CURRENCY, currencyCollateralValidator);
        vm.stopPrank();


        assertEq(address(collateralFilter.getValidationStrategy(CollateralType.CURRENCY)), address(currencyCollateralValidator));
    }

    function test__merchantOnboarding__whitelistCurrencySuccess() public {
        test__merchantOnboarding__addCurrencyValidationStrategySuccess();
        vm.startPrank(whaleDeployer);
        collateralFilter.addToWhitelist(Collateral({currency: Currency.wrap(USDC), collateralType: CollateralType.CURRENCY}));
        vm.stopPrank();
        assertTrue(collateralFilter.isWhitelisted(Collateral({currency: Currency.wrap(USDC), collateralType: CollateralType.CURRENCY})));
    }
    



    
}
// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;


import "../helpers/CDSFactoryDeployers.sol";
import "../helpers/AlgebraDeployers.sol";

import {ICDS} from "../../src/interfaces/ICDS.sol";

import {
    Always_cCOP_MentoSelector,
    IMentoStableCoinSelector
} from "../../src/mocks/Always_cCOP_MentoSelector.sol";

import {
    MerchantDataMediator,
    IMerchantDataMediator
} from "../../src/MerchantDataMediator.sol";

import {
    CollateralFilter,
    ICollateralFilter,
    CollateralType,
    Collateral
} from "../../src/CollateralFilter.sol";
import {
    CurrencyCollateralValidator,
    ICurrencyCollateralValidator,
    IReserve
} from "../../src/CurrencyCollateralValidator.sol";


import {
    MerchantIdentityVerificationMockDataGenerator
} from "../helpers/MerchantIdentityVerificationMockDataGenerator.sol";

import "../../src/types/Shared.sol";

import {
    Test,
    console2
} from "forge-std/Test.sol";

import {
    Metrics,
    MetricsLibrary
} from "../../src/types/Metrics.sol";

import {
    EnumerableMap
} from "@openzeppelin/contracts/utils/structs/EnumerableMap.sol";


contract MerchantDataMediatorForkTest is Test, CDSFactoryDeployers, AlgebraDeployers, MerchantIdentityVerificationMockDataGenerator{
    using MetricsLibrary for MerchantOnboardingData;
    using EnumerableMap for EnumerableMap.Bytes32ToBytes32Map;

    MerchantDataMediator public merchantDataMediator;
    IMentoStableCoinSelector public mentoStableCoinSelector;
    ICollateralFilter public collateralFilter;
    ICurrencyCollateralValidator public currencyCollateralValidator;
    IReserve public mentoReserve;

    address whaleDeployer = address(0xf6436829Cf96EA0f8BC49d300c536FCC4f84C4ED);
    address USDC = address(0xcebA9300f2b948710d2653dD7B07f33A8B32118C);
    address mentoReserveProxy = address(0x9380fA34Fd9e4Fd14c06305fd7B6199089eD4eb9);
    address CCOP = address(0x8A567e2aE79CA692Bd748aB832081C45de4041eA);

    bool forked;

    function setUp() public {
        try vm.envString("ALCHEMY_API_KEY") returns (string memory) {
            console2.log("Forked Celo mainnet");
            vm.createSelectFork(vm.rpcUrl("celo"), 47_187_910);
            mentoReserve = IReserve(mentoReserveProxy);
            vm.label(address(mentoReserve), "mentoReserve");
            deployFreshAlgebraFactoryAndPoolDeployer(whaleDeployer);
            vm.startPrank(whaleDeployer);
            collateralFilter = new CollateralFilter();
            currencyCollateralValidator = new CurrencyCollateralValidator(mentoReserve);
            collateralFilter.setValidationStrategy(CollateralType.CURRENCY, currencyCollateralValidator);
            collateralFilter.addToWhitelist(Collateral({currency: Currency.wrap(USDC), collateralType: CollateralType.CURRENCY, amount: 1000000000000000000}));
            Always_cCOP_MentoSelector always_cCOP_MentoSelector = new Always_cCOP_MentoSelector();
            mentoStableCoinSelector = IMentoStableCoinSelector(address(always_cCOP_MentoSelector));
            deployCDSFactory(algebraFactory, mentoStableCoinSelector);
            merchantDataMediator = new MerchantDataMediator(cdsFactory, ICollateralFilter(address(collateralFilter)));
            algebraFactory.grantRole(algebraFactory.CUSTOM_POOL_DEPLOYER(), address(cdsFactory));
            algebraFactory.grantRole(algebraFactory.CUSTOM_POOL_DEPLOYER(), whaleDeployer);
            algebraFactory.grantRole(algebraFactory.POOLS_ADMINISTRATOR_ROLE(), address(cdsFactory));
            algebraFactory.grantRole(algebraFactory.CUSTOM_POOL_DEPLOYER(), address(merchantDataMediator));
            algebraFactory.grantRole(algebraFactory.POOLS_ADMINISTRATOR_ROLE(), address(merchantDataMediator));
            cdsFactory.setMerchantDataMediator(merchantDataMediator);
            vm.stopPrank();
            forked = true;
        } catch {
            console2.log("Skipping forked tests, no alchemy key found. Add ALCHEMY_API_KEY env var to .env to run forked tests.");
        }
    }

    function test__merchantOnboardingData__fromUserDataToPoolCreationSuccess() public {
        assertTrue(forked);
        MerchantOnboardingData memory merchantOnboardingData = _generateMockMerchantOnboardingData(whaleDeployer, Collateral({currency: Currency.wrap(USDC), collateralType: CollateralType.CURRENCY, amount: 1000000000000000000}));
        bytes memory userData = abi.encode(merchantOnboardingData);
        vm.startPrank(whaleDeployer);
        // TODO: Check for event emissions
        merchantDataMediator.onUserDataHook(userData);
        // NOTE: The merchantWallet can query his own cds created
        address cdsAddress = address(
            cdsFactory.getCDS(merchantOnboardingData.creditAssesmentId)
        );
        assertTrue(cdsAddress != address(0x00));
        // NOTE: The merchant can query the balance assocaited with this credit asssesment
        uint256 balance = ICDS(cdsAddress).balanceOf(whaleDeployer, uint256(merchantOnboardingData.creditAssesmentId));
        assertTrue(balance > 0);
        // NOTE: The merchant can query the balance assocaited with this credit asssesment
        uint256 totalSupply = ICDS(cdsAddress).totalSupply(uint256(merchantOnboardingData.creditAssesmentId));
        assertTrue(totalSupply > 0);
        // NOTE At initalization if no borrower has purchsed the CDS the balance of the merchant on the
        // CDS is the total supply
        assertEq(totalSupply, balance);
        string memory tokenName = ICDS(cdsAddress).name(uint256(merchantOnboardingData.creditAssesmentId));
        assertEq(keccak256(bytes(tokenName)), keccak256(
            bytes(
                string(
                    abi.encodePacked(
                        merchantOnboardingData.businessId,
                        merchantOnboardingData.countryCodeHash,
                        merchantOnboardingData.creditAssesmentId
                    )
                )
            )
        ));
        string memory tokenSymbol = ICDS(cdsAddress).symbol(uint256(merchantOnboardingData.creditAssesmentId));
        assertEq(keccak256(bytes(tokenSymbol)), keccak256(bytes("CDS")));
        string memory tokenURI = ICDS(cdsAddress).tokenURI(uint256(merchantOnboardingData.creditAssesmentId));
        assertEq(keccak256(bytes(tokenURI)), keccak256(bytes("https://api.cds.com/")));
        vm.stopPrank();
        assertTrue(forked);

        // NOTE : Now on the pool information queriable by anyone ...


        // NOTE: Anyone should be able to query the pool address by the
        // credit asssesment id

        // TODO: This is to be implemented on the IMerchantDataMediator

        // NOTE: Another way is if someone knows the tokens paired addresses
        address cdsPool = IAlgebraFactory(merchantDataMediator.algebraFactory()).customPoolByPair(
            address(merchantDataMediator),
            cdsAddress,
            CCOP
        );
        assertTrue(cdsPool != address(0x00));
        vm.startPrank(whaleDeployer);
        // TODO: This always needs to be done as the protectionSeller manages the token 
        ICDS(cdsAddress).approve(
            merchantOnboardingData.protectionSeller,
            uint256(merchantOnboardingData.creditAssesmentId),
            ICDS(cdsAddress).balanceOf(whaleDeployer, uint256(merchantOnboardingData.creditAssesmentId))
        );
        bytes32 countryCodeHash = merchantDataMediator.getBusinessCountryById(merchantOnboardingData.businessId);
        assertEq(countryCodeHash, merchantOnboardingData.countryCodeHash);
        vm.stopPrank();

        // NOTE: How many businesses are there in the country ?
        // NOTE: How many credit assesments are in the business ?
        // NOTE: What information is to be stored on the credit assesments
        // historically ?
        Metrics memory metrics = merchantDataMediator.getCreditAssesmentMetrics(merchantOnboardingData.businessId, merchantOnboardingData.countryCodeHash, merchantOnboardingData.creditAssesmentId);
        assertEq(keccak256(abi.encode(metrics)), keccak256(abi.encode(merchantOnboardingData.buildMetrics())));
        Collateral memory collateral = merchantDataMediator.getCreditAssesmentCollateral(merchantOnboardingData.businessId, merchantOnboardingData.countryCodeHash, merchantOnboardingData.creditAssesmentId);
        assertEq(Currency.unwrap(collateral.currency), merchantOnboardingData.collateralAddress);
        assertEq(uint8(collateral.collateralType), merchantOnboardingData.collateralType);
        // ================================CDS Factory state =====================================================
        assertTrue(cdsFactory.isCDSDeployed(merchantOnboardingData.creditAssesmentId));
        // ================================CollateralFilter state ============================================
        // assertTrue(collateralFilter.isWhitelisted(collateral));
        //===================================Mediator State ===================================================
        assertEq(merchantDataMediator.getBusinessCountryById(merchantOnboardingData.businessId), merchantOnboardingData.countryCodeHash);
        uint256 EXPECTED_TOTAL_COUNTRIES = uint256(0x01);
        assertEq(merchantDataMediator.getTotalCountries(), EXPECTED_TOTAL_COUNTRIES);


    }


}

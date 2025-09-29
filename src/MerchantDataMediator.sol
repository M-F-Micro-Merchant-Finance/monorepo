// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import {IMerchantDataMediator} from "./interfaces/IMerchantDataMediator.sol";
import "./types/Shared.sol";
//==================================================================================
import {
    CreditRisk,
    CreditRiskLibrary
} from "./types/CreditRisk.sol";

import {
    BusinessFundamentals,
    BusinessFundamentalsLibrary
} from "./types/BusinessFundamentals.sol";

import {
    FinancialHealth,
    FinancialHealthLibrary
} from "./types/FinancialHealth.sol";

import {
    MarketRisk,
    MarketRiskLibrary
} from "./types/MarketRisk.sol";

import {
    Metrics,
    MetricsLibrary
} from "./types/Metrics.sol";
//==================================================================================


import {EnumerableMap} from "@openzeppelin/contracts/utils/structs/EnumerableMap.sol";

//==================================================================================

import {ICDSFactory} from "./interfaces/ICDSFactory.sol";
import {AlgebraCustomPoolEntryPoint} from "@cryptoalgebra/integral-periphery/contracts/AlgebraCustomPoolEntryPoint.sol";

import {AlgebraCustomPluginFactory} from "@cryptoalgebra/default-plugin/contracts/AlgebraCustomPluginFactory.sol";


import {console2} from "forge-std/console2.sol";

import {ICollateralFilter} from "./interfaces/ICollateralFilter.sol";

import {Currency} from "@uniswap/v4-core/src/types/Currency.sol";

import {CollateralModule} from "@synthetixio/synthetix/contracts/modules/core/CollateralModule.sol";
import {
    Collateral,
    CollateralType
} from "./types/Shared.sol";

contract MerchantDataMediator is IMerchantDataMediator, AlgebraCustomPluginFactory, CollateralModule {
    using CreditRiskLibrary for CreditRisk;
    using BusinessFundamentalsLibrary for BusinessFundamentals;
    using FinancialHealthLibrary for FinancialHealth;
    using MarketRiskLibrary for MarketRisk;
    using EnumerableMap for EnumerableMap.Bytes32ToBytes32Map;
    using MetricsLibrary for MerchantOnboardingData;


    ICDSFactory public immutable cdsFactory;
    ICollateralFilter public immutable collateralFilter;
    
    constructor(
        ICDSFactory _cdsFactory,
        ICollateralFilter _collateralFilter

    ) AlgebraCustomPluginFactory(_cdsFactory.factory(), address(_cdsFactory)) {
        cdsFactory = _cdsFactory;
        collateralFilter = _collateralFilter;
    }
 
 
 
    // NOTE The business Id hash also includes the country code hash
    // NOTE This is better saved on a mapping (one businessId has one countryCodeHash)
    mapping(bytes32 businessId => bytes32 countryCodeHash) private businessIdToCountryCodeHash;
    
    // One country code has many business Ids
    //NOTE: Country HashIt must coincide with one of the available countries
    // On the CountryCodes library 
    EnumerableMap.Bytes32ToBytes32Map private businessesPerCountry;

    // NOTE The financial profile is handled off-chain to calculate the dredi score
    // One businessId has one to many creditAssesmentId
    // Thus this is a enumerableMapping with keys businessId

    EnumerableMap.Bytes32ToBytes32Map private creditAssesmentIdsPerBusinessId;
    
    // NOTE: One creditAssesment has one colleteral thus this is a mapping
    // mapping(bytes32 creditAssesmentId => Collateral collateral)
    mapping(bytes32 creditAssesmentId => Collateral collateral) private creditAssesmentIdToCollateral;

    // NOTE: One creditAssesment has one metrics thus this is a mapping
    // mapping(bytes32 creditAssesmentId => Metrics metrics)
    mapping(bytes32 creditAssesmentId => Metrics metrics) private creditAssesmentMetrics;


    function onUserDataHook(bytes memory userData) external {
        
        MerchantOnboardingData memory merchantOnboardingData = abi.decode(userData, (MerchantOnboardingData));
        (address protectionSeller, address merchantWallet) = (merchantOnboardingData.protectionSeller, merchantOnboardingData.merchantWallet);
        Metrics memory metrics = merchantOnboardingData.buildMetrics();
        creditAssesmentMetrics[merchantOnboardingData.creditAssesmentId] = metrics;
        // NOTE: Validate the collateral
        collateralFilter.addToWhitelist(Collateral({
            currency: Currency.wrap(merchantOnboardingData.collateralAddress),
            collateralType: CollateralType(merchantOnboardingData.collateralType)
        }));


        cdsFactory.createCDS(
            protectionSeller,
            merchantWallet,
            merchantOnboardingData.businessId,
            merchantOnboardingData.countryCodeHash,
            merchantOnboardingData.creditAssesmentId, metrics
        );


        // NOTE: Update the business location mapping
        businessIdToCountryCodeHash[merchantOnboardingData.businessId] = merchantOnboardingData.countryCodeHash;
        // NOTE: Added  one more credit assesment to the business
        creditAssesmentIdsPerBusinessId.set(merchantOnboardingData.businessId, merchantOnboardingData.creditAssesmentId);
        // NOTE: Added the collateral used for the credit assesment
        creditAssesmentIdToCollateral[merchantOnboardingData.creditAssesmentId] = Collateral({
            currency: Currency.wrap(merchantOnboardingData.collateralAddress),
            collateralType: CollateralType(merchantOnboardingData.collateralType)
        });

    }
}
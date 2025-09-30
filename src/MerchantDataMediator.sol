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
import {
    CreditAssesmentManager,
    ICreditAssesmentManager
} from "./CreditAssesmentManager.sol";

import {Create2} from "@openzeppelin/contracts/utils/Create2.sol";


contract MerchantDataMediator is IMerchantDataMediator, AlgebraCustomPluginFactory{
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

    // TODO: This seems to be a conract
    mapping (bytes32 countryHash => mapping(bytes32 businessId => ICreditAssesmentManager creditAssesmentManager)) private creditAssesmentManagerPerCountryHashAndBusinessId;
  

    function onUserDataHook(bytes memory userData) external {
        
        MerchantOnboardingData memory merchantOnboardingData = abi.decode(userData, (MerchantOnboardingData));
        (address protectionSeller, address merchantWallet) = (merchantOnboardingData.protectionSeller, merchantOnboardingData.merchantWallet);
        Metrics memory metrics = merchantOnboardingData.buildMetrics();
        // NOTE: Validate the collateral
        // collateralFilter.addToWhitelist(Collateral({
        //     currency: Currency.wrap(merchantOnboardingData.collateralAddress),
        //     collateralType: CollateralType(merchantOnboardingData.collateralType)
        // }));


        cdsFactory.createCDS(
            protectionSeller,
            merchantWallet,
            merchantOnboardingData.businessId,
            merchantOnboardingData.countryCodeHash,
            merchantOnboardingData.creditAssesmentId,
            metrics
        );

        bytes memory constructorArgs = abi.encode(merchantOnboardingData.businessId, merchantOnboardingData.countryCodeHash);
        bytes memory bytecode = abi.encodePacked(
            type(CreditAssesmentManager).creationCode,
            constructorArgs
        );
        address creditAssesmentManagerAddress = Create2.deploy(
            uint256(0x00),
            keccak256(constructorArgs),
            bytecode
        );
        creditAssesmentManagerPerCountryHashAndBusinessId[merchantOnboardingData.countryCodeHash][merchantOnboardingData.businessId] = ICreditAssesmentManager(creditAssesmentManagerAddress);


        // NOTE: Update the business location mapping
        businessIdToCountryCodeHash[merchantOnboardingData.businessId] = merchantOnboardingData.countryCodeHash;
        businessesPerCountry.set(merchantOnboardingData.countryCodeHash, merchantOnboardingData.businessId);
        // NOTE: Added  one more credit assesment to the business


        creditAssesmentManagerPerCountryHashAndBusinessId[merchantOnboardingData.countryCodeHash][merchantOnboardingData.businessId].setCollateralInfo(merchantOnboardingData.creditAssesmentId, Collateral({
            currency: Currency.wrap(merchantOnboardingData.collateralAddress),
            collateralType: CollateralType(merchantOnboardingData.collateralType)
        }));
        creditAssesmentManagerPerCountryHashAndBusinessId[merchantOnboardingData.countryCodeHash][merchantOnboardingData.businessId].setMetrics(merchantOnboardingData.creditAssesmentId, metrics);
        
    }

    function getBusinessCountryById(bytes32 businessId) external view returns (bytes32) {
        return businessIdToCountryCodeHash[businessId];
    }
    function getCreditAssesmentMetrics(bytes32 businessId, bytes32 countryHash, bytes32 creditAssesmentId) external view returns (Metrics memory metrics) {
        return creditAssesmentManagerPerCountryHashAndBusinessId[countryHash][businessId].getMetrics(creditAssesmentId);
    }
    function getCreditAssesmentCollateral(bytes32 businessId, bytes32 countryHash, bytes32 creditAssesmentId) external view returns (Collateral memory collateral) {
        return creditAssesmentManagerPerCountryHashAndBusinessId[countryHash][businessId].getCollateralInfo(creditAssesmentId);
    }
    // function getTotalBusinessesOfCountry(bytes32 countryHash) external view returns (uint256) {
    //     return businessesPerCountry.length(countryHash);
    // }
    function getTotalCountries() external view returns (uint256) {
        return businessesPerCountry.length();
    }


}
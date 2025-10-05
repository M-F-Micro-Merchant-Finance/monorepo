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


import "@cryptoalgebra/default-plugin/contracts/AlgebraCustomPluginFactory.sol";



contract MerchantDataMediator is IMerchantDataMediator{
    using CreditRiskLibrary for CreditRisk;
    using BusinessFundamentalsLibrary for BusinessFundamentals;
    using FinancialHealthLibrary for FinancialHealth;
    using MarketRiskLibrary for MarketRisk;
    using EnumerableMap for EnumerableMap.Bytes32ToBytes32Map;
    using MetricsLibrary for MerchantOnboardingData;
    using MetricsLibrary for Metrics;

    // ===========ALGEBRA CUSTOM PLUGIN FACTORY==========================//
      bytes32 public constant override ALGEBRA_CUSTOM_PLUGIN_ADMINISTRATOR = keccak256('ALGEBRA_CUSTOM_PLUGIN_ADMINISTRATOR');

    /// @inheritdoc IAlgebraCustomPluginFactory
    address public immutable override algebraFactory;

    /// @inheritdoc IAlgebraCustomPluginFactory
    address public immutable entryPoint;

    /// @inheritdoc IDynamicFeePluginFactory
    AlgebraFeeConfiguration public override defaultFeeConfiguration; // values of constants for sigmoids in fee calculation formula

    /// @inheritdoc IFarmingPluginFactory
    address public override farmingAddress;

    /// @inheritdoc IAlgebraCustomPluginFactory
    mapping(address poolAddress => address pluginAddress) public override pluginByPool;
    
    modifier onlyAdministrator() {
        require(IAlgebraFactory(algebraFactory).hasRoleOrOwner(ALGEBRA_CUSTOM_PLUGIN_ADMINISTRATOR, msg.sender), 'Only administrator');
        _;
    }

    //===================================================================================



    ICDSFactory public immutable cdsFactory;
    ICollateralFilter public immutable collateralFilter;

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

    mapping (bytes32 countryHash => mapping(bytes32 businessId => ICreditAssesmentManager creditAssesmentManager)) private creditAssesmentManagerPerCountryHashAndBusinessId;

    
    constructor(
        ICDSFactory _cdsFactory,
        ICollateralFilter _collateralFilter

    ) {
        cdsFactory = _cdsFactory;
        collateralFilter = _collateralFilter;
        entryPoint = address(_cdsFactory);
        algebraFactory = _cdsFactory.factory();
        defaultFeeConfiguration = AdaptiveFee.initialFeeConfiguration();
    }
 
 
 
  

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

    // NOTE: Once created the CDS/STABLE pool we are going to have a cusotm plugin
    // but this at the same time needs to determine the initial price of the pool,
    // The beforeCreatePoolHooks deploys the credit assesment manager as the customplugin we
    // need to implement

    function beforeCreatePoolHook(
        address pool,
        address creator,
        address deployer,
        address token0,
        address token1,
        bytes calldata data
    ) external returns (address) {
        require(msg.sender == entryPoint);
        require(pluginByPool[pool] == address(0), 'Already created');
  
  
        (bytes32 creditAssesmentId, bytes32 businessId, bytes32 countryCodeHash, Metrics memory metrics) = abi.decode(data, (bytes32, bytes32, bytes32, Metrics));
        
        bytes memory constructorArgs = abi.encode(
            businessId,
            countryCodeHash,
            pool,
            algebraFactory,
            address(this)
        
        );
        bytes memory bytecode = abi.encodePacked(
            type(CreditAssesmentManager).creationCode,
            constructorArgs
        );
        address creditAssesmentManagerAddress = Create2.deploy(
            uint256(0x00),
            keccak256(constructorArgs),
            bytecode
        );

        pluginByPool[pool] = creditAssesmentManagerAddress;
        creditAssesmentManagerPerCountryHashAndBusinessId[countryCodeHash][businessId] = ICreditAssesmentManager(creditAssesmentManagerAddress);
        // NOTE: At this point the plugin is set, since we do not have a way to pass to the afterCreatePoolHook the metricst we do it here
        uint256 initialPrice = _calculateInitialPrice(businessId, countryCodeHash, creditAssesmentId, metrics);
        IAlgebraPoolActions(pool).initialize(uint160(initialPrice));
        return creditAssesmentManagerAddress;

    }

    // NOTE: The afterCreatePoolHook now that has the credit assesment manager deployed on the pool
    // can set the initial price of the pool
    function afterCreatePoolHook(
        address plugin,
        address pool,
        address deployer
    ) external view override {
         require(msg.sender == entryPoint);
       
    }


    /// @inheritdoc IAlgebraCustomPluginFactory
    function createCustomPool(address creator, address tokenA, address tokenB, bytes calldata data) external override returns (address customPool) {
        return IAlgebraCustomPoolEntryPoint(entryPoint).createCustomPool(address(this), creator, tokenA, tokenB, data);
    }

    /// @inheritdoc IDynamicFeePluginFactory
     function setDefaultFeeConfiguration(AlgebraFeeConfiguration calldata newConfig) external override onlyAdministrator {

        AdaptiveFee.validateFeeConfiguration(newConfig);
        defaultFeeConfiguration = newConfig;
        emit DefaultFeeConfiguration(newConfig);
    }

    /// @inheritdoc IFarmingPluginFactory
    function setFarmingAddress(address newFarmingAddress) external override onlyAdministrator {
        require(farmingAddress != newFarmingAddress);
        farmingAddress = newFarmingAddress;
        emit FarmingAddress(newFarmingAddress);
    }

    function _calculateInitialPrice(
        bytes32 businessId,
        bytes32 countryCodeHash,
        bytes32 creditAssesmentId,
        Metrics memory metrics
    ) internal view returns (uint256) {
        // NOTE: Addtional checks should be done here
        return MetricsLibrary.calculateInitialPrice(metrics);
    }

    




}
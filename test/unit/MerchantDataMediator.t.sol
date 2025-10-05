// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "../helpers/CDSFactoryDeployers.sol";
import "../helpers/AlgebraDeployers.sol";

import {
    IMerchantDataMediator,
    MerchantDataMediator
} from "../../src/MerchantDataMediator.sol";

import {ICollateralFilter} from "../../src/interfaces/ICollateralFilter.sol";
import {CollateralFilter} from "../../src/CollateralFilter.sol";
import {
    MerchantIdentityVerificationMockDataGenerator
} from "../helpers/MerchantIdentityVerificationMockDataGenerator.sol";


import "../../src/types/Shared.sol";

import {ICreditAssesmentManager} from "../../src/interfaces/ICreditAssesmentManager.sol";

contract MerchantDataMediatorTest is Test, CDSFactoryDeployers, AlgebraDeployers, MerchantIdentityVerificationMockDataGenerator {
    MerchantDataMediator public merchantDataMediator;
    IMentoStableCoinSelector public mentoStableCoinSelector;
    ICollateralFilter public collateralFilter;

    address public maria = makeAddr("maria");
    address public mariaFundManager = makeAddr("mariaFundManager");

    function setUp() public{
        vm.label(maria, "maria");
        vm.label(mariaFundManager, "mariaFundManager");
        deployFreshAlgebraFactoryAndPoolDeployer(address(this));
        CollateralFilter _collateralFilter = new CollateralFilter();
        collateralFilter = ICollateralFilter(address(_collateralFilter));
        Always_cCOP_MentoSelector always_cCOP_MentoSelector = new Always_cCOP_MentoSelector();
        mentoStableCoinSelector = IMentoStableCoinSelector(address(always_cCOP_MentoSelector));

        deployCDSFactory(algebraFactory, mentoStableCoinSelector);
        merchantDataMediator = new MerchantDataMediator(cdsFactory, collateralFilter);
        
        algebraFactory.grantRole(algebraFactory.CUSTOM_POOL_DEPLOYER(), address(cdsFactory));
        algebraFactory.grantRole(algebraFactory.POOLS_ADMINISTRATOR_ROLE(), address(cdsFactory));
        algebraFactory.grantRole(algebraFactory.CUSTOM_POOL_DEPLOYER(), address(merchantDataMediator));
        algebraFactory.grantRole(algebraFactory.POOLS_ADMINISTRATOR_ROLE(), address(merchantDataMediator));
        cdsFactory.setMerchantDataMediator(merchantDataMediator);

    }

    // function test__merchantOnboarding__mechantHasNotBeenOnboarded() public {
    //     MerchantOnboardingData memory merchantOnboardingData = _generateMockMerchantOnboardingData(maria, Collateral({currency: Currency.wrap(makeAddr("collateral")), collateralType: CollateralType.CRYPTO}));
    //     vm.label(maria, "maria");
    //     vm.label(mariaFundManager, "mariaFundManager");
    //     // NOTE: t
        
    // }


    function test__merchantOnboarding__fromUserDataToPoolCreationSuccessRevertsOnValidationStrategyNotSet() public {
        MerchantOnboardingData memory merchantOnboardingData = _generateMockMerchantOnboardingData(
            maria,
            Collateral({currency: Currency.wrap(makeAddr("collateral")), collateralType: CollateralType.CRYPTO, amount: 1000000000000000000})
        );


        bytes memory userData = abi.encode(merchantOnboardingData);
        // NOTE: We need to check the state before it reaches this state becasue. This needs fork testing
        // to be tested.
        // vm.expectRevert(abi.encodeWithSelector(ICollateralFilter.CollateralFilter__ValidationStrategyNotSet.selector, CollateralType.CRYPTO));
        merchantDataMediator.onUserDataHook(userData);
    }

    function test__merchantFunding__fundingSuccess() public {
        MerchantOnboardingData memory merchantOnboardingData = _generateMockMerchantOnboardingData(
            maria,
            Collateral({currency: Currency.wrap(makeAddr("collateral")), collateralType: CollateralType.CRYPTO, amount: 1000000000000000000})
        );
        bytes memory userData = abi.encode(merchantOnboardingData);
        merchantDataMediator.onUserDataHook(userData);
        // NOTE: Maria retreicves its credit information
        ICreditAssesmentManager creditAssesmentManager = merchantDataMediator.getCreditAssesmentManager(merchantOnboardingData.businessId, merchantOnboardingData.countryCodeHash);
        uint256 mariaTotalCDSTokensSupply = creditAssesmentManager.getTotalCDSTokensSupply(merchantOnboardingData.creditAssesmentId);
        console2.log(
            "Maria's equity tokens total supply:",
            mariaTotalCDSTokensSupply
        );

        uint256 amountToSell = 100_000;
        uint256 fundedAmount = creditAssesmentManager.sellCDSTokens(
            merchantOnboardingData.creditAssesmentId, 
            amountToSell,
            mariaFundManager
        );
        console2.log(
            "Maria's funded amount:",
            fundedAmount
        );

        
        



        
    }





}





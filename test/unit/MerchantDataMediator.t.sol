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

contract MerchantDataMediatorTest is Test, CDSFactoryDeployers, AlgebraDeployers, MerchantIdentityVerificationMockDataGenerator {
    MerchantDataMediator public merchantDataMediator;
    IMentoStableCoinSelector public mentoStableCoinSelector;
    ICollateralFilter public collateralFilter;

    address public merchantWallet = makeAddr("merchant");
    address public protectionSeller = makeAddr("protection_seller");

    function setUp() public{
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

    function test__merchantOnboarding__mechantHasNotBeenOnboarded() public {
        MerchantOnboardingData memory merchantOnboardingData = _generateMockMerchantOnboardingData(merchantWallet, Collateral({currency: Currency.wrap(makeAddr("collateral")), collateralType: CollateralType.CRYPTO}));
        vm.label(merchantWallet, "merchant");
        vm.label(protectionSeller, "protection_seller");
        // NOTE: t
        
    }


    function test__merchantOnboarding__fromUserDataToPoolCreationSuccessRevertsOnValidationStrategyNotSet() public {
        MerchantOnboardingData memory merchantOnboardingData = _generateMockMerchantOnboardingData(merchantWallet, Collateral({currency: Currency.wrap(makeAddr("collateral")), collateralType: CollateralType.CRYPTO}));
        bytes memory userData = abi.encode(merchantOnboardingData);
        // NOTE: We need to check the state before it reaches this state becasue. This needs fork testing
        // to be tested.
        // vm.expectRevert(abi.encodeWithSelector(ICollateralFilter.CollateralFilter__ValidationStrategyNotSet.selector, CollateralType.CRYPTO));
        merchantDataMediator.onUserDataHook(userData);
    }





}





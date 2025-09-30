// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import {
    Test,
    console2
} from "forge-std/Test.sol";

import {
    ICollateralFilter,
    ICDSFactory,
    IMentoStableCoinSelector,
    IAlgebraFactory,
    IAlgebraPoolDeployer,
    IMerchantDataMediator

} from "../unit/MerchantDataMediator.t.sol";

import {
    ICDS
} from "../../src/interfaces/ICDS.sol";

import {
    AlgebraCoreInteractions
} from "../../script/interactions/AlgebraCoreInteractions.s.sol";

import {
    MerchantDataMediatorInteractions,
    MerchantDataMediator
} from "../../script/interactions/MerchantDataMediatorInteractions.s.sol";

import "../../src/types/Shared.sol";
import {
    IAccessControl
} from "@openzeppelin/contracts/access/IAccessControl.sol";

import {
    MerchantIdentityVerificationMockDataGenerator
} from "../helpers/MerchantIdentityVerificationMockDataGenerator.sol";

contract MerchantDataMediatorIntegrationTest is Test, MerchantIdentityVerificationMockDataGenerator{
    
    ICollateralFilter public collateralFilter;
    ICDSFactory public cdsFactory;
    IMentoStableCoinSelector public mentoStableCoinSelector;
    address public algebraFactory;
    IAccessControl public algebraFactoryAccessControl;
    AlgebraCoreInteractions public algebraCoreInteractions;
    MerchantDataMediatorInteractions public merchantDataMediatorInteractions;

    ICDS public cds;
    MerchantDataMediator public merchantDataMediator;

    address deployerAddress;
    address collateralAddress = address(0x01C5C0122039549AD1493B8220cABEdD739BC44E);


    function setUp() public {
        algebraCoreInteractions = new AlgebraCoreInteractions();
        merchantDataMediatorInteractions = new MerchantDataMediatorInteractions();
    
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        deployerAddress = vm.addr(deployerPrivateKey);
        vm.label(deployerAddress, "deployer");

        mentoStableCoinSelector = IMentoStableCoinSelector(address(0x124eff2236c00357B7C84442af0BCd7dC10f74F8));
        algebraFactory = address(0x1118879CCCe8A1237C91a5256ad1796Ad9085B91);
        cdsFactory = ICDSFactory(address(0xd8c4Aa030C1581a7a5CCD100C123668899f4A69d));
        collateralFilter = ICollateralFilter(address(0xeb68CF4BF61f968605418Cd83d011091b2C1cc1C));
        merchantDataMediator = MerchantDataMediator(address(0x71542aEe829993145Cdd8B98829081d2fc358355));

        algebraCoreInteractions.algebraFactoryApprovals(algebraFactory, cdsFactory, merchantDataMediator);
    }

    function test__merchantOnboardingData__fromUserDataToPoolCreationSuccess() public {
        MerchantOnboardingData memory merchantOnboardingData = _generateMockMerchantOnboardingData(deployerAddress, Collateral({currency: Currency.wrap(collateralAddress), collateralType: CollateralType.CURRENCY}));
        bytes memory userData = abi.encode(merchantOnboardingData);
        merchantDataMediatorInteractions.onUserDataHoolCall(merchantDataMediator, userData);
    }


    




}

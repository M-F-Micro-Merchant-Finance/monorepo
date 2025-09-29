// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import {
    Test,
    console2
} from "forge-std/Test.sol";

import {MerchantIdentityVerificationMockDataGenerator} from "../helpers/MerchantIdentityVerificationMockDataGenerator.sol";
import {MerchantIdentityVerification} from "../../src/MerchantIdentityVerification.sol";
import {CDSFactory} from "../../src/CDSFactory.sol";
import {Always_cCOP_MentoSelector} from "../../src/mocks/Always_cCOP_MentoSelector.sol";
import {CDS} from "../../src/CDS.sol";
import {MerchantDataMediator} from "../../src/MerchantDataMediator.sol";

import {CDSFactory} from "../../src/CDSFactory.sol";

import {IMentoStableCoinSelector} from "../../src/interfaces/IMentoStableCoinSelector.sol";
import {IAlgebraFactory} from "@cryptoalgebra/integral-core/contracts/interfaces/IAlgebraFactory.sol";
import {ICDSFactory} from "../../src/interfaces/ICDSFactory.sol";
import {IMerchantDataMediator} from "../../src/interfaces/IMerchantDataMediator.sol";
import {IMerchantIdentityVerification} from "../../src/interfaces/IMerchantIdentityVerification.sol";

import {ICDS} from "../../src/interfaces/ICDS.sol";
import {SelfUtils} from "../../src/libraries/self/SelfUtils.sol";

import {AlgebraDeployers} from "../helpers/AlgebraDeployers.sol";

import {AnySelfIdentityVerificationHub} from "../helpers/AnySelfIdentityVerificationHub.sol";

contract MerchantIdentityVerificationTest is Test, MerchantIdentityVerificationMockDataGenerator, AlgebraDeployers, AnySelfIdentityVerificationHub{

    

    IMentoStableCoinSelector public mentoStableCoinSelector;
    ICDSFactory public cdsFactory;
    IMerchantDataMediator public merchantDataMediator;
    IMerchantIdentityVerification public merchantIdentityVerification;
    address public hub;

    function setUp() public {
        deployFreshAlgebraFactoryAndPoolDeployer(address(this));
        Always_cCOP_MentoSelector always_cCOP_MentoSelector = new Always_cCOP_MentoSelector();
        mentoStableCoinSelector = IMentoStableCoinSelector(address(always_cCOP_MentoSelector));

        CDSFactory _cdsFactory = new CDSFactory(algebraFactory, mentoStableCoinSelector);
        cdsFactory = ICDSFactory(address(_cdsFactory));
        MerchantDataMediator _merchantDataMediator = new MerchantDataMediator(cdsFactory);
        merchantDataMediator = IMerchantDataMediator(address(_merchantDataMediator));
        hub = deployAnySelfIdentityVerificationHub();
 
        MerchantIdentityVerification _merchantIdentityVerification = new MerchantIdentityVerification(
            address(hub), merchantDataMediator, _generateMockScopeValue(), _generateMockUnformattedVerificationConfigV2()
        );
        merchantIdentityVerification = IMerchantIdentityVerification(address(_merchantIdentityVerification));

        // algebraFactory.grantRole(algebraFactory.CUSTOM_POOL_DEPLOYER(), address(cdsFactory));
        // algebraFactory.grantRole(algebraFactory.POOLS_ADMINISTRATOR_ROLE(), address(cdsFactory));
        // algebraFactory.grantRole(algebraFactory.CUSTOM_POOL_DEPLOYER(), address(merchantDataMediator));
        // algebraFactory.grantRole(algebraFactory.POOLS_ADMINISTRATOR_ROLE(), address(merchantDataMediator));
    }


}
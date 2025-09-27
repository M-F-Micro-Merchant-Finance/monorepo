// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;


import {
    Test,
    console2
} from "forge-std/Test.sol";

import {MerchantIdentityVerificationMockDataGenerator} from "../helpers/MerchantIdentityVerificationMockDataGenerator.sol";
import {MerchantIdentityVerification} from "../../src/MerchantIdentityVerification.sol";
import {CDS} from "../../src/CDS.sol";

import {DevOpsTools} from "@Cyfrin/foundry-devops/DevOpsTools.sol";

import {DeployMentoSelectors} from "../../script/deployments/DeployMentoSelectors.s.sol";
import {DeployAlgebraFactory} from "../../script/deployments/DeployAlgebraCore.s.sol";
import {DeployCDSFactory} from "../../script/deployments/DeployCDSFactory.s.sol";
import {DeployMerchantDataMediator} from "../../script/deployments/DeployMerchantDataMediator.s.sol";
import {DeployMerchantIdentityVerification} from "../../script/deployments/DeployMerchantIdentityVerification.s.sol";

import {IMentoStableCoinSelector} from "../../src/interfaces/IMentoStableCoinSelector.sol";
import {IAlgebraFactory} from "@cryptoalgebra/integral-core/contracts/interfaces/IAlgebraFactory.sol";
import {IAlgebraPoolDeployer} from "@cryptoalgebra/integral-core/contracts/interfaces/IAlgebraPoolDeployer.sol";
import {ICDSFactory} from "../../src/interfaces/ICDSFactory.sol";
import {IMerchantDataMediator} from "../../src/interfaces/IMerchantDataMediator.sol";
import {IMerchantIdentityVerification} from "../../src/interfaces/IMerchantIdentityVerification.sol";
import {ICDS} from "../../src/interfaces/ICDS.sol";
import {SelfUtils} from "../../src/libraries/self/SelfUtils.sol";


contract MerchantIdentityVerificationForkTest is Test, MerchantIdentityVerificationMockDataGenerator{

    
    address public HUB_ADDRESS = 0xe57F4773bd9c9d8b6Cd70431117d353298B9f5BF; // Celo mainnet
    
    IAlgebraFactory public algebraFactory;
    IMentoStableCoinSelector public mentoStableCoinSelector;
    ICDSFactory public cdsFactory;
    IMerchantDataMediator public merchantDataMediator;
    IMerchantIdentityVerification public merchantIdentityVerification;
    IAlgebraPoolDeployer public algebraPoolDeployer;


    
    function setUp() public {
        
        
        DeployMentoSelectors deployMentoSelectors = new DeployMentoSelectors();
        DeployAlgebraFactory deployAlgebraFactory = new DeployAlgebraFactory();
        DeployCDSFactory deployCDSFactory = new DeployCDSFactory();
        DeployMerchantDataMediator deployMerchantDataMediator = new DeployMerchantDataMediator();
        DeployMerchantIdentityVerification deployMerchantIdentityVerification = new DeployMerchantIdentityVerification();

        uint256 celoMainnetForkId = vm.createFork(vm.rpcUrl("celo"), 17420000);
        vm.selectFork(celoMainnetForkId);

        address always_cCOP_MentoSelector = DevOpsTools.get_most_recent_deployment(
            "Always_cCOP_MentoSelector",
             42220
        );
        
        if (always_cCOP_MentoSelector == address(0x00)) {
            mentoStableCoinSelector = deployMentoSelectors.run();
        }

        address algebraFactoryAddress = DevOpsTools.get_most_recent_deployment("AlgebraFactory", 42220);
        
        if (algebraFactoryAddress == address(0x00)) {
            (algebraFactory, algebraPoolDeployer) = deployAlgebraFactory.run();
        }
        address cdsFactoryAddress = DevOpsTools.get_most_recent_deployment("CDSFactory", 42220);

        if (cdsFactoryAddress == address(0x00)) {
            cdsFactory = deployCDSFactory.run(algebraFactory, mentoStableCoinSelector);
        }

        address merchantDataMediatorAddress = DevOpsTools.get_most_recent_deployment("MerchantDataMediator", 42220);

        if (merchantDataMediatorAddress == address(0x00)) {
            merchantDataMediator = deployMerchantDataMediator.run(cdsFactory);
        }

        address merchantIdentityVerificationAddress = DevOpsTools.get_most_recent_deployment("MerchantIdentityVerification", 42220);

        if (merchantIdentityVerificationAddress == address(0x00)) {
            merchantIdentityVerification = deployMerchantIdentityVerification.run(
                HUB_ADDRESS, merchantDataMediator, _generateMockScopeValue(), _generateMockUnformattedVerificationConfigV2()
            );
    
        }
        merchantIdentityVerification = IMerchantIdentityVerification(merchantIdentityVerificationAddress);

    }
}
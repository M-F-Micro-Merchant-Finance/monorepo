// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;


import {
    Test,
    console2
} from "forge-std/Test.sol";

import {MerchantIdentityVerificationMockDataGenerator} from "../helpers/MerchantIdentityVerificationMockDataGenerator.sol";
import {MerchantIdentityVerification} from "../../src/MerchantIdentityVerification.sol";
import {CDS} from "../../src/CDS.sol";


import {IMentoStableCoinSelector} from "../../src/interfaces/IMentoStableCoinSelector.sol";
import {IAlgebraFactory} from "@cryptoalgebra/integral-core/contracts/interfaces/IAlgebraFactory.sol";
import {IAlgebraPoolDeployer} from "@cryptoalgebra/integral-core/contracts/interfaces/IAlgebraPoolDeployer.sol";

import {ICDSFactory} from "../../src/interfaces/ICDSFactory.sol";
import {IMerchantDataMediator} from "../../src/interfaces/IMerchantDataMediator.sol";
import {IMerchantIdentityVerification} from "../../src/interfaces/IMerchantIdentityVerification.sol";
import {ICDS} from "../../src/interfaces/ICDS.sol";
import {ICollateralFilter} from "../../src/interfaces/ICollateralFilter.sol";
import {ICurrencyCollateralValidator} from "../../src/interfaces/ICurrencyCollateralValidator.sol";
import {SelfUtils} from "../../src/libraries/self/SelfUtils.sol";


contract MerchantIdentityVerificationForkTest is Test, MerchantIdentityVerificationMockDataGenerator{

    
    address public HUB_ADDRESS = 0xe57F4773bd9c9d8b6Cd70431117d353298B9f5BF; // Celo mainnet
    
    IAlgebraFactory public algebraFactory;
    IMentoStableCoinSelector public mentoStableCoinSelector;
    ICDSFactory public cdsFactory;
    IMerchantDataMediator public merchantDataMediator;
    IMerchantIdentityVerification public merchantIdentityVerification;
    IAlgebraPoolDeployer public algebraPoolDeployer;
    ICollateralFilter public collateralFilter;
    ICurrencyCollateralValidator public currencyCollateralValidator;

    
    function setUp() public {
        
        
        uint256 celoMainnetForkId = vm.createFork(vm.rpcUrl("celo"), 17420000);
        vm.selectFork(celoMainnetForkId);

 
    }
}
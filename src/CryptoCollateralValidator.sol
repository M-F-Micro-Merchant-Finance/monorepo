// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import {ICryptoCollateralValidator} from "./interfaces/ICryptoCollateralValidator.sol";
import {ICollateralConfigurationModule} from "@synthetixio/synthetix/contracts/interfaces/ICollateralConfigurationModule.sol";
import {Collateral, CollateralType} from "./types/Shared.sol";
import {CollateralConfiguration} from "@synthetixio/synthetix/contracts/storage/CollateralConfiguration.sol";
import {Currency} from "@uniswap/v4-core/src/types/Currency.sol";

contract CryptoCollateralValidator is ICryptoCollateralValidator {
    ICollateralConfigurationModule public collateralConfigurationModule;

    constructor(ICollateralConfigurationModule _collateralConfigurationModule) {
        collateralConfigurationModule = _collateralConfigurationModule;
    }

    function validate(Collateral memory collateral) external view override returns (bool) {
        if (collateral.collateralType != CollateralType.CRYPTO) {
            revert CryptoCollateralValidator__InvalidCollateralType(collateral.collateralType);
        }

        CollateralConfiguration.Data memory collateralConfiguration = collateralConfigurationModule.getCollateralConfiguration(Currency.unwrap(collateral.currency));
        bool isValid = collateralConfiguration.depositingEnabled && collateralConfiguration.tokenAddress == Currency.unwrap(collateral.currency);
        return isValid;
    }
}
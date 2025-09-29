// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import {ICurrencyCollateralValidator} from "./interfaces/ICurrencyCollateralValidator.sol";
import {IReserve} from "@mento/core/contracts/interfaces/IReserve.sol";
import {Collateral, CollateralType} from "./types/Shared.sol";
import {Currency} from "@uniswap/v4-core/src/types/Currency.sol";

contract CurrencyCollateralValidator is ICurrencyCollateralValidator {
    IReserve public mentoReserve;

    constructor(IReserve _mentoReserve) {
        mentoReserve = _mentoReserve;
    }

// TODO: Further checks on the collaterl asset are needed
    function validate(Collateral memory collateral) external view override returns (bool) {
        

        if (collateral.collateralType != CollateralType.CURRENCY) {
            revert CurrencyCollateralValidator__InvalidCollateralType(collateral.collateralType);
        }
        Currency expectedCurrency = collateral.currency;
        bool isValid = mentoReserve.isCollateralAsset(Currency.unwrap(expectedCurrency));
        

        return isValid;
    }



    
}
// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import {ICollateralFilter} from "./interfaces/ICollateralFilter.sol";
import {IValidationStrategy} from "./interfaces/IValidationStrategy.sol";
import {Collateral, CollateralType} from "./types/Shared.sol";
import {Currency} from "@uniswap/v4-core/src/types/Currency.sol";

contract CollateralFilter is ICollateralFilter {


    mapping(CollateralType collateralType => IValidationStrategy validationStrategy) private _validationStrategies;
    mapping(address => bool) private _whitelistedCollaterals;
    address public governance;
    
    constructor() {
        governance = msg.sender;
    }
    //TODO: There are better ways to do this
    modifier onlyGovernance {
        require(msg.sender == governance, "Only governance can call this function");
        _;
    }

    // TODO: This is to be protected
    function setValidationStrategy(CollateralType collateralType, IValidationStrategy strategy) external onlyGovernance {
        _validationStrategies[collateralType] = strategy;
        emit ValidationStrategyUpdated(collateralType, address(strategy));
    }

    // TODO: This is to be protected
    function removeValidationStrategy(CollateralType collateralType) external onlyGovernance {
        delete _validationStrategies[collateralType];
        emit ValidationStrategyRemoved(collateralType);
    }

    function addToWhitelist(Collateral memory collateral) external onlyGovernance {
        if (address(_validationStrategies[collateral.collateralType]) == address(0x00)) {
            revert CollateralFilter__ValidationStrategyNotSet(collateral.collateralType);
        }
        bool isValid = _validationStrategies[collateral.collateralType].validate(collateral);
        if (isValid) {
            _whitelistedCollaterals[Currency.unwrap(collateral.currency)] = true;
            emit CollateralWhitelisted(Currency.unwrap(collateral.currency), collateral.collateralType);
        }
    }

    function removeFromWhitelist(Collateral memory collateral) external onlyGovernance {
        delete _whitelistedCollaterals[Currency.unwrap(collateral.currency)];
        emit CollateralRemoved(Currency.unwrap(collateral.currency), collateral.collateralType);
    }

    function getWhitelistStatus(Collateral memory collateral) external view returns (WhitelistStatus) {
        if (_whitelistedCollaterals[Currency.unwrap(collateral.currency)]) {
            return WhitelistStatus.WHITELISTED;
        }
        return WhitelistStatus.NOT_WHITELISTED;
    }

    function getValidationStrategy(CollateralType collateralType) external view returns (address) {
        return address(_validationStrategies[collateralType]);
    }

    function isWhitelisted(Collateral memory collateral) external view returns (bool) {
        return _whitelistedCollaterals[Currency.unwrap(collateral.currency)];
    }
    


    // TODO This can be bit-packed for optimization
    function getSupportedCollateralTypes() external view returns (CollateralType[] memory) {
        CollateralType[] memory supportedCollateralTypes = new CollateralType[](5);
        supportedCollateralTypes[0] = CollateralType.CURRENCY;
        supportedCollateralTypes[1] = CollateralType.CRYPTO;
        supportedCollateralTypes[2] = CollateralType.NFT;
        supportedCollateralTypes[3] = CollateralType.REAL_ESTATE;
        supportedCollateralTypes[4] = CollateralType.OTHER;
        return supportedCollateralTypes;
    }

}
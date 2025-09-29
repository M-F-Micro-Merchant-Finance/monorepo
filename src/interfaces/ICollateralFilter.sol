// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;


import {Collateral, CollateralType} from "../types/Shared.sol";

interface ICollateralFilter  {
    enum WhitelistStatus {
        NOT_WHITELISTED,
        WHITELISTED,
        BLACKLISTED
    }

    event ValidationStrategyUpdated(CollateralType indexed collateralType, address indexed strategy); 
    event CollateralWhitelisted(address indexed asset, CollateralType indexed collateralType);
    event CollateralRemoved(address indexed asset, CollateralType indexed collateralType);
    event ValidationStrategyRemoved(CollateralType indexed collateralType);

    error CollateralFilter__ValidationStrategyNotSet(CollateralType collateralType);

    function isWhitelisted(Collateral memory collateral) external view returns (bool);
    function getWhitelistStatus(Collateral memory collateral) external view returns (WhitelistStatus);
    function getValidationStrategy(CollateralType collateralType) external view returns (address);
    function addToWhitelist(Collateral memory collateral) external;
    function removeFromWhitelist(Collateral memory collateral) external;
    function getSupportedCollateralTypes() external view returns (CollateralType[] memory);
}


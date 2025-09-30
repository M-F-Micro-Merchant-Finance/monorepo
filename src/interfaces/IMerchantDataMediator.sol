// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;



import {IAlgebraCustomPluginFactory} from "@cryptoalgebra/default-plugin/contracts/interfaces/IAlgebraCustomPluginFactory.sol";
import {Metrics} from "../types/Metrics.sol";
import {Collateral} from "../types/Shared.sol";

interface IMerchantDataMediator is IAlgebraCustomPluginFactory {
    // TODO: Should this method have a return type ??
    function onUserDataHook(bytes memory userData) external;

    function getBusinessCountryById(bytes32 businessId) external view returns (bytes32);

    function getCreditAssesmentMetrics(bytes32 businessId, bytes32 countryHash, bytes32 creditAssesmentId) external view returns (Metrics memory metrics);
    function getCreditAssesmentCollateral(bytes32 businessId, bytes32 countryHash, bytes32 creditAssesmentId) external view returns (Collateral memory collateral);
    function getTotalCountries() external view returns (uint256);
}
// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import {ICreditAssesmentManager} from "./interfaces/ICreditAssesmentManager.sol";
import {Collateral} from "./types/Shared.sol";
import {Metrics} from "./types/Metrics.sol";

import {
    BaseAbstractPlugin,
    IAlgebraPlugin
} from "@cryptoalgebra/abstract-plugin/contracts/BaseAbstractPlugin.sol";


// TODO: This contract is owned by the MerchantDataMediator, but it is deployed on the pool
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract CreditAssesmentManager is ICreditAssesmentManager, BaseAbstractPlugin, Ownable {
    bytes32 public immutable businessId;
    bytes32 public immutable countryCodeHash;
    

    

    mapping(bytes32 creditAssesmentId => Collateral collateral) private creditAssesmentIdToCollateral;
    mapping(bytes32 creditAssesmentId => Metrics metrics) private creditAssesmentIdToMetrics;

    constructor(
        bytes32 _businessId,
        bytes32 _countryCodeHash,
        address _pool,
        address _factory,
        address _pluginFactory
    ) BaseAbstractPlugin(_pool, _factory, _pluginFactory) Ownable() {
        require(msg.sender == _pluginFactory);
        businessId = _businessId;
        countryCodeHash = _countryCodeHash;
    }
    

    function setCollateralInfo(bytes32 creditAssesmentId, Collateral memory collateral) external {
        creditAssesmentIdToCollateral[creditAssesmentId] = collateral;
    }

    function setMetrics(bytes32 creditAssesmentId, Metrics memory metrics) external {
        creditAssesmentIdToMetrics[creditAssesmentId] = metrics;
    }
 
    function getCollateralInfo(bytes32 creditAssesmentId) external view returns (Collateral memory collateral) {
        return creditAssesmentIdToCollateral[creditAssesmentId];
    }

    function getMetrics(bytes32 creditAssesmentId) external view returns (Metrics memory metrics) {
        return creditAssesmentIdToMetrics[creditAssesmentId];
    }

    // NOTE: The beforeInitialize function is only callable by the MerchantDataMediator on the merchand cds creation flow
    // and this function is in charge of setting the inital, price of the pool
    // This means that the 
    function beforeInitialize(address sender, uint160 sqrtPriceX96) external onlyOwner returns (bytes4){
        
        return IAlgebraPlugin.beforeInitialize.selector;
    }




}
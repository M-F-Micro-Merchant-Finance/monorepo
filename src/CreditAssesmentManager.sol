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

import {IAlgebraPoolActions} from "@cryptoalgebra/integral-core/contracts/interfaces/pool/IAlgebraPoolActions.sol";


import {IERC6909TokenSupply} from "@openzeppelin-v5/contracts/interfaces/draft-IERC6909.sol";
import {ICDSFactory} from "./interfaces/ICDSFactory.sol";
import {IMerchantDataMediator} from "./interfaces/IMerchantDataMediator.sol";

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
    ) BaseAbstractPlugin(_pool, _factory, _pluginFactory) {
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
    function beforeInitialize(address sender, uint160 sqrtPriceX96) external override returns (bytes4){
        return IAlgebraPlugin.beforeInitialize.selector;
    }

    function sellCDSTokens(
        bytes32 creditAssesmentId,
        uint256 amount,
        address receiver
    ) external returns (uint256 stableCoinAmount) {
         // NOTE: The receiver needs to be authorized by
        // the merchant
        // NOTE: The amount can not exceed the total supply
        // NOTE: From the credit assesment we get the pool
        (int256 amount0, int256 amount1) = IAlgebraPoolActions(pool).swap(
            receiver,
            true,
            int256(amount),
            0,
            bytes("")
        );
        return uint256(amount1);
    }

    function getTotalCDSTokensSupply(bytes32 creditAssesmentId) external view returns (uint256) {
        address cdsToken = address(IMerchantDataMediator(pluginFactory).getCDSFactory().getCDS(creditAssesmentId));
        return IERC6909TokenSupply(cdsToken).totalSupply(uint256(creditAssesmentId));
    }

    function buyBackCDSTokens(
        bytes32 creditAssesmentId,
        uint256 amount,
        address receiver
    ) external returns (uint256 cdsTokensAmount){
        return 0;
    }



}
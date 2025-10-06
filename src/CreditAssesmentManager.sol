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



import {Currency} from "@uniswap/v4-core/src/types/Currency.sol";
import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";

import {IAlgebraPoolImmutables} from "@cryptoalgebra/integral-core/contracts/interfaces/pool/IAlgebraPoolImmutables.sol";

contract CreditAssesmentManager is ICreditAssesmentManager, BaseAbstractPlugin, Ownable, AccessControl {
    bytes32 public immutable businessId;
    bytes32 public immutable countryCodeHash;
    bytes32 public constant CACHE_SLOT_0 = 0x733ee5a1ec3f9e1e58ede15dea787f774a9574c77659e4c598a9a691fca65264;
    bytes32 public constant CACHE_SLOT_1 = 0x5332120e1f82f4d4cc2bbaceb12297909a5d2fde302eac8c727df7cc0e82d345;
    bytes32 public constant FUND_MANAGER_ROLE = keccak256("FUND_MANAGER_ROLE");



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
    
    function getCache(CacheSlot slot) external view returns (bytes32) {
        bytes32 slot = slot == CacheSlot.CACHE_SLOT_0 ? CACHE_SLOT_0 : CACHE_SLOT_1;
        return slot;
    }

    function writeToCache(CacheSlot slot, bytes32 value) external onlyOwner {
        assembly ("memory-safe") {
            switch slot
            case 0 { // CacheSlot.CACHE_SLOT_0
                sstore(CACHE_SLOT_0, value)
            }
            case 1 { // CacheSlot.CACHE_SLOT_1
                sstore(CACHE_SLOT_1, value)
            }
            default {
                // revert("Invalid slot");
                mstore(0x00, 0x08c379a0) // Error selector for revert(string)
                mstore(0x20, 0x20) // Offset to string
                mstore(0x40, 13) // String length
                mstore(0x60, "Invalid slot")
                revert(0x00, 0x74)
            }
        }
    }

    function readFromCache(CacheSlot slot) external view returns (bytes32) {
        return _readFromCache(slot);
    }

    function _readFromCache(CacheSlot slot) private view returns (bytes32) {
        bytes32 value;

        assembly ("memory-safe") {
            switch slot
            case 0 {
                value := sload(CACHE_SLOT_0)
            }
            case 1 {
                value := sload(CACHE_SLOT_1)
            }
            default {
                // revert("Invalid slot");
                mstore(0x00, 0x08c379a0) // Error selector for revert(string)
                mstore(0x20, 0x20) // Offset to string
                mstore(0x40, 13) // String length
                mstore(0x60, "Invalid slot")
                revert(0x00, 0x74)
            }
        }

        return value;
    }

    function _clearCache() private {
        assembly ("memory-safe") {
            sstore(CACHE_SLOT_0, 0x00)
            sstore(CACHE_SLOT_1, 0x00)
        }
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

    function grantFundManagerRole(address fundManager) external onlyOwner {
        _grantRole(FUND_MANAGER_ROLE, fundManager);
    }

    // NOTE: The beforeInitialize function is only callable by the MerchantDataMediator on the merchand cds creation flow
    // and this function is in charge of setting the inital, price of the pool
    // This means that the 
    function beforeInitialize(address sender, uint160 sqrtPriceX96) external override returns (bytes4){
         
        return IAlgebraPlugin.beforeInitialize.selector;
    }

    function afterInitialize(address sender, uint160 sqrtPriceX96, int24 tick) external onlyRole(FUND_MANAGER_ROLE) override returns (bytes4){
        // NOTE: This asks for the collateral entered by the merchant and adds the collateral with 
        // a portion of the CDS tokens to the pool
        bytes32 creditAssesmentId = _readFromCache(CacheSlot.CACHE_SLOT_0);
        Collateral memory collateral = creditAssesmentIdToCollateral[creditAssesmentId];
        
        if (Currency.unwrap(collateral.currency) == IAlgebraPoolImmutables(pool).token1() || Currency.unwrap(collateral.currency) == IAlgebraPoolImmutables(pool).token0()) {
           // NOTE: Liquidity can be directly added without internal swap needed
           // NOTE: All the collateral is added as liquidity
           (int24 tickLower, int24 tickUpper) = _getTickRange(creditAssesmentId);
           uint128 initialLiquidity = _getInitialLiquidity(creditAssesmentId);
           address fundManager = address(
            uint160(
                uint256(
                    _readFromCache(CacheSlot.CACHE_SLOT_1)
                    )
                )
            );

           IAlgebraPoolActions(pool).mint(
                fundManager,
                fundManager,
                tickLower,
                tickUpper,
                initialLiquidity,
                bytes("")
           );
        }

        _clearCache();
        return IAlgebraPlugin.afterInitialize.selector;
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

    function _getTickRange(bytes32 creditAssesmentId) private view returns (int24 tickLower, int24 tickUpper) {

        // NOTE: The lower bound is the price of the CDS wighted by the maximum loss
        // wich is the inverse of the recovery rate time the default probability

        // The Upper bound is the price of teh CDS that makes that makes the buy of the
        // CDS tokens equal the price such that it reaches the requested funding amount


        return (tickLower, tickUpper);
    }


    function _getInitialLiquidity(bytes32 creditAssesmentId) private view returns (uint128) {
        // NOTE: The initial liquidity is the the full collateral and the amount of
        // CDS Tokens needed to reach the initial spot price
        return 0;
    }



}
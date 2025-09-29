// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;


import {IMentoStableCoinSelector} from "../interfaces/IMentoStableCoinSelector.sol";
import {Metrics} from "../types/Metrics.sol";


import {IERC20} from "forge-std/interfaces/IERC20.sol";
contract Always_cCOP_MentoSelector is IMentoStableCoinSelector {
 
   
    function selectOptimalStableCoin(
        uint256 tokenId,
        bytes32 businessId,
        bytes32 countryCodeHash,
        Metrics memory metrics
    ) external returns (IERC20) {
        return IERC20(address(0x8A567e2aE79CA692Bd748aB832081C45de4041eA));
    }
}
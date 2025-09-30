// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;


import {IMentoStableCoinSelector} from "../interfaces/IMentoStableCoinSelector.sol";
import {Metrics} from "../types/Metrics.sol";


import {IERC20} from "forge-std/interfaces/IERC20.sol";
contract Always_cUSD_MentoSelector is IMentoStableCoinSelector {
 
   
    function selectOptimalStableCoin(
        uint256 tokenId,
        bytes32 businessId,
        bytes32 countryCodeHash,
        Metrics memory metrics
    ) external returns (IERC20) {
        return IERC20(address(0x8A567e2aE79CA692Bd748aB832081C45de4041eA));
    }
}

contract Always_cUSD_MentoSelector_Alfajores is IMentoStableCoinSelector {
    function selectOptimalStableCoin(
        uint256 tokenId,
        bytes32 businessId,
        bytes32 countryCodeHash,
        Metrics memory metrics
    ) external returns (IERC20) {
        return IERC20(address(0xe6A57340f0df6E020c1c0a80bC6E13048601f0d4));
    }
}

contract Always_cUSD_MentoSelector_Sepolia is IMentoStableCoinSelector {
    function selectOptimalStableCoin(
        uint256 tokenId,
        bytes32 businessId,
        bytes32 countryCodeHash,
        Metrics memory metrics
    ) external returns (IERC20) {
        return IERC20(address(0xEF4d55D6dE8e8d73232827Cd1e9b2F2dBb45bC80));
    }
}


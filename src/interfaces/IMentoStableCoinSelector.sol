// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import {Metrics} from "../types/Metrics.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";


interface IMentoStableCoinSelector {
    event StableCoinSelected(
        uint256 indexed tokenId,
        address indexed stableCoin
    //TODO: More fields to be added later
    );


    function selectOptimalStableCoin(
        uint256 tokenId,
        bytes32 businessId,
        bytes32 countryCodeHash,
        Metrics memory metrics
    ) external returns (IERC20);

}
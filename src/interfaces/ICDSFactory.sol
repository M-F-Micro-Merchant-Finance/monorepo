// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;


import {Metrics} from "../types/Metrics.sol";
import {ICDS} from "./ICDS.sol";

interface ICDSFactory {
    function createCDS(bytes32 creditAssesmentId, Metrics memory metrics) external returns(ICDS);
}
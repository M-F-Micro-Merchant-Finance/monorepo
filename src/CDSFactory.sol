// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import {ICDSFactory} from "./interfaces/ICDSFactory.sol";
import {ICDS} from "./interfaces/ICDS.sol";
import {Metrics} from "./types/Metrics.sol";

contract CDSFactory is ICDSFactory {

    function createCDS(bytes32 creditAssesmentId, Metrics memory metrics) external returns(ICDS) {}


}
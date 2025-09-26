// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;


import "forge-std/interfaces/IERC6909.sol";

import {IERC7818} from "./IERC7818.sol";
import {IERC5114} from "./IERC5114.sol";
import {IERC5484} from "./IERC5484.sol";
import {Metrics} from "../types/Metrics.sol";
import {ICDSFactory} from "./ICDSFactory.sol";

interface ICDS is IERC6909Metadata,IERC6909ContentURI,IERC6909TokenSupply, IERC7818, IERC5114, IERC5484 {
    
    error NotCDSFactory();

    function cdsFactory() external view returns(ICDSFactory);
    // TODO: Once the factory asks for token creation it gives mints with the tokenId 
    // as the creditAssesmentId some amount determined by the other Metrics
    // of the token, to Whom ? This depends on the claim that the token represents

    // Then there is a method here that takes only the creditAssesmentId and the metrics and 
    // iternally one ov the methods is the _mint of ERC6909 with an amount derived by the metrics
    function issueCDSToken(address protectionSeller, address merchantWallet, bytes32 businessId, bytes32 countryCodeHash, bytes32 creditAssesmentId, Metrics memory metrics)
        external;
}
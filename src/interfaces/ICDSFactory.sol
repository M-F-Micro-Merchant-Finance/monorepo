// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;


import {Metrics} from "../types/Metrics.sol";
import {ICDS} from "./ICDS.sol";
import {IMerchantDataMediator} from "./IMerchantDataMediator.sol";

import {IAlgebraCustomPluginFactory} from "@cryptoalgebra/default-plugin/contracts/interfaces/IAlgebraCustomPluginFactory.sol";

import {IAlgebraCustomPoolEntryPoint} from "@cryptoalgebra/integral-periphery/contracts/interfaces/IAlgebraCustomPoolEntryPoint.sol";
interface ICDSFactory is IAlgebraCustomPoolEntryPoint {
    function merchantDataMediator() external view returns(IMerchantDataMediator);
    error CDSAlreadyDeployed(bytes32 creditAssesmentId);

    event CDSCreated(bytes32 indexed creditAssesmentId, address indexed cdsAddress);

    
    function createCDS(address protectionSeller, address merchantWallet, bytes32 businessId, bytes32 countryCodeHash, bytes32 creditAssesmentId, Metrics memory metrics) external returns(ICDS);
    
    function predictCDSAddress(bytes32 creditAssesmentId, address creator) external view returns(address);
    // NOTE: This function needs to be heavily protected on information retreival and on who can
    // interact with ICDS as the token is credit default swap
    function getCDS(bytes32 creditAssesmentId) external view returns(ICDS);
    
    function isCDSDeployed(bytes32 creditAssesmentId) external view returns(bool);
}
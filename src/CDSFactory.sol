// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import {ICDSFactory} from "./interfaces/ICDSFactory.sol";
import {ICDS} from "./interfaces/ICDS.sol";
import {Metrics} from "./types/Metrics.sol";
import {CDS} from "./CDS.sol";
import {Clones} from "@openzeppelin/contracts/proxy/Clones.sol";
import {IMerchantDataMediator} from "./interfaces/IMerchantDataMediator.sol";

import {AlgebraCustomPluginFactory} from "@cryptoalgebra/default-plugin/contracts/AlgebraCustomPluginFactory.sol";
import {AlgebraPoolDeployer} from "@cryptoalgebra/integral-core/contracts/AlgebraPoolDeployer.sol";

abstract contract CDSFactory is ICDSFactory, AlgebraCustomPluginFactory, AlgebraPoolDeployer {
    using Clones for address;


    IMerchantDataMediator public immutable merchantDataMediator;
    address public immutable CDS_IMPLEMENTATION;

    mapping(bytes32 creditAssesmentId => address cds) private _deployedCDS;
    mapping(address cds => bool isDeployed) private _isCDSDeployed;

    
    constructor(
        IMerchantDataMediator _merchantDataMediator
    ) {
        // CDS_IMPLEMENTATION = address(new CDS());
        //NOTE: PlaceHolder for compilation 
        CDS_IMPLEMENTATION = address(0x123);
        merchantDataMediator = _merchantDataMediator;
    }


    function createCDS(address protectionSeller, address merchantWallet, bytes32 businessId, bytes32 countryCodeHash, bytes32 creditAssesmentId, Metrics memory metrics) external returns(ICDS) {
        if (_isCDSDeployed[_deployedCDS[creditAssesmentId]]) {
            revert CDSAlreadyDeployed(creditAssesmentId);
        }
        // NOTE: The salt is the concatenation of the creditAssesmentId and the sender
        address cdsInstance = CDS_IMPLEMENTATION.cloneDeterministic(
            keccak256(abi.encodePacked(creditAssesmentId, msg.sender))
        );

        ICDS(cdsInstance).issueCDSToken(protectionSeller, merchantWallet, businessId, countryCodeHash, creditAssesmentId, metrics);
        _deployedCDS[creditAssesmentId] = cdsInstance;
        _isCDSDeployed[cdsInstance] = true;
        emit CDSCreated(creditAssesmentId, cdsInstance);
        return ICDS(cdsInstance);
    }

    function predictCDSAddress(bytes32 creditAssesmentId, address creator) external view returns(address) {
        return Clones.predictDeterministicAddress(
            CDS_IMPLEMENTATION,
            keccak256(abi.encodePacked(creditAssesmentId, creator))
        );
    }



    function getCDS(bytes32 creditAssesmentId) external view returns(ICDS) {
        return ICDS(_deployedCDS[creditAssesmentId]);
    }
    
    function isCDSDeployed(bytes32 creditAssesmentId) external view returns(bool) {
        return _isCDSDeployed[_deployedCDS[creditAssesmentId]];
    }
    

}
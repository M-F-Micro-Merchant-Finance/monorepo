// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import {ICDSFactory} from "./interfaces/ICDSFactory.sol";
import {ICDS} from "./interfaces/ICDS.sol";
import {Metrics} from "./types/Metrics.sol";
import {CDS} from "./CDS.sol";
import {Clones} from "@openzeppelin/contracts/proxy/Clones.sol";
import {IMerchantDataMediator} from "./interfaces/IMerchantDataMediator.sol";
import {IERC20} from "forge-std/interfaces/IERC20.sol";

import {AlgebraCustomPluginFactory} from "@cryptoalgebra/default-plugin/contracts/AlgebraCustomPluginFactory.sol";
import {AlgebraPoolDeployer} from "@cryptoalgebra/integral-core/contracts/AlgebraPoolDeployer.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

import {IMentoStableCoinSelector} from "./interfaces/IMentoStableCoinSelector.sol";
import {IAlgebraFactory} from "@cryptoalgebra/integral-core/contracts/interfaces/IAlgebraFactory.sol";
import {AlgebraCustomPoolEntryPoint} from "@cryptoalgebra/integral-periphery/contracts/AlgebraCustomPoolEntryPoint.sol";


contract CDSFactory is ICDSFactory, AlgebraCustomPoolEntryPoint {
    using Clones for address;


    IMerchantDataMediator public merchantDataMediator;
    IMentoStableCoinSelector public mentoStableCoinSelector;
    
    address public immutable CDS_IMPLEMENTATION;

    mapping(bytes32 creditAssesmentId => address cds) private _deployedCDS;
    mapping(address cds => bool isDeployed) private _isCDSDeployed;

    
    constructor(
        IAlgebraFactory _algebraFactory,
        IMentoStableCoinSelector _mentoStableCoinSelector
    ) AlgebraCustomPoolEntryPoint(address(_algebraFactory)) {
        // CDS_IMPLEMENTATION = address(new CDS());
        //NOTE: PlaceHolder for compilation 
        mentoStableCoinSelector = _mentoStableCoinSelector;
        CDS_IMPLEMENTATION = address(new CDS(
            ICDSFactory(address(this))
            )
        );

    }

    function setMerchantDataMediator(IMerchantDataMediator _merchantDataMediator) external {
        merchantDataMediator = _merchantDataMediator;
    }

    function getMerchantDataMediator() external view returns(IMerchantDataMediator) {
        return merchantDataMediator;
    }

    function createCDS(address protectionSeller, address merchantWallet, bytes32 businessId, bytes32 countryCodeHash, bytes32 creditAssesmentId, Metrics memory metrics) external returns(ICDS) {
        if (_isCDSDeployed[_deployedCDS[creditAssesmentId]]) {
            revert CDSAlreadyDeployed(creditAssesmentId);
        }
        // NOTE: The salt is the concatenation of the creditAssesmentId and the sender
        address cdsInstance = CDS_IMPLEMENTATION.cloneDeterministic(
            keccak256(abi.encodePacked(creditAssesmentId, msg.sender))
        );

        // Initialize the stable coin selector for the clone
        
        ICDS(cdsInstance).issueCDSToken(protectionSeller, merchantWallet, businessId, countryCodeHash, creditAssesmentId, metrics);
        IERC20 stableCoin = mentoStableCoinSelector.selectOptimalStableCoin(uint256(creditAssesmentId), businessId, countryCodeHash, metrics);
        address cdsPool = merchantDataMediator.createCustomPool(
            protectionSeller,
            address(cdsInstance),
            address(stableCoin),
            abi.encode(creditAssesmentId)
        );
       
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
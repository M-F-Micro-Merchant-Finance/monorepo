// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import {ICDS} from "./interfaces/ICDS.sol";
import {IMentoStableCoinSelector} from "./interfaces/IMentoStableCoinSelector.sol";
import {Metrics} from "./types/Metrics.sol";

import {
    Score,
    Rating
} from "./types/Shared.sol";

import {FinancialHealth, FinancialHealthLibrary} from "./types/FinancialHealth.sol";
import {MarketRisk, MarketRiskLibrary} from "./types/MarketRisk.sol";
import {BusinessFundamentals, BusinessFundamentalsLibrary} from "./types/BusinessFundamentals.sol";
import {CreditRisk, CreditRiskLibrary} from "./types/CreditRisk.sol";
import {ICDSFactory} from "./interfaces/ICDSFactory.sol";
import {IERC20} from "forge-std/interfaces/IERC20.sol";

import "@openzeppelin-v5/contracts/token/ERC6909/draft-ERC6909.sol";
import "@openzeppelin-v5/contracts/token/ERC6909/extensions/draft-ERC6909Metadata.sol";
import "@openzeppelin-v5/contracts/token/ERC6909/extensions/draft-ERC6909ContentURI.sol";
import "@openzeppelin-v5/contracts/token/ERC6909/extensions/draft-ERC6909TokenSupply.sol";

// CryptoAlgebra imports

// TODO: Add IERC7818, IERC5114, IERC5484

import {FullMath} from "@uniswap/v4-core/src/libraries/FullMath.sol";

contract CDS is ERC6909, ERC6909Metadata, ERC6909ContentURI, ERC6909TokenSupply {
    
    error NotCDSFactory();
    
    ICDSFactory internal immutable _cdsFactory;
    IMentoStableCoinSelector internal _mentoStableCoinSelector;

    constructor(IMentoStableCoinSelector __mentoStableCoinSelector, ICDSFactory __cdsFactory) {
        _cdsFactory = __cdsFactory;
        _mentoStableCoinSelector = __mentoStableCoinSelector;
    }

    modifier onlyCDSFactory() {
        if (_msgSender() != address(_cdsFactory)) {
            revert NotCDSFactory();
        }
        _;
    }
    
    function cdsFactory() external view returns(ICDSFactory) {
        return _cdsFactory;
    }


    function issueCDSToken(address protectionSeller, address merchantWallet, bytes32 businessId, bytes32 countryCodeHash, bytes32 creditAssesmentId, Metrics memory metrics)
        external
        onlyCDSFactory

    {
        uint256 tokenId = uint256(creditAssesmentId);
        uint256 _totalSupply = _calculateTotalSupply(metrics);
        {

        }
        // TODO: Before all this the token's need to actually be minted with the amount derived 
        // by the metrics
        
        {
         
         //==================================ERC-721 Metadata==================================
        // NOTE: For the name it is the concatenation of the businessId, countryCodeHash and creditAssesmentId
        
            string memory name = string(abi.encodePacked(businessId, countryCodeHash, creditAssesmentId));
            _setName(tokenId, name);
            _setSymbol(tokenId, "CDS");
            _setContractURI("https://api.cds.com/");
            _setTokenURI(tokenId, "https://api.cds.com/");

        }
        _mint(merchantWallet, tokenId, _totalSupply);

        {
            _setOperator(merchantWallet, protectionSeller, true);
        }

        IERC20 stableCoin = _mentoStableCoinSelector.selectOptimalStableCoin(tokenId, businessId, countryCodeHash, metrics);
        address cdsPool = _cdsFactory.createCustomPool(
            address(this),
            protectionSeller, // NOTE: Not fully determined yet, This is the pool creator
            address(this), // NOTE: This is the token, not sure if we have to provide a IERC20
            address(stableCoin),
            abi.encode(tokenId)
        );
    
    }

    function _update(address from, address to, uint256 id, uint256 amount) internal virtual override(ERC6909, ERC6909TokenSupply) {
        super._update(from, to, id, amount);
    }


    function _calculateTotalSupply(Metrics memory metrics) internal virtual returns (uint256) {
        uint256 baseSupply = _calculateBaseSupply(metrics);
        uint8 riskMultipliers   =uint8(_calculateCreditRiskMultiplier(metrics));
        uint8 marketAdjustments = uint8(_calculateMarketAdjustment(metrics));
        uint8 businessFactor = uint8(_calculateBusinessFactor(metrics));
        uint256 _totalSupply = FullMath.mulDiv(
            baseSupply, uint256(riskMultipliers*marketAdjustments*businessFactor), 1000000
        );
        return _totalSupply;
    }
 
    function _calculateBaseSupply(Metrics memory metrics) internal virtual returns (uint256) {
    // Unpack financial health scores
        FinancialHealth financialHealth = metrics.financialHealth;
        (Score liquidity, Score leverage, Score cashFlow, Score profitability) = 
            FinancialHealthLibrary.unpack(financialHealth);

        // Calculate weighted financial score (0-100)
        uint256 financialScore = FinancialHealthLibrary.calculateFinancialHealthScore(financialHealth);
        // NOTE: This has not been fundamentally supported ...
        // Base supply calculation: Higher financial health = Higher token supply
        // Range: 1,000 to 100,000 tokens based on financial health
        uint256 baseSupply = 1000 + (financialScore * 990); // 1,000 to 100,000

        return baseSupply;
    }
    
    function _calculateCreditRiskMultiplier(Metrics memory metrics) internal virtual returns (uint256) {
        CreditRisk creditRisk = metrics.creditRisk;
        // Unpack credit risk scores
        (Score credit, Score defaultProb, Score lossGivenDefault, Score recoveryRate) = 
            CreditRiskLibrary.unpack(creditRisk);
        
        // Calculate weighted credit risk score
        uint256 creditScore = CreditRiskLibrary.calculateWeightedRisk(creditRisk, [uint256(40), uint256(30), uint256(20), uint256(10)]);
        
        // Risk multiplier: Lower risk = Higher multiplier
        // Range: 0.5x to 2.0x based on credit quality
        uint256 riskMultiplier = 5000 + ((100 - creditScore) * 150); // 0.5x to 2.0x (in basis points)
        
        return riskMultiplier;
    }

    function _calculateRiskMultiplier(Metrics memory metrics) internal virtual returns (uint256) {
        CreditRisk creditRisk = metrics.creditRisk;
        // Unpack credit risk scores
        (Score credit, Score defaultProb, Score lossGivenDefault, Score recoveryRate) = 
            CreditRiskLibrary.unpack(creditRisk);
        
        // Calculate weighted credit risk score
        uint256 creditScore = CreditRiskLibrary.calculateWeightedRisk(creditRisk, [uint256(40), uint256(30), uint256(20), uint256(10)]);
        
        // Risk multiplier: Lower risk = Higher multiplier
        // Range: 0.5x to 2.0x based on credit quality
        uint256 riskMultiplier = 5000 + ((100 - creditScore) * 150); // 0.5x to 2.0x (in basis points)
        
        return riskMultiplier;
    }
    
    
    function _calculateMarketAdjustment(Metrics memory metrics) internal virtual returns (uint256) {
        MarketRisk marketRisk = metrics.marketRisk;
        // Calculate market stability index
        uint256 stabilityIndex = MarketRiskLibrary.calculateMarketStabilityIndex(marketRisk);
        
        // Market adjustment: Higher stability = Higher adjustment
        // Range: 0.8x to 1.2x based on market conditions
        uint256 marketAdjustment = 8000 + (stabilityIndex * 40); // 0.8x to 1.2x (in basis points)
        
        return marketAdjustment;
    }

    function _calculateBusinessFactor(Metrics memory metrics) internal virtual returns (uint256) {
        BusinessFundamentals businessFundamentals = metrics.businessFundamentals;
        // Calculate business health score
        uint256 businessHealth = BusinessFundamentalsLibrary.calculateBusinessHealthScore(businessFundamentals);
    
        // Business factor: Higher health = Higher factor
        // Range: 0.9x to 1.1x based on business fundamentals
        uint256 businessFactor = 9000 + (businessHealth * 20); // 0.9x to 1.1x (in basis points)
    
        return businessFactor;
    }

    
}




    


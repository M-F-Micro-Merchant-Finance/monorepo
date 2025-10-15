// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title SimpleSelfTest
 * @dev A simple contract to test @selfxyz/ package integration
 */
contract SimpleSelfTest is Ownable {
    mapping(address => bool) public verifiedMerchants;
    
    event MerchantVerified(address indexed merchant, bool verified);
    
    constructor() Ownable(msg.sender) {}
    
    /**
     * @dev Set verification status for a merchant
     * @param merchant The merchant address to verify
     * @param verified The verification status
     */
    function setMerchantVerification(address merchant, bool verified) external onlyOwner {
        verifiedMerchants[merchant] = verified;
        emit MerchantVerified(merchant, verified);
    }
    
    /**
     * @dev Check if a merchant is verified
     * @param merchant The merchant address to check
     * @return True if the merchant is verified
     */
    function isMerchantVerified(address merchant) external view returns (bool) {
        return verifiedMerchants[merchant];
    }
}

// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;


interface IERC5484 {
    enum BurnAuth {
        IssuerOnly, // Just the Token Creator can Burn it.
        OwnerOnly, // Just the owner can burd it.
        Both, // both the owner and the issuer can burn it.
        Neither // once minted is linked to your soul forever.
    }
    event Issued (
        address indexed from,
        address indexed to,
        uint256 indexed tokenId,
        BurnAuth burnAuth
    );

    function burnAuth(uint256 tokenId) external view returns (BurnAuth);
}

// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

interface IERC5114 {
	
	event Mint(uint256 indexed badgeId, address indexed nftAddress, uint256 indexed nftTokenId);

	
	function ownerOf(uint256 badgeId) external view returns (address nftAddress, uint256 nftTokenId);
	function collectionUri() external pure returns (string memory collectionUri);
	function badgeUri(uint256 badgeId) external view returns (string memory badgeUri);
	function metadataFormat() external pure returns (string memory format);
}
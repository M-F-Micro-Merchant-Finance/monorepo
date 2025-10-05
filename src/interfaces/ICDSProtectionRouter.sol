// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;


interface ICDSProtectionRouter{

    function sellCDSTokens(
        bytes32 creditAssesmentId,
        uint256 amount,
        address receiver
    ) external returns(uint256 stableCoinAmount);

    // function buyBackCDSTokens(
    //     bytes32 creditAssesmentId,
    //     uint256 amount,
    //     address receiver
    // ) external;

    // function getCDSTokenBalance(
    //     bytes32 creditAssesmentId
    // ) external view returns (uint256);

    // function getCDSTokenPrice(
    //     bytes32 creditAssesmentId
    // ) external view returns (uint160);

    // function getCDSTokenLiquidity(
    //     bytes32 creditAssesmentId
    // ) external view returns (uint128);

    // function


}
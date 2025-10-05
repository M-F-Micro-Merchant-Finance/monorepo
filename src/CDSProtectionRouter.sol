// // SPDX-License-Identifier: UNLICENSED
// pragma solidity ^0.8.0;


// import {ICreditAssesmentManager} from "./interfaces/ICreditAssesmentManager.sol";
// import {ICDSProtectionRouter} from "./interfaces/ICDSProtectionRouter.sol";
// contract CDSProtectionRouter is ICDSProtectionRouter{

//     ICreditAssesmentManager private _creditAssesmentManager;

//     constructor(
//         ICreditAssesmentManager __creditAssesmentManager
//     )
//     {
//         _creditAssesmentManager = __creditAssesmentManager;
//     }


//     function sellCDSTokens(
//         bytes32 creditAssesmentId,
//         uint256 amount,
//         address receiver
//     ) external returns(uint256 stableCoinAmount){
//         // NOTE: The receiver needs to be authorized by
//         // the merchant
//         // NOTE: The amount can not exceed the total supply
//         // NOTE: From the credit assesment we get the pool

//         (int256 amount0, int256 amount1) = IAlgebraPoolActions(_creditAssesmentManager.getPool(creditAssesmentId)).swap(
//             receiver,
//             true,
//             int256(amount),
//             0,
//             bytes("")
//         );

//         return uint256(amount1);

// // function swap(
// //     address recipient,
// //     bool zeroToOne,
// //     int256 amountRequired,
// //     uint160 limitSqrtPrice,
// //     bytes calldata data
// // ) external returns (int256 amount0, int256 amount1);


//     }





// }


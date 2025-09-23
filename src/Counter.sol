// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;


import "@self/constants/CircuitConstantsV2.sol";

// B->>B: Verify proof with SelfBackendVerifier
// B->>C: Call verifyMerchantIdentity
// C->>C: Verify proof on-chain
// C->>B: Return verification result
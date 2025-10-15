// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "forge-std/Test.sol";
import "../contracts/SimpleSelfTest.sol";

contract SimpleSelfTestTest is Test {
    SimpleSelfTest public simpleSelfTest;
    address public owner;
    address public merchant;

    function setUp() public {
        owner = makeAddr("owner");
        merchant = makeAddr("merchant");
        
        vm.prank(owner);
        simpleSelfTest = new SimpleSelfTest();
    }

    function testDeploy() public {
        assertTrue(address(simpleSelfTest) != address(0));
    }

    function testSetMerchantVerification() public {
        vm.prank(owner);
        simpleSelfTest.setMerchantVerification(merchant, true);
        
        assertTrue(simpleSelfTest.isMerchantVerified(merchant));
    }

    function testOnlyOwnerCanSetVerification() public {
        vm.prank(merchant);
        vm.expectRevert(abi.encodeWithSelector(Ownable.OwnableUnauthorizedAccount.selector, merchant));
        simpleSelfTest.setMerchantVerification(merchant, true);
    }

    function testMerchantVerifiedEvent() public {
        vm.prank(owner);
        vm.expectEmit(true, true, true, true);
        emit SimpleSelfTest.MerchantVerified(merchant, true);
        simpleSelfTest.setMerchantVerification(merchant, true);
    }
}

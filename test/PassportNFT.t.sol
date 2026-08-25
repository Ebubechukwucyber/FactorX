// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../src/PassportNFT.sol";

contract PassportNFTTest is Test {
    PassportNFT passport;
    address alice = address(0xA11CE);
    address bob   = address(0xB0B);

    function setUp() public {
        passport = new PassportNFT();
        passport.setMinter(address(this)); // test contract is minter
    }

    function test_MintPassport() public {
        uint256 id = passport.mint(alice);
        assertEq(id, 1);
        assertEq(passport.ownerOf(1), alice);
        assertEq(passport.balanceOf(alice), 1);
        assertTrue(passport.hasPassport(alice));
        assertEq(passport.tokenOf(alice), 1);
    }

    function test_CannotMintTwice() public {
        passport.mint(alice);
        vm.expectRevert(PassportNFT.AlreadyHasPassport.selector);
        passport.mint(alice);
    }

    function test_SoulboundBlocksTransfer() public {
        passport.mint(alice);
        vm.expectRevert(PassportNFT.Soulbound.selector);
        passport.transferFrom(alice, bob, 1);
    }

    function test_OnlyMinterCanMint() public {
        vm.prank(bob);
        vm.expectRevert(PassportNFT.Unauthorized.selector);
        passport.mint(alice);
    }
}

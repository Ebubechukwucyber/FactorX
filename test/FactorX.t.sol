// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../src/ReceivableRegistry.sol";
import "../src/AttestcoinVerifier.sol";
import "../src/CommercialScore.sol";
import "../src/FactorCredit.sol";
import "../src/MockConsumer.sol";

contract FactorXTest is Test {
    ReceivableRegistry registry;
    AttestcoinVerifier verifier;
    CommercialScore score;
    FactorCredit credit;
    MockConsumer consumer;

    address alice = address(0xA11CE);
    address bob = address(0xB0B);

    function setUp() public {
        registry = new ReceivableRegistry();
        verifier = new AttestcoinVerifier(address(registry));
        registry.setVerifier(address(verifier));

        score = new CommercialScore(address(registry));
        credit = new FactorCredit(address(score), address(registry));
        consumer = new MockConsumer(address(score));
    }

    function test_InitialScore() public {
        assertEq(score.getCommercialScore(alice), 300);
    }

    function test_RecordPaymentAndScoreIncrease() public {
        // Simulate verifier recording a payment
        vm.prank(address(verifier));
        registry.recordVerifiedPayment(
            alice,
            bob,
            2_000e18,
            bytes32(uint256(1)),
            0
        );

        uint256 newScore = score.getCommercialScore(alice);
        assertGt(newScore, 300);
    }

    function test_AdvanceRequiresScore() public {
        vm.prank(alice);
        vm.expectRevert(FactorCredit.ScoreTooLow.selector);
        credit.requestAdvance(100e18);
    }
}

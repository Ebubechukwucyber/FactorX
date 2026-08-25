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
    address bob   = address(0xB0B);
    address carol = address(0xCA301);

    function setUp() public {
        registry = new ReceivableRegistry();
        verifier = new AttestcoinVerifier(address(registry));
        registry.setVerifier(address(verifier));

        score    = new CommercialScore(address(registry));
        credit   = new FactorCredit(address(score), address(registry));
        consumer = new MockConsumer(address(score));
    }

    function test_InitialScore() public view {
        assertEq(score.getCommercialScore(alice), 300);
    }

    function test_RecordPaymentAndScoreIncrease() public {
        bytes memory dummyProof = hex"00";
        verifier.verifyAndRecord(
            dummyProof,
            bytes32(uint256(1)),
            0,
            alice,
            bob,
            2_000 ether
        );

        uint256 newScore = score.getCommercialScore(alice);
        assertGt(newScore, 300);
        assertEq(registry.getReceivableCount(alice), 1);
        assertEq(registry.totalVolume(alice), 2_000 ether);
    }

    function test_MultiplePaymentsIncreaseScoreFurther() public {
        bytes memory dummyProof = hex"00";

        // Use small amounts so we don't hit MAX_SCORE immediately
        verifier.verifyAndRecord(dummyProof, bytes32(uint256(1)), 0, alice, bob, 100 ether);
        uint256 scoreAfterOne = score.getCommercialScore(alice);

        verifier.verifyAndRecord(dummyProof, bytes32(uint256(2)), 1, alice, carol, 100 ether);
        uint256 scoreAfterTwo = score.getCommercialScore(alice);

        assertGt(scoreAfterTwo, scoreAfterOne);
        assertEq(registry.uniquePayerCount(alice), 2);
    }

    function test_AdvanceRequiresScore() public {
        vm.prank(alice);
        vm.expectRevert(FactorCredit.ScoreTooLow.selector);
        credit.requestAdvance(100 ether);
    }

    function test_AdvanceAfterPayments() public {
        bytes memory dummyProof = hex"00";
        verifier.verifyAndRecord(dummyProof, bytes32(uint256(1)), 0, alice, bob, 10_000 ether);

        uint256 sc = score.getCommercialScore(alice);
        assertGe(sc, 400);

        vm.prank(alice);
        credit.requestAdvance(1_000 ether);

        assertEq(credit.outstanding(alice), 1_000 ether);
        assertGt(credit.getAvailableCredit(alice), 0);
    }

    function test_MockConsumerOffersTerms() public {
        bytes memory dummyProof = hex"00";
        verifier.verifyAndRecord(dummyProof, bytes32(uint256(1)), 0, alice, bob, 5_000 ether);

        string memory terms = consumer.checkAndOfferTerms(alice);
        assertTrue(bytes(terms).length > 0);
    }

    function test_ReplayProtection() public {
        bytes memory dummyProof = hex"00";
        bytes32 txHash = bytes32(uint256(99));

        verifier.verifyAndRecord(dummyProof, txHash, 0, alice, bob, 1_000 ether);

        vm.expectRevert(AttestcoinVerifier.ProofAlreadyUsed.selector);
        verifier.verifyAndRecord(dummyProof, txHash, 0, alice, bob, 1_000 ether);
    }
}

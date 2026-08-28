// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title IBlockProver
 * @notice Attestcoin BlockProver precompile on Creditcoin.
 *         Address (testnet + mainnet): 0x0000000000000000000000000000000000000FD2
 *
 * Official behaviour (docs.creditcoin.org):
 * - verify()        view, no event
 * - verifyAndEmit() state-changing, emits TransactionVerified
 * - Proves tx inclusion + continuity to an attestation
 * - Does NOT prove the source tx succeeded — caller MUST check status
 *
 * Encoding note:
 * Official SDK (gluwa usc-sdk) passes structured merkle + continuity proofs.
 * We accept ABI-encoded bytes from the Proof Builder so the precompile
 * can be called in the SAME transaction as FactorX business logic.
 */
interface IBlockProver {
    function verifyAndEmit(
        uint32 chainKey,
        uint64 headerNumber,
        bytes calldata txBytes,
        bytes calldata merkleProof,
        bytes calldata continuityProof
    ) external returns (bool);
}

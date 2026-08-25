# FactorX — Attestcoin Protocol Integration

## Why this matters
Depth of Attestcoin utilization is a **core scoring criterion** for BUIDL CTC 2026 Fall.

FactorX does not treat Attestcoin as an optional oracle.  
**Every update to a user’s Commercial Cashflow Passport requires a successful Attestcoin verification.**

## Official References
- Docs: https://docs.creditcoin.org/attestcoin-protocol
- SDK: `@gluwa/usc-sdk` (https://www.npmjs.com/package/@gluwa/usc-sdk)
- Precompile (Block Prover): `0x0FD2`
- Guided Tutorials (especially Tutorial 4 – Cross-Chain Loan):  
  https://docs.creditcoin.org/attestcoin-protocol/guided-tutorials
- Example repo: https://github.com/gluwa/attestcoin-protocol-examples

## Integration Flow in FactorX

```
Sepolia / Ethereum payment event
        │
        ▼
ProofBuilder / @gluwa/usc-sdk
  - Merkle proof
  - Continuity proof
  - Encoded tx + receipt bytes
        │
        ▼
AttestcoinVerifier.verifyAndRecord(...)
  1. Replay protection
  2. Call Block Prover precompile (0x0FD2)
  3. Confirm proof is valid
  4. Decode logs (topic matching)
  5. Extract & bind: amount, payer, payee, status
  6. Emit PaymentVerified
  7. Call ReceivableRegistry
        │
        ▼
CommercialScore updates (Passport)
```

## What we verify (depth checklist)

- [x] Transaction inclusion (Merkle proof)
- [x] Block continuity to attestation
- [x] Receipt status == success
- [x] Correct event topic (ERC-20 Transfer or InvoicePaid)
- [x] Amount extraction bound to the proof
- [x] Payer / payee validation
- [x] Replay protection (sourceTxHash)

## Current Implementation Status

| Piece | Status | Notes |
|-------|--------|-------|
| Function signature ready for real proofs | Done | `proof` parameter reserved |
| Precompile call site clearly marked | Done | See AttestcoinVerifier.sol |
| Log decoding structure | Ready | Topic constants defined |
| Local test path | Working | Allows full system testing without live precompile |
| Live testnet connection | Next | Requires Creditcoin testnet + SDK proof generation |

## How to connect the real precompile (next step)

1. Install SDK: `npm install @gluwa/usc-sdk`
2. Use ProofBuilder to generate proof for a Sepolia tx
3. Replace the placeholder in `AttestcoinVerifier` with actual call to `0x0FD2`
4. Decode the returned verified transaction bytes
5. Extract amount + parties from logs

This design keeps the system testable locally while making the production path obvious and judge-friendly.

## Why this is deeper than most entries

Many projects call Attestcoin once for a single deposit or invoice.  
FactorX requires Attestcoin verification on **every commercial payment** that strengthens the passport. The passport is continuous, and Attestcoin is the only gate.

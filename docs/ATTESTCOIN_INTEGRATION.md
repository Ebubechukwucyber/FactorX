# FactorX — Attestcoin Protocol Integration

Attestcoin is a **core feature**, not a mention. The Commercial Passport on Creditcoin only updates after BlockProver verification of a Sepolia payment.

## Networks

| Role | Network | ID / key |
|------|---------|----------|
| Source payments | Ethereum Sepolia | EVM 11155111, **Attestcoin chainKey = 1** |
| Execution / passport | Creditcoin testnet | EVM **102031** |

Writability is out of scope (AMA). FactorX uses **readability only**.

## Official endpoints

- ASC Dashboard: https://dashboard.cc3-testnet.creditcoin.network/
- Proof Builder: https://proof-gen-api.cc3-testnet.creditcoin.network/
- BlockProver precompile: `0x0000000000000000000000000000000000000FD2`
- SDK: `@gluwa/usc-sdk`
- Explorer: https://creditcoin-testnet.blockscout.com/

## On-chain flow

1. Merchant / payer sends a commercial payment on **Sepolia**.
2. Attestors observe the Sepolia block (lag behind tip to avoid reorgs).
3. App waits until that height is attested (`PrecompileChainInfoProvider.waitUntilHeightAttested`).
4. App asks Proof Builder for Merkle + continuity proof of the tx.
5. User calls `AttestcoinVerifier.verifyAttestedPayment` on Creditcoin.
6. Contract calls `IBlockProver.verifyAndEmit` at `0x0FD2` **in the same transaction**.
7. Contract rejects self-transfers (`payer == beneficiary`) and replayed `sourceTxHash`.
8. `ReceivableRegistry` stores the receivable → `CommercialScore` updates → passport.

## Why this is not a raw-transfer farm

- Proof must be a real Sepolia inclusion proof (BlockProver).
- `payer == beneficiary` reverts (`SelfTransfer`).
- Same `sourceTxHash` cannot be used twice.
- Next: invoice match (amount + payer bound to an invoice id).

## Creditcoin testnet addresses (2026-08-28)

| Contract | Address |
|----------|---------|
| ReceivableRegistry | `0x1e578b5aE11BEE48361b70470E8FfD939148b7F7` |
| AttestcoinVerifier | *redeploy after this upgrade* |
| CommercialScore | `0xe90195df4183865CF1533F5B90f15AC37EEbdE02` |
| FactorCredit | `0x43B016716D7ED9a208158EF6b007B6133e7745C8` |
| PassportNFT | `0xa1C6E03E9d0aa5610a9098d723BDA6241C2daCC1` |
| MockConsumer | `0x7458d143Ac7F00356A689AF40994d0255FB8d104` |

The verifier must be **redeployed** and `ReceivableRegistry.setVerifier` called again.

## Judge inspection

- Sepolia tx on Etherscan
- Attestation on ASC dashboard
- Creditcoin verify tx on Blockscout
- Score change on the dashboard / explorer page

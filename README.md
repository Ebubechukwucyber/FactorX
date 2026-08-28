# FactorX — Commercial Cashflow Passport

Attestcoin-backed credit for export service businesses.

A Sepolia payment becomes a portable commercial score on Creditcoin. No bank file. No oracle committee. Inclusion is proved with Attestcoin BlockProver (`0x0FD2`), then FactorX updates the passport.

## Live (Creditcoin testnet `102031`)

| Contract | Address |
|----------|---------|
| ReceivableRegistry | `0x1e578b5aE11BEE48361b70470E8FfD939148b7F7` |
| AttestcoinVerifier | `0x0C77Efe4B1447Bb0fFd741186c94c4699856621A` |
| CommercialScore | `0xe90195df4183865CF1533F5B90f15AC37EEbdE02` |
| FactorCredit | `0x43B016716D7ED9a208158EF6b007B6133e7745C8` |
| PassportNFT | `0xa1C6E03E9d0aa5610a9098d723BDA6241C2daCC1` |
| MockConsumer | `0x7458d143Ac7F00356A689AF40994d0255FB8d104` |

- App: `/dashboard` and `/explorer` in `frontend/`
- Source payments: Ethereum Sepolia (`chainKey = 1`)
- Proof Builder: https://prover.cc3-testnet.creditcoin.network
- ASC dashboard: https://dashboard.cc3-testnet.creditcoin.network/
- Blockscout: https://creditcoin-testnet.blockscout.com/

## Problem

Cross-border service firms (agencies, freelancers) get paid in stablecoins or ETH and still cannot show a lender a portable cashflow history. Traditional files need a bank. Naive on-chain “score goes up when money moves” can be gamed with self-transfers.

## What FactorX does

1. Payer settles a commercial payment on **Sepolia**.
2. Attestors finalize that height on Creditcoin (lag is intentional).
3. Proof Builder returns Merkle + continuity proofs.
4. Official SDK `PrecompileBlockProver.verifySingle` checks **BlockProver `0x0FD2`**.
5. `AttestcoinVerifier.verifyAndRecord` writes the receivable (replay-protected, no self-transfer).
6. `CommercialScore` updates. `FactorCredit` can open an advance at score ≥ 400, capped at 30% of verified volume.
7. `/explorer` shows amount, Sepolia tx, Attestcoin ✓, Creditcoin ✓.

## Attestcoin is core

Writability is out of scope (hackathon AMA). FactorX is **readability only**.

The score does not move until the source tx is attested and proved. Waiting minutes for attestation is the protocol, not a bug.

## Market wedge

Nigerian / African digital agencies paid in USDC or ETH by foreign clients. They already have on-chain settlement and weak traditional files.

## Repo

```
src/           Foundry contracts
test/          11 passing tests
script/        Deploy.s.sol
frontend/      Next.js 14 landing + dashboard + explorer
docs/          Attestcoin notes
```

```bash
forge test -vv
cd frontend && npm install && npm run dev
```

MetaMask: Creditcoin Testnet, chain id `102031` (`0x18e8f`), RPC `https://rpc.cc3-testnet.creditcoin.network`.

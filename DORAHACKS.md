# DoraHacks BUIDL — FactorX

## Title
FactorX — Attestcoin Commercial Cashflow Passport

## Tagline
Turn a Sepolia payment into Creditcoin credit — proved with Attestcoin, not a bank.

## One-liner
FactorX lets an export service business convert attested on-chain invoices into a portable commercial score and a capped advance on Creditcoin.

## The problem
2B+ people and most SMEs lack a file a lender will accept. In crypto, “credit” is often a number that goes up when you send yourself tokens. Cross-chain credit usually trusts an oracle.

## The product
- Source of truth: payment on Ethereum Sepolia
- Verification: Attestcoin Proof Builder + BlockProver `0x0FD2` (chainKey 1)
- Settlement: ReceivableRegistry + CommercialScore + FactorCredit on Creditcoin testnet 102031
- Interface: landing, dashboard, attestation explorer
- Guardrails: replay protection, self-transfer revert, score ≥ 400 and 30% volume cap before an advance

## Demo flow (record this)
1. Show a confirmed Sepolia payment on Etherscan.
2. Wait until ASC dashboard attested height ≥ that block.
3. Dashboard → Submit Proof → same hash.
4. Status: proof fetched → FactorX tx → score moves.
5. Explorer card: amount, Sepolia link, Attestcoin ✓, Creditcoin ✓.
6. If score ≥ 400: Request Advance (books a line, does not send ETH).

## Links
- GitHub: https://github.com/Ebubechukwucyber/FactorX
- Verifier: https://creditcoin-testnet.blockscout.com/address/0x0C77Efe4B1447Bb0fFd741186c94c4699856621A
- Registry: https://creditcoin-testnet.blockscout.com/address/0x1e578b5aE11BEE48361b70470E8FfD939148b7F7
- ASC: https://dashboard.cc3-testnet.creditcoin.network/

## What to say about 1.5 ETH test rows
Early recordings used a fixed 1.5 ETH while the proof path was wired. Later proofs read the real Sepolia value / ERC-20 Transfer. Leave the early rows; they prove the registry is append-only.

## Judging map
- Technical alignment: Attestcoin readability used to gate the score
- Execution: testnet contracts, working frontend, explorer
- Market: one wedge (export service SMEs), not “all credit”
- Honesty: advance is a booked line, not a hidden faucet

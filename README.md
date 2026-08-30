<p align="center">
  <img src="frontend/public/logo.png" alt="FactorX" width="72" height="72" />
</p>

<h1 align="center">FactorX</h1>

<p align="center">
  <strong>Commercial Cashflow Passport</strong><br />
  Attested payments in. Portable credit identity out.
</p>

<p align="center">
  <a href="https://factorx.vercel.app">App</a>
  ·
  <a href="https://youtu.be/y9v2vgB_cDg">Demo video</a>
  ·
  <a href="https://factorx.vercel.app/docs">Docs</a>
  ·
  <a href="https://factorx.vercel.app/FactorX-Protocol-Deck.pdf">Deck</a>
  ·
  <a href="https://github.com/Ebubechukwucyber/FactorX">Repo</a>
</p>

---

## Links

| | |
|---|---|
| Live app | https://factorx.vercel.app |
| Dashboard | https://factorx.vercel.app/dashboard |
| Attestation explorer | https://factorx.vercel.app/explorer |
| Technical docs | https://factorx.vercel.app/docs |
| Protocol deck | https://factorx.vercel.app/FactorX-Protocol-Deck.pdf |
| Demo video | https://youtu.be/y9v2vgB_cDg |
| GitHub | https://github.com/Ebubechukwucyber/FactorX |
| Creditcoin explorer | https://creditcoin-testnet.blockscout.com |
| Attestcoin dashboard (ASC) | https://dashboard.cc3-testnet.creditcoin.network |
| Attestcoin docs | https://docs.attestcoin.org/ |
| Creditcoin testnet RPC | https://rpc.cc3-testnet.creditcoin.network |

If a deck URL 404s, the file in `frontend/public/` may be named `FactorX-Investor-Deck.pdf` — use that host path instead.

---

## What this is

FactorX turns a **verified source-chain payment** into a **soulbound commercial identity on Creditcoin**.

Banks do not underwrite a studio that gets paid on-chain. The trail exists; the credit file does not. FactorX is that file:

1. Attestcoin proves the source-chain settlement (readability only).
2. Creditcoin stores the receivable, the score, the invoice intent, and the passport.
3. A separate lender contract reads those values and issues terms — including whether an advance is already drawn.

`requestAdvance` books a line equal to 30% of attested volume minus outstanding. It does **not** transfer tokens. A production vault would disburse after the same reads.

## Who it is for

| Role | Job |
|------|-----|
| SME / studio / exporter | Prove inbound commercial payments without a bank PDF |
| Lender / fintech | Read score, volume, counterparties, outstanding, available |
| Judge | Follow source tx → Attestcoin → Creditcoin explorer |

Wedge: digital agencies and exporters paid on-chain by foreign clients.

## What it is not

- Not a bank.
- Not a stablecoin vault.
- Not Attestcoin writability. Readability only, per AMA.
- Not USD. Amounts are native 18-decimal units from the source transaction.

---

## Live network

| Item | Value |
|------|--------|
| Execution chain | Creditcoin Testnet |
| Chain ID | `102031` (`0x18e8f`) |
| RPC | `https://rpc.cc3-testnet.creditcoin.network` |
| Block explorer | https://creditcoin-testnet.blockscout.com |
| Attestcoin | readability, source `chainKey = 1` |

### Contracts

| Contract | Address |
|----------|---------|
| ReceivableRegistry | [`0x1e578b5aE11BEE48361b70470E8FfD939148b7F7`](https://creditcoin-testnet.blockscout.com/address/0x1e578b5aE11BEE48361b70470E8FfD939148b7F7) |
| AttestcoinVerifier | [`0x18CD4A1444933E3FCE147fB2e953ECae23e03AD1`](https://creditcoin-testnet.blockscout.com/address/0x18CD4A1444933E3FCE147fB2e953ECae23e03AD1) |
| CommercialScore | [`0xe90195df4183865CF1533F5B90f15AC37EEbdE02`](https://creditcoin-testnet.blockscout.com/address/0xe90195df4183865CF1533F5B90f15AC37EEbdE02) |
| FactorCredit | [`0x96e99678067c62c441152E69975438768e3afEAf`](https://creditcoin-testnet.blockscout.com/address/0x96e99678067c62c441152E69975438768e3afEAf) |
| PassportNFT | [`0xEB1D16bA39D752B5eCABB8D13dA8C8AA364376Ea`](https://creditcoin-testnet.blockscout.com/address/0xEB1D16bA39D752B5eCABB8D13dA8C8AA364376Ea) |
| CommercialIntent | [`0xB37b771B1337cF555dFAeF8bd7190445D75796aa`](https://creditcoin-testnet.blockscout.com/address/0xB37b771B1337cF555dFAeF8bd7190445D75796aa) |
| MockConsumer | [`0x2A845d32837CB3549f3e14cE160586961c522AEc`](https://creditcoin-testnet.blockscout.com/address/0x2A845d32837CB3549f3e14cE160586961c522AEc) |

---

## Architecture

```text
Source-chain payment
        │
        ▼
Proof Builder + USC SDK verifySingle
        │
        ▼
FactorX.verifyAndRecord          Creditcoin 102031
        ├── ReceivableRegistry
        ├── CommercialIntent     invoice id, confidence 1|2
        ├── CommercialScore      view
        ├── PassportNFT          soulbound, first success
        └── FactorCredit         cap = 30% volume − outstanding
                │
                ▼
        MockConsumer             score + debt + available → terms
```

Replay of the same source hash reverts. Self-pay (`payer == beneficiary`) reverts.

### Score

```text
base 300
+ 25 per verified payment
+ 15 per unique payer
+ volume / 1e18
+ recency (50 if < 30d, 20 if < 90d)
capped at 950
```

Credit requires score ≥ 400.

---

## Repo

```text
src/                 Solidity (Foundry, solc 0.8.24, evm london, via_ir)
script/              Deploy.s.sol
test/
frontend/            Next.js 14 + viem + Tailwind
docs/
fxpass-1.json
```

---

## Run locally

```bash
cd frontend
npm install
npm run dev
```

MetaMask on Creditcoin Testnet **102031**.

```bash
forge test -vv
```

Creditcoin broadcasts: `--legacy` and `FOUNDRY_EVM_VERSION=london`.

### Lender reads

```bash
RPC=https://rpc.cc3-testnet.creditcoin.network
ME=0xYourMerchantWallet

cast call 0xe90195df4183865CF1533F5B90f15AC37EEbdE02 "getCommercialScore(address)(uint256)" $ME --rpc-url $RPC
cast call 0x96e99678067c62c441152E69975438768e3afEAf "outstanding(address)(uint256)" $ME --rpc-url $RPC
cast call 0x96e99678067c62c441152E69975438768e3afEAf "getAvailableCredit(address)(uint256)" $ME --rpc-url $RPC
cast call 0x2A845d32837CB3549f3e14cE160586961c522AEc "checkAndOfferTerms(address)(string)" $ME --rpc-url $RPC
cast call 0xEB1D16bA39D752B5eCABB8D13dA8C8AA364376Ea "hasPassport(address)(bool)" $ME --rpc-url $RPC
```

`$ME` is `0x` + 40 hex.

---

## Running the live demo

This deployment watches **Attestcoin `chainKey = 1`** (Ethereum Sepolia) as the source of payments. You only need that name when creating a test payment or reading the origin explorer.

1. From a **different** origin wallet, send a payment to the merchant on that source testnet.
2. Wait until ASC attested height ≥ that block (`chainKey 1`).
3. https://factorx.vercel.app/dashboard → Submit proof → confirm `verifyAndRecord`.
4. `/explorer` — source hash, Attestcoin, Creditcoin.
5. Passport card — `FXPASS #n`.
6. Request Advance — books 30% of volume; second click fails at 0 available.
7. Check terms — `BetterTermsOffered` on Blockscout.

Duplicate source hashes are rejected.

---

## License

MIT.

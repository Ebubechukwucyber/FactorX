<p align="center">
  <img src="frontend/public/logo.png" alt="FactorX" width="72" height="72" />
</p>

<h1 align="center">FactorX</h1>

<p align="center">
  <strong>Commercial Cashflow Passport</strong><br />
  Attested payments in. Portable credit identity out.
</p>

<p align="center">
  Creditcoin Testnet <code>102031</code>
  ·
  Attestcoin readability (Sepolia <code>chainKey = 1</code>)
</p>

---

## What this is

FactorX turns a **real payment on Sepolia** into a **soulbound commercial identity on Creditcoin**.

Banks do not underwrite an African studio that gets paid in USDC or ETH. The trail exists on-chain; the credit file does not. FactorX is that file:

1. Attestcoin proves the Sepolia settlement.
2. Creditcoin stores the receivable, the score, the invoice intent, and the passport.
3. A separate lender contract reads those values and issues terms — including whether an advance is already drawn.

This repo is the hackathon implementation. Disbursement of cash is **out of scope**. `requestAdvance` books a line. It does not transfer tokens.

## Who it is for

| Role | Job |
|------|-----|
| SME / studio / exporter | Prove inbound commercial payments without a bank PDF |
| Lender / fintech | Read score, volume, counterparties, outstanding, available |
| Judge | Follow Sepolia tx → Attestcoin → Creditcoin explorer |

Wedge: **digital agencies and service exporters paid on-chain by foreign clients.**

## What it is not

- Not a bank.
- Not a stablecoin vault.
- Not Attestcoin writability (headers / committee). Readability only, per AMA.
- Not USD. All amounts are **wei / ETH** from the source tx.

---

## Live testnet

| Item | Value |
|------|--------|
| Chain | Creditcoin Testnet |
| Chain ID | `102031` (`0x18e8f`) |
| RPC | `https://rpc.cc3-testnet.creditcoin.network` |
| Explorer | https://creditcoin-testnet.blockscout.com |
| Attestcoin dashboard | https://dashboard.cc3-testnet.creditcoin.network |
| Source payments | Ethereum Sepolia, `chainKey = 1` |

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

Passport metadata: [`fxpass-1.json`](./fxpass-1.json)  
Image: `frontend/public/passport-nft.jpg`

---

## Architecture

```text
Sepolia payment
        │
        ▼
Proof Builder  (@gluwa/usc-sdk)     wait until header is attested
        │
        ▼
SDK verifySingle  +  FactorX.verifyAndRecord
        │
        ├── ReceivableRegistry     payer, amount, tx hash, event type
        ├── CommercialIntent       invoiceId, confidence 1|2
        ├── CommercialScore        view over registry
        ├── PassportNFT            soulbound mint on first payment
        └── FactorCredit           cap = 30% of volume, remaining = cap − debt
                │
                ▼
        MockConsumer               reads score + outstanding + available
```

Attestcoin precompile `0x0FD2` is exercised via the official SDK (`verifySingle`). The FactorX verifier records only after that proof path succeeds. Same-transaction `verifyAndEmit` from Solidity was dropped: the public selector did not match this testnet.

### Score

```text
base 300
+ 25 per verified payment
+ 15 per unique payer
+ volume / 1e18
+ recency bonus (50 if < 30d, 20 if < 90d)
capped at 950
```

Credit requires score ≥ 400.

### Credit line

```text
maxAdvance = totalVolume * 30%
available  = maxAdvance − outstanding
requestAdvance(requested) books min(requested, available)
if available == 0 → revert ExceedsLimit
```

No token transfer. `repay(uint256)` exists on-chain; the UI does not call it yet.

### Confidence

| Invoice field | confidence |
|---------------|------------|
| empty         | 1  payment only |
| `INV-…`       | 2  invoice linked |
| payer == beneficiary | revert `SelfTransfer` |
| same `sourceTxHash`  | revert `ProofAlreadyUsed` |

---

## Repo

```text
src/                 Solidity (Foundry, solc 0.8.24, evm london, via_ir)
script/              Deploy.s.sol (Anvil / historical)
test/                FactorX.t.sol, PassportNFT.t.sol
frontend/            Next.js 14 + viem + Tailwind
  app/page.tsx                 landing
  app/dashboard/page.tsx       merchant console
  app/explorer/page.tsx        attestation explorer
  app/api/attestcoin/proof     Proof Builder proxy
docs/                Attestcoin notes
fxpass-1.json        ERC-721 metadata
```

`out/`, `cache/`, `frontend/node_modules`, `.next` are not source. Do not commit them.

---

## Run locally

### Contracts

```bash
foundryup
forge test -vv
```

Creditcoin broadcasts need `--legacy` and `FOUNDRY_EVM_VERSION=london`. RPC block headers omit `mixHash`; Foundry logs that error and still lands the tx.

### App

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:3000`. MetaMask must be on **102031**. Disable extra injected wallets (TronLink) if `window.ethereum` is contested.

### Lender reads (no UI)

```bash
RPC=https://rpc.cc3-testnet.creditcoin.network
ME=0xYourMerchantWallet

cast call 0xe90195df4183865CF1533F5B90f15AC37EEbdE02 "getCommercialScore(address)(uint256)" $ME --rpc-url $RPC
cast call 0x96e99678067c62c441152E69975438768e3afEAf "outstanding(address)(uint256)" $ME --rpc-url $RPC
cast call 0x96e99678067c62c441152E69975438768e3afEAf "getAvailableCredit(address)(uint256)" $ME --rpc-url $RPC
cast call 0x2A845d32837CB3549f3e14cE160586961c522AEc "checkAndOfferTerms(address)(string)" $ME --rpc-url $RPC
cast call 0xEB1D16bA39D752B5eCABB8D13dA8C8AA364376Ea "hasPassport(address)(bool)" $ME --rpc-url $RPC
```

`$ME` is `0x` + 40 hex (wallet), never a 66-character tx hash.

---

## Demo path

1. Send a Sepolia payment **from another wallet** to the merchant.
2. Wait until Attestcoin latest height ≥ that block (`chainKey 1`).
3. Dashboard → Submit proof → optional invoice id → confirm `verifyAndRecord`.
4. `/explorer` — inspect the receipt.
5. Passport card — `FXPASS #n`.
6. Request Advance — books 30% of volume; second click reverts at 0 available.
7. Check terms — MockConsumer emits `BetterTermsOffered(score, outstanding, available, message)`.

Duplicate Sepolia hashes are rejected. The submit modal only surfaces **success** or **already recorded**.

---

## Integration surface for a real lender

```solidity
score.getCommercialScore(sme)
credit.outstanding(sme)
credit.getAvailableCredit(sme)
passport.hasPassport(sme)
```

MockConsumer is that consumer already deployed. A production vault would disburse ERC-20 after those reads; this repo does not ship the vault.

---

## License

MIT.

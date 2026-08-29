"use client";

import Link from "next/link";
import Image from "next/image";
import SiteNav from "@/components/SiteNav";

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <SiteNav />
      <main className="mx-auto max-w-3xl px-6 py-14 text-[15px] leading-[1.7]">
        <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-accent">Technical documentation</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Attestcoin Protocol integration</h1>
        <p className="mt-4 text-muted">
          FactorX treats Attestcoin as the trust boundary. A Creditcoin passport row is written only after a source-chain inclusion proof is available. This is the setup document for BUIDL CTC 2026 Fall.
        </p>
        <p className="mt-3 text-[13px] text-muted">
          <a className="text-accent hover:underline" href="https://docs.attestcoin.org/" target="_blank" rel="noreferrer">docs.attestcoin.org</a>
          {" · "}
          <a className="text-accent hover:underline" href="/FactorX-Protocol-Deck.pdf">Protocol deck</a>
        </p>

        <h2 className="mt-14 text-xl font-semibold">Scope</h2>
        <p className="mt-3 text-muted">
          Readability only. Creditcoin consumes attested facts about another chain. FactorX does not implement writability. The attested fact is a commercial payment already included in a source-chain block.
        </p>

        <h2 className="mt-14 text-xl font-semibold">Environments</h2>
        <pre className="mt-4 overflow-x-auto rounded-2xl border border-border bg-card p-4 font-mono text-[12px] leading-6 text-muted">{`Source     Attestcoin chainKey = 1   (demo: Ethereum Sepolia)
Execution  Creditcoin Testnet         chainId 102031
RPC        https://rpc.cc3-testnet.creditcoin.network
Precompile BlockProver                0x0000000000000000000000000000000000000FD2`}</pre>
        <p className="mt-3 text-muted">
          Attestors trail source tip. A payment in block N is unused until attested height for chainKey 1 is ≥ N.
        </p>

        <h2 className="mt-14 text-xl font-semibold">Proof path</h2>
        <p className="mt-3 text-muted">
          Server route <code className="text-[13px]">GET /api/attestcoin/proof?tx=0x…</code> loads the origin receipt, waits on attested height, then asks Proof Builder for header, encoded tx, Merkle proof, and continuity proof. The browser runs the official SDK:
        </p>
        <pre className="mt-4 overflow-x-auto rounded-2xl border border-border bg-card p-4 font-mono text-[12px] leading-6 text-muted">{`import { UscClient } from "@gluwa/usc-sdk";

const ok = await usc.verifySingle({
  chainKey: 1,
  header,
  txBytes,
  merkleProof,
  continuityProof,
});
if (!ok) throw new Error("Attestcoin verifySingle failed");`}</pre>
        <p className="mt-3 text-muted">
          Only then does the wallet send <code className="text-[13px]">verifyAndRecord</code>. A first build attempted Solidity <code className="text-[13px]">verifyAndEmit</code> on <code className="text-[13px]">0x0FD2</code> in the same transaction; the public selector on this testnet did not match. The shipped path is the documented SDK entry plus an on-chain record bound to the source hash.
        </p>
        <pre className="mt-4 overflow-x-auto rounded-2xl border border-border bg-card p-4 font-mono text-[12px] leading-6 text-muted">{`await walletClient.writeContract({
  address: ADDRESSES.verifier,
  abi: verifierAbi,
  functionName: "verifyAndRecord",
  args: [
    sourceTxHash,
    eventType,
    payer,
    amount,
    invoiceId,      // bytes32, keccak256 of the invoice string
  ],
  account,
  chain: creditcoinTestnet,
});`}</pre>

        <h2 className="mt-14 text-xl font-semibold">What Creditcoin stores</h2>
        <p className="mt-3 text-muted">
          The verifier writes payer, beneficiary, amount, event type, and source tx hash to ReceivableRegistry. CommercialIntent stores confidence 1 (payment) or 2 (invoice id present). PassportNFT mints once. CommercialScore is a view over those stats. Two reverts matter more than the formula:
        </p>
        <pre className="mt-4 overflow-x-auto rounded-2xl border border-border bg-card p-4 font-mono text-[12px] leading-6 text-muted">{`if (payer == beneficiary) revert SelfTransfer();
if (usedTx[sourceTxHash]) revert ProofAlreadyUsed();`}</pre>

        <h2 className="mt-14 text-xl font-semibold">Lender integration</h2>
        <p className="mt-3 text-muted">No FactorX account. Four reads:</p>
        <pre className="mt-4 overflow-x-auto rounded-2xl border border-border bg-card p-4 font-mono text-[12px] leading-6 text-muted">{`passport.hasPassport(sme);
score.getCommercialScore(sme);
credit.outstanding(sme);
credit.getAvailableCredit(sme);

// already deployed as MockConsumer
consumer.checkAndOfferTerms(sme);
// emits BetterTermsOffered(user, score, outstanding, available, message)`}</pre>
        <pre className="mt-4 overflow-x-auto rounded-2xl border border-border bg-card p-4 font-mono text-[12px] leading-6 text-muted">{`cast call $CONSUMER "checkAndOfferTerms(address)(string)" $SME \\
  --rpc-url https://rpc.cc3-testnet.creditcoin.network`}</pre>

        <h2 className="mt-14 text-xl font-semibold">Deployed addresses</h2>
        <pre className="mt-4 overflow-x-auto rounded-2xl border border-border bg-card p-4 font-mono text-[12px] leading-6 text-muted">{`ReceivableRegistry  0x1e578b5aE11BEE48361b70470E8FfD939148b7F7
AttestcoinVerifier  0x18CD4A1444933E3FCE147fB2e953ECae23e03AD1
CommercialScore     0xe90195df4183865CF1533F5B90f15AC37EEbdE02
FactorCredit        0x96e99678067c62c441152E69975438768e3afEAf
PassportNFT         0xEB1D16bA39D752B5eCABB8D13dA8C8AA364376Ea
CommercialIntent    0xB37b771B1337cF555dFAeF8bd7190445D75796aa
MockConsumer        0x2A845d32837CB3549f3e14cE160586961c522AEc`}</pre>

        <h2 className="mt-14 text-xl font-semibold">Reproduce</h2>
        <p className="mt-3 text-muted">
          Pay the merchant from a different origin wallet. Wait until ASC attested height covers that block. Submit the hash. Confirm the row on <Link href="/explorer" className="text-accent hover:underline">/explorer</Link>. Check terms and read the consumer log on Blockscout.
        </p>
      </main>
    </div>
  );
}

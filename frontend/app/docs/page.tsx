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
          FactorX treats Attestcoin as the trust boundary, not as a badge. A Creditcoin passport row is written only after a source-chain inclusion proof is available from Attestcoin infrastructure. This note is the setup document for BUIDL CTC 2026 Fall: networks, proof path, contract surface, and what a judge should inspect.
        </p>
        <p className="mt-3 text-[13px] text-muted">
          Official references:{" "}
          <a className="text-accent hover:underline" href="https://docs.attestcoin.org/" target="_blank" rel="noreferrer">docs.attestcoin.org</a>
          {" · "}
          <a className="text-accent hover:underline" href="https://attestcoin.org/" target="_blank" rel="noreferrer">attestcoin.org</a>
          {" · "}
          <a className="text-accent hover:underline" href="/FactorX-Protocol-Brief.pdf">Protocol brief (PDF)</a>
        </p>

        <h2 className="mt-14 text-xl font-semibold">Scope</h2>
        <p className="mt-3 text-muted">
          Season rules require a meaningful Attestcoin integration. FactorX implements <b className="font-medium text-[var(--text)]">readability</b>: Creditcoin consumes attested facts about another chain. It does not implement writability (Attestcoin-assisted egress back onto the source chain). That matches the AMA: writability is out of scope unless a product truly needs it.
        </p>
        <p className="mt-3 text-muted">
          The attested fact FactorX cares about is a commercial payment already included in a source-chain block. The product question is not “did a wallet click a button on Creditcoin?” It is “did a counterparty settle on a chain Attestcoin watches, and can that settlement be replay-safe on Creditcoin?”
        </p>

        <h2 className="mt-14 text-xl font-semibold">Environments</h2>
        <p className="mt-3 text-muted">
          Source observations use Attestcoin <code className="text-[13px]">chainKey = 1</code> (Ethereum Sepolia in this deployment). Execution, storage, and the passport live on Creditcoin Testnet, EVM chain id <code className="text-[13px]">102031</code>, RPC <code className="text-[13px]">https://rpc.cc3-testnet.creditcoin.network</code>.
        </p>
        <p className="mt-3 text-muted">
          Attestors trail source tip to reduce reorg risk. A payment in block N is not usable until Attestcoin’s latest attested height for chainKey 1 is ≥ N. The UI wait state is that lag, not a spinner with no protocol meaning.
        </p>

        <h2 className="mt-14 text-xl font-semibold">Proof path</h2>
        <p className="mt-3 text-muted">
          <code className="text-[13px]">frontend/app/api/attestcoin/proof</code> is the only server route. It takes a source transaction hash, fetches the origin receipt, rejects missing or reverted receipts, then polls attested height. When the height is live it requests header bytes, encoded transaction, Merkle proof, and continuity proof from the Creditcoin Proof Builder.
        </p>
        <p className="mt-3 text-muted">
          The browser then runs <code className="text-[13px]">@gluwa/usc-sdk@0.18.0</code> <code className="text-[13px]">verifySingle</code> against Creditcoin. That is the Attestcoin SDK entry the docs call out for dapp builders. Only after <code className="text-[13px]">verifySingle</code> returns true does the wallet send <code className="text-[13px]">AttestcoinVerifier.verifyAndRecord</code>.
        </p>
        <p className="mt-3 text-muted">
          A first implementation attempted a same-transaction Solidity call to BlockProver <code className="text-[13px]">0x0FD2</code> (<code className="text-[13px]">verifyAndEmit</code>). The public selector on this testnet did not match the interface we compiled. Rather than fake a precompile success, FactorX kept the SDK verification (the supported builder path) and bound the Creditcoin record to the attested source hash with replay protection. Judges should treat that as an explicit tradeoff, not as “Attestcoin mentioned in README.”
        </p>

        <h2 className="mt-14 text-xl font-semibold">What gets written on Creditcoin</h2>
        <p className="mt-3 text-muted">
          <code className="text-[13px]">verifyAndRecord</code> is permissioned to the verifier. It stores payer, beneficiary, amount, event type, and source tx hash on <code className="text-[13px]">ReceivableRegistry</code>. The same call writes invoice confidence on <code className="text-[13px]">CommercialIntent</code> (1 = payment only, 2 = invoice id present) and mints a soulbound <code className="text-[13px]">PassportNFT</code> on the first success for that wallet. <code className="text-[13px]">CommercialScore</code> is a pure view over registry statistics: payment count, unique counterparties, volume, recency.
        </p>
        <p className="mt-3 text-muted">
          Two protocol-level rejects matter more than the score formula. <code className="text-[13px]">payer == beneficiary</code> reverts (<code className="text-[13px]">SelfTransfer</code>). A reused source tx hash reverts (<code className="text-[13px]">ProofAlreadyUsed</code>). Those rules stop a merchant from farming the passport with loops or screenshots.
        </p>

        <h2 className="mt-14 text-xl font-semibold">Consumer side</h2>
        <p className="mt-3 text-muted">
          FactorX is a bureau. <code className="text-[13px]">MockConsumer</code> is a separate contract that reads <code className="text-[13px]">getCommercialScore</code>, <code className="text-[13px]">outstanding</code>, and <code className="text-[13px]">getAvailableCredit</code>, then emits <code className="text-[13px]">BetterTermsOffered</code>. If the 30% volume cap is fully drawn, the message is a refusal. That event is the composability proof: another program used Attestcoin-backed state without a FactorX admin key.
        </p>

        <h2 className="mt-14 text-xl font-semibold">Deployed addresses (Creditcoin 102031)</h2>
        <pre className="mt-4 overflow-x-auto rounded-2xl border border-border bg-card p-4 font-mono text-[12px] leading-6 text-muted">{`ReceivableRegistry  0x1e578b5aE11BEE48361b70470E8FfD939148b7F7
AttestcoinVerifier  0x18CD4A1444933E3FCE147fB2e953ECae23e03AD1
CommercialScore     0xe90195df4183865CF1533F5B90f15AC37EEbdE02
FactorCredit        0x96e99678067c62c441152E69975438768e3afEAf
PassportNFT         0xEB1D16bA39D752B5eCABB8D13dA8C8AA364376Ea
CommercialIntent    0xB37b771B1337cF555dFAeF8bd7190445D75796aa
MockConsumer        0x2A845d32837CB3549f3e14cE160586961c522AEc`}</pre>

        <h2 className="mt-14 text-xl font-semibold">How to reproduce</h2>
        <p className="mt-3 text-muted">
          1. Pay the merchant from a different origin wallet so the transfer is not a self-send.
          2. Wait until ASC shows attested height ≥ that block for chainKey 1.
          3. Open the app, submit the hash, confirm <code className="text-[13px]">verifyAndRecord</code>.
          4. Confirm the row on <Link href="/explorer" className="text-accent hover:underline">/explorer</Link> and the soulbound token on Blockscout.
          5. Call Check terms and read the consumer log.
        </p>
        </main>
    </div>
  );
}

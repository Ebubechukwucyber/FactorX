"use client";

import Link from "next/link";
import Image from "next/image";
import ThemeToggle from "@/components/ThemeToggle";

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <header className="sticky top-0 z-40 border-b border-border-subtle bg-bg/90 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <Image src="/logo.png" alt="FactorX" width={28} height={28} className="h-7 w-7 object-contain" />
            <span className="text-[13px] font-semibold">FactorX</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="text-[13px] text-muted hover:text-[var(--text)]">
              Dashboard
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-14 text-[15px] leading-relaxed">
        <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-accent">Technical documentation</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Attestcoin Protocol integration</h1>
        <p className="mt-3 text-muted">
          How FactorX uses Attestcoin readability to turn a source-chain payment into a Creditcoin passport.
          This page is the setup note required for BUIDL CTC 2026 Fall.
        </p>

        <h2 className="mt-12 text-xl font-semibold">What FactorX uses</h2>
        <p className="mt-3 text-muted">
          Readability only. Writability is out of season scope. FactorX never asks Attestcoin to send a source-chain transaction. It proves that a payment already included on the source chain is real, then writes the commercial file on Creditcoin.
        </p>

        <h2 className="mt-12 text-xl font-semibold">Networks</h2>
        <p className="mt-3 text-muted">
          Source payments: EVM origin used in this demo (Ethereum Sepolia, Attestcoin chainKey 1). Execution: Creditcoin Testnet 102031.
        </p>

        <h2 className="mt-12 text-xl font-semibold">Endpoints</h2>
        <p className="mt-3 text-muted">
          ASC dashboard for attested height. Proof Builder for header, transaction bytes, Merkle proof, and continuity proof. USC SDK 0.18.0 verifySingle. BlockProver precompile 0x0FD2. FactorX verifyAndRecord after the proof path succeeds.
        </p>

        <h2 className="mt-12 text-xl font-semibold">Runtime flow</h2>
        <p className="mt-3 text-muted">
          1. A counterparty pays the merchant on the source chain. Self-pays are rejected later.
          2. GET /api/attestcoin/proof?tx=0x… loads the source receipt, waits until Attestcoin latest attested height covers that block, then asks Proof Builder for inclusion proofs.
          3. The browser runs USC SDK verifySingle against Creditcoin.
          4. The merchant signs AttestcoinVerifier.verifyAndRecord on chain 102031 with source tx hash, event type, payer, amount, and invoice id.
          5. The verifier records the receivable, writes invoice confidence, mints the soulbound passport on first success, and updates the score.
        </p>
        <p className="mt-3 text-muted">
          Same-transaction Solidity verifyAndEmit at 0x0FD2 did not match this testnet public selector. The shipped path is SDK verification plus an on-chain record bound to the attested source hash. Replay of that hash reverts.
        </p>

        <h2 className="mt-12 text-xl font-semibold">Why Attestcoin is required</h2>
        <p className="mt-3 text-muted">
          The passport and score only move after a source payment that Attestcoin has attested. A raw Creditcoin transfer does not raise the file. Without attested height and proof, FactorX will not record the receivable.
        </p>

        <h2 className="mt-12 text-xl font-semibold">Contracts on Creditcoin testnet</h2>
        <p className="mt-3 font-mono text-[12px] leading-7 text-muted">
          Registry 0x1e578b5aE11BEE48361b70470E8FfD939148b7F7<br/>
          Verifier 0x18CD4A1444933E3FCE147fB2e953ECae23e03AD1<br/>
          Score 0xe90195df4183865CF1533F5B90f15AC37EEbdE02<br/>
          Credit 0x96e99678067c62c441152E69975438768e3afEAf<br/>
          Passport 0xEB1D16bA39D752B5eCABB8D13dA8C8AA364376Ea<br/>
          Intent 0xB37b771B1337cF555dFAeF8bd7190445D75796aa<br/>
          Consumer 0x2A845d32837CB3549f3e14cE160586961c522AEc
        </p>

        <h2 className="mt-12 text-xl font-semibold">Judge checklist</h2>
        <p className="mt-3 text-muted">
          Source payment on the origin explorer. Attested height on the ASC dashboard. Creditcoin verifyAndRecord transaction. In-app explorer receipt. MockConsumer BetterTermsOffered log.
        </p>

        <p className="mt-12 text-[13px] text-muted">
          Protocol brief PDF:{" "}
          <a className="text-accent hover:underline" href="/FactorX-Protocol-Brief.pdf">
            FactorX-Protocol-Brief.pdf
          </a>
        </p>
      </main>
    </div>
  );
}

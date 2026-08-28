"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatEther, type Address } from "viem";
import ThemeToggle from "@/components/ThemeToggle";
import { publicClient, connectWallet, errMsg } from "@/lib/chain";
import { ADDRESSES, registryAbi } from "@/lib/contracts";

type Row = {
  payer: Address;
  amount: bigint;
  sourceTxHash: `0x${string}`;
  timestamp: bigint;
  eventType: number;
};

const SEPOLIA_TX = (h: string) => `https://sepolia.etherscan.io/tx/${h}`;
const CC_ADDR = (a: string) => `https://creditcoin-testnet.blockscout.com/address/${a}`;
const ASC = "https://dashboard.cc3-testnet.creditcoin.network/";

export default function ExplorerPage() {
  const [address, setAddress] = useState<Address | null>(null);
  const [rows, setRows] = useState<Row[]>([]);
  const [status, setStatus] = useState("");
  const [open, setOpen] = useState<string | null>(null);

  useEffect(() => {
    if (!address) return;
    (async () => {
      try {
        const data = (await publicClient.readContract({
          address: ADDRESSES.registry,
          abi: registryAbi,
          functionName: "getReceivables",
          args: [address],
        })) as Row[];
        setRows([...(data || [])].reverse());
      } catch (e) {
        setStatus(errMsg(e));
      }
    })();
  }, [address]);

  return (
    <main className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <header className="flex items-center justify-between border-b border-border px-6 py-4">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-[15px] font-semibold">
            FactorX
          </Link>
          <span className="text-muted">/</span>
          <span className="text-[13px] text-muted">Attestation explorer</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="text-[13px] text-muted hover:text-[var(--text)]">
            Dashboard
          </Link>
          <ThemeToggle />
          <button
            onClick={async () => {
              try {
                const { address: a } = await connectWallet();
                setAddress(a);
              } catch (e) {
                setStatus(errMsg(e));
              }
            }}
            className="rounded-xl bg-accent px-3 py-1.5 text-[13px] font-semibold text-white"
          >
            {address ? `${address.slice(0, 6)}…${address.slice(-4)}` : "Connect"}
          </button>
        </div>
      </header>

      <section className="mx-auto max-w-3xl px-6 py-10">
        <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.2em] text-accent">
          Proof view
        </p>
        <h1 className="mb-3 text-3xl font-semibold tracking-tight">Attestation explorer</h1>
        <p className="mb-8 max-w-xl text-[14px] leading-relaxed text-muted">
          Every score increase is backed by a Sepolia payment and an Attestcoin
          inclusion proof. Inspect the trail a judge would open.
        </p>

        {status && <p className="mb-4 text-[13px] text-red-400">{status}</p>}

        {!address && (
          <p className="text-[14px] text-muted">Connect the merchant wallet to load verified payments.</p>
        )}

        {address && rows.length === 0 && !status && (
          <p className="text-[14px] text-muted">No verified receivables yet.</p>
        )}

        <div className="space-y-3">
          {rows.map((r, i) => {
            const n = rows.length - i;
            const openId = r.sourceTxHash;
            const isOpen = open === openId;
            return (
              <article
                key={openId + String(r.timestamp)}
                className="rounded-2xl border border-border bg-card p-5 shadow-sm"
              >
                <button
                  className="flex w-full items-center justify-between text-left"
                  onClick={() => setOpen(isOpen ? null : openId)}
                >
                  <div>
                    <p className="text-[11px] uppercase tracking-wider text-muted">
                      Payment #{n}
                    </p>
                    <p className="mt-1 text-lg font-semibold">
                      {formatEther(r.amount)} ETH
                    </p>
                  </div>
                  <span className="rounded-full bg-accent-soft px-3 py-1 text-[12px] font-medium text-accent">
                    Verified
                  </span>
                </button>

                {isOpen && (
                  <dl className="mt-5 grid grid-cols-2 gap-x-6 gap-y-3 text-[13px]">
                    <dt className="text-muted">Amount</dt>
                    <dd className="font-mono">{formatEther(r.amount)} ETH</dd>
                    <dt className="text-muted">Source chain</dt>
                    <dd>Ethereum Sepolia (chainKey 1)</dd>
                    <dt className="text-muted">Status</dt>
                    <dd>Verified</dd>
                    <dt className="text-muted">Payer</dt>
                    <dd className="font-mono break-all">{r.payer}</dd>
                    <dt className="text-muted">Transaction</dt>
                    <dd className="font-mono break-all">
                      <a
                        className="text-accent underline-offset-2 hover:underline"
                        href={SEPOLIA_TX(r.sourceTxHash)}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {r.sourceTxHash}
                      </a>
                    </dd>
                    <dt className="text-muted">Attestcoin</dt>
                    <dd>
                      ✓ Proof verified{" "}
                      <a className="text-accent hover:underline" href={ASC} target="_blank" rel="noreferrer">
                        ASC dashboard
                      </a>
                    </dd>
                    <dt className="text-muted">Creditcoin</dt>
                    <dd>
                      ✓ Passport updated{" "}
                      <a
                        className="text-accent hover:underline"
                        href={CC_ADDR(ADDRESSES.registry)}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Registry
                      </a>
                    </dd>
                    <dt className="text-muted">Event</dt>
                    <dd>{r.eventType === 1 ? "InvoicePaid" : "ERC-20 Transfer"}</dd>
                  </dl>
                )}
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}

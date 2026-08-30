"use client";

import { useState } from "react";

interface Props {
  onClose: () => void;
  onSubmit?: (txHash: string, eventType: number, invoiceId: string) => void;
  loading?: boolean;
  status?: string;
}

const STEPS = [
  { key: "fetch", label: "Read source payment" },
  { key: "attest", label: "Wait for Attestcoin height" },
  { key: "proof", label: "Build inclusion proof" },
  { key: "sign", label: "Sign verifyAndRecord" },
  { key: "done", label: "Record on Creditcoin" },
];

function activeIndex(status: string, loading: boolean) {
  const s = (status || "").toLowerCase();
  if (s.includes("verified") || s.includes("recorded")) return 5;
  if (s.includes("already")) return -1;
  if (s.includes("self-transfer") || s.includes("could not read") || s.includes("0x + 64")) return -1;
  if (s.includes("recording") || s.includes("confirm") || s.includes("wallet")) return 3;
  if (s.includes("proof") || s.includes("builder") || s.includes("sdk") || s.includes("verifysingle")) return 2;
  if (s.includes("attest") || s.includes("height") || s.includes("block") || s.includes("wait")) return 1;
  if (s.includes("fetch") || s.includes("source") || s.includes("receipt") || loading) return 0;
  return loading ? 0 : -1;
}

export default function SubmitProof({ onClose, onSubmit, loading, status }: Props) {
  const [txHash, setTxHash] = useState("");
  const [eventType, setEventType] = useState(0);
  const [invoiceId, setInvoiceId] = useState("");
  const idx = activeIndex(status || "", !!loading);
  const showSteps = !!loading || idx >= 0 || !!(status && status.toLowerCase().includes("already"));
  const err = (status || "").toLowerCase().includes("already") ||
    (status || "").toLowerCase().includes("self-transfer") ||
    (status || "").toLowerCase().includes("could not read") ||
    (status || "").toLowerCase().includes("0x + 64");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-card">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-[15px] font-semibold text-[var(--text)]">Submit Payment Proof</h2>
          <button
            onClick={onClose}
            className="rounded-lg px-2 py-1 text-muted transition hover:bg-border hover:text-[var(--text)]"
          >
            ✕
          </button>
        </div>

        <p className="mb-5 text-[13px] leading-relaxed text-muted">
          Paste a source-chain payment hash. You will see each Attestcoin step before the wallet signature.
        </p>

        <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-muted">
          Transaction Hash
        </label>
        <input
          type="text"
          placeholder="0x… payment hash"
          value={txHash}
          onChange={(e) => setTxHash(e.target.value)}
          className="mb-4 w-full rounded-xl border border-border bg-bg px-3.5 py-2.5 font-mono text-[13px] text-[var(--text)] placeholder:text-muted/50 focus:border-accent/50 focus:outline-none"
        />

        <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-muted">
          Event Type
        </label>
        <select
          value={eventType}
          onChange={(e) => setEventType(Number(e.target.value))}
          className="mb-4 w-full rounded-xl border border-border bg-bg px-3.5 py-2.5 text-[13px] text-[var(--text)] focus:border-accent/50 focus:outline-none"
        >
          <option value={0}>ERC-20 Transfer</option>
          <option value={1}>InvoicePaid</option>
        </select>

        <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-muted">
          Invoice ID (optional)
        </label>
        <input
          type="text"
          placeholder="INV-1042 or 0x…"
          value={invoiceId}
          onChange={(e) => setInvoiceId(e.target.value)}
          className="mb-5 w-full rounded-xl border border-border bg-bg px-3.5 py-2.5 font-mono text-[13px] text-[var(--text)] placeholder:text-muted/50 focus:border-accent/50 focus:outline-none"
        />

        {showSteps && (
          <ol className="mb-5 space-y-2.5 border-l border-border pl-4">
            {STEPS.map((step, i) => {
              const done = idx > i;
              const current = idx === i;
              return (
                <li key={step.key} className="relative text-[13px]">
                  <span
                    className={`absolute -left-[21px] top-1.5 h-2 w-2 rounded-full ${
                      done ? "bg-accent" : current ? "animate-pulse bg-accent" : "bg-border"
                    }`}
                  />
                  <span className={done || current ? "text-[var(--text)]" : "text-muted"}>
                    {step.label}
                    {current && (
                      <span className="ml-2 inline-block h-3 w-3 animate-spin rounded-full border border-border border-t-accent align-middle" />
                    )}
                    {done && <span className="ml-2 text-accent">✓</span>}
                  </span>
                </li>
              );
            })}
          </ol>
        )}

        {status && (err || status.toLowerCase().includes("verified")) && (
          <p className={`mb-3 text-[12px] ${err ? "text-red-400" : "text-accent"}`}>{status}</p>
        )}

        <div className="flex gap-2.5">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl border border-border py-2.5 text-[13px] font-medium text-muted transition hover:bg-border/40"
          >
            Cancel
          </button>
          <button
            disabled={loading}
            onClick={() => onSubmit?.(txHash, eventType, invoiceId)}
            className="flex-1 rounded-xl bg-accent py-2.5 text-[13px] font-semibold text-white transition hover:bg-accent-dim disabled:opacity-50"
          >
            {loading ? "Working…" : "Verify & Record"}
          </button>
        </div>
      </div>
    </div>
  );
}

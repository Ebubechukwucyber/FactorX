"use client";

import { useState } from "react";

interface Props {
  onClose: () => void;
  onSubmit?: (txHash: string, eventType: number, invoiceId: string) => void;
  loading?: boolean;
  status?: string;
}

const STEPS = [
  { key: "fetch", label: "Read Sepolia payment" },
  { key: "wait", label: "Wait for Attestcoin height" },
  { key: "proof", label: "Build Merkle + continuity proof" },
  { key: "pre", label: "Verify on BlockProver" },
  { key: "sign", label: "Sign verifyAndRecord" },
  { key: "done", label: "Score + passport updated" },
];

function stepIndex(status: string, loading: boolean): number {
  const s = (status || "").toLowerCase();
  if (!loading && !s) return -1;
  if (s.includes("verified & recorded") || s.includes("recorded")) return 5;
  if (s.includes("confirm") || s.includes("recording") || s.includes("factorx")) return 4;
  if (s.includes("precompile") || s.includes("verifysingle")) return 3;
  if (s.includes("proof fetched") || s.includes("proof")) return 2;
  if (s.includes("attestation") || s.includes("wait") || s.includes("attested")) return 1;
  if (s.includes("fetch") || s.includes("working") || loading) return 0;
  return loading ? 0 : -1;
}

export default function SubmitProof({ onClose, onSubmit, loading, status }: Props) {
  const [txHash, setTxHash] = useState("");
  const [eventType, setEventType] = useState(0);
  const [invoiceId, setInvoiceId] = useState("");
  const active = stepIndex(status || "", !!loading);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-card">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-[15px] font-semibold text-[var(--text)]">Submit payment proof</h2>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-lg px-2 py-1 text-muted hover:text-[var(--text)] disabled:opacity-40"
          >
            ✕
          </button>
        </div>

        <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-muted">
          Sepolia tx hash
        </label>
        <input
          type="text"
          placeholder="0x…"
          value={txHash}
          disabled={loading}
          onChange={(e) => setTxHash(e.target.value)}
          className="mb-3 w-full rounded-xl border border-border bg-bg px-3.5 py-2.5 font-mono text-[13px] text-[var(--text)] focus:border-accent/50 focus:outline-none disabled:opacity-60"
        />

        <div className="mb-3 grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-muted">
              Event
            </label>
            <select
              value={eventType}
              disabled={loading}
              onChange={(e) => setEventType(Number(e.target.value))}
              className="w-full rounded-xl border border-border bg-bg px-3 py-2.5 text-[13px] text-[var(--text)]"
            >
              <option value={0}>ERC-20 Transfer</option>
              <option value={1}>InvoicePaid</option>
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-muted">
              Invoice
            </label>
            <input
              type="text"
              placeholder="INV-1042"
              value={invoiceId}
              disabled={loading}
              onChange={(e) => setInvoiceId(e.target.value)}
              className="w-full rounded-xl border border-border bg-bg px-3 py-2.5 font-mono text-[13px] text-[var(--text)]"
            />
          </div>
        </div>

        {active >= 0 && (
          <ol className="mb-4 space-y-2 rounded-xl border border-border bg-bg px-3 py-3">
            {STEPS.map((step, i) => {
              const done = i < active;
              const now = i === active;
              return (
                <li key={step.key} className="flex items-center gap-2.5 text-[12px]">
                  <span
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] ${
                      done
                        ? "bg-accent text-white"
                        : now
                          ? "border border-accent text-accent"
                          : "border border-border text-muted"
                    }`}
                  >
                    {done ? "✓" : i + 1}
                  </span>
                  <span className={now ? "font-medium text-[var(--text)]" : "text-muted"}>
                    {step.label}
                    {now ? "…" : ""}
                  </span>
                </li>
              );
            })}
          </ol>
        )}

        {status &&
          (status.toLowerCase().includes("already") ||
            status.toLowerCase().includes("verified & recorded")) && (
          <p
            className={`mb-3 text-[12px] leading-relaxed ${
              status.toLowerCase().includes("already") ? "text-red-400" : "text-accent"
            }`}
          >
            {status}
          </p>
        )}

        <div className="flex gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex-1 rounded-xl border border-border py-2.5 text-[13px] disabled:opacity-40"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={loading || !txHash.startsWith("0x")}
            onClick={() => onSubmit?.(txHash.trim(), eventType, invoiceId)}
            className="flex-1 rounded-xl bg-accent py-2.5 text-[13px] font-semibold text-white disabled:opacity-50"
          >
            {loading ? "Working…" : "Verify"}
          </button>
        </div>
      </div>
    </div>
  );
}

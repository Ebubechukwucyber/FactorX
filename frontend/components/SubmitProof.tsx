"use client";

import { useState } from "react";

interface Props {
  onClose: () => void;
  onSubmit?: (txHash: string, eventType: number) => void;
  loading?: boolean;
}

export default function SubmitProof({ onClose, onSubmit, loading }: Props) {
  const [txHash, setTxHash] = useState("");
  const [eventType, setEventType] = useState(0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-card">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-[15px] font-semibold text-[var(--text)]">
            Submit Payment Proof
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg px-2 py-1 text-muted transition hover:bg-border hover:text-[var(--text)]"
          >
            ✕
          </button>
        </div>

        <p className="mb-5 text-[13px] leading-relaxed text-muted">
          Paste a Sepolia payment tx hash. Creditcoin will call BlockProver 0x0FD2
          (chainKey 1). Payer must not be your own wallet.
        </p>

        <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-muted">
          Transaction Hash
        </label>
        <input
          type="text"
          placeholder="0x… Sepolia tx hash"
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
          className="mb-6 w-full rounded-xl border border-border bg-bg px-3.5 py-2.5 text-[13px] text-[var(--text)] focus:border-accent/50 focus:outline-none"
        >
          <option value={0}>ERC-20 Transfer</option>
          <option value={1}>InvoicePaid</option>
        </select>

        <div className="flex gap-2.5">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl border border-border py-2.5 text-[13px] font-medium text-muted transition hover:bg-border/40"
          >
            Cancel
          </button>
          <button
            disabled={loading}
            onClick={() => onSubmit?.(txHash, eventType)}
            className="flex-1 rounded-xl bg-accent py-2.5 text-[13px] font-semibold text-white transition hover:bg-accent-dim disabled:opacity-50"
          >
            {loading ? "Working…" : "Verify & Record"}
          </button>
        </div>
      </div>
    </div>
  );
}

interface Props {
  available: number;
  onRequest: () => void;
}

export default function CreditCard({ available, onRequest }: Props) {
  return (
    <div className="flex h-full flex-col rounded-2xl border border-border bg-card p-5 shadow-card">
      <div className="mb-3 flex items-center gap-2 text-muted">
        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z"
          />
        </svg>
        <span className="text-[11px] font-medium uppercase tracking-wider">Available Credit</span>
      </div>

      <p className="tabular text-[28px] font-bold tracking-tight text-[var(--text)]">
        ${available.toLocaleString()}
      </p>
      <p className="mt-1.5 text-[12px] leading-relaxed text-muted">
        Based on verified commercial cashflow.
      </p>

      <button
        onClick={onRequest}
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-accent py-2.5 text-[13px] font-semibold text-white transition hover:bg-accent-dim active:scale-[0.98]"
      >
        Request Advance
      </button>

      <p className="mt-4 text-[11px] leading-relaxed text-muted">
        Limit is calculated from passport strength and recent verified volume.
      </p>
    </div>
  );
}

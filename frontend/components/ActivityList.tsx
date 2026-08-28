interface Activity {
  id: number;
  from: string;
  amount: string;
  invoice: string;
  date: string;
  verified: boolean;
}

interface Props {
  items: Activity[];
  loading?: boolean;
}

export default function ActivityList({ items, loading }: Props) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-[13px] font-semibold text-[var(--text)]">Recent Activity</h3>
        {loading ? (
          <span className="text-[11px] text-muted">Loading…</span>
        ) : (
          <span className="text-[11px] text-muted">On-chain</span>
        )}
      </div>

      {loading ? (
        <div className="flex items-center gap-2 py-8 text-[13px] text-muted">
          <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-border border-t-accent" />
          Reading receivables…
        </div>
      ) : (
        <ul className="space-y-0">
          {items.map((item, i) => (
            <li
              key={item.id}
              className={`flex items-start justify-between gap-3 py-3 ${
                i !== items.length - 1 ? "border-b border-border-subtle" : ""
              }`}
            >
              <div className="flex items-start gap-2.5">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--accent-soft)] text-accent">
                  <svg className="h-2.5 w-2.5" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                      clipRule="evenodd"
                    />
                  </svg>
                </span>
                <div>
                  <p className="text-[13px] font-medium text-[var(--text)]">{item.from}</p>
                  <p className="text-[11px] text-muted">{item.invoice} · Verified</p>
                </div>
              </div>
              <div className="text-right">
                <p className="tabular text-[13px] font-medium text-[var(--text)]">{item.amount}</p>
                <p className="text-[11px] text-muted">{item.date}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

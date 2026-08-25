interface Props {
  payments: number;
  volume: string;
  counterparties: number;
}

export default function StatsRow({ payments, volume, counterparties }: Props) {
  const items = [
    { label: "Payments", value: String(payments) },
    { label: "Volume", value: volume },
    { label: "Counterparties", value: String(counterparties) },
  ];

  return (
    <div className="grid grid-cols-3 gap-2.5">
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-xl border border-border bg-card px-3 py-3 text-center shadow-soft"
        >
          <p className="text-[10px] font-medium uppercase tracking-wider text-muted">
            {item.label}
          </p>
          <p className="mt-1 tabular text-[15px] font-semibold text-[var(--text)]">
            {item.value}
          </p>
        </div>
      ))}
    </div>
  );
}

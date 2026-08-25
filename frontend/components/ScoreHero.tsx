interface Props {
  score: number;
}

export default function ScoreHero({ score }: Props) {
  const risk =
    score >= 700 ? "Good · Low Risk" : score >= 500 ? "Fair · Medium Risk" : "Building";

  const pct = Math.min((score / 950) * 100, 100);
  const r = 58;
  const c = 2 * Math.PI * r;
  const offset = c - (pct / 100) * c;

  return (
    <div className="flex flex-col items-center rounded-2xl border border-border bg-card px-6 py-9 shadow-card">
      <p className="mb-5 text-[11px] font-medium uppercase tracking-[0.14em] text-muted">
        Passport Credit Score
      </p>

      <div className="relative flex h-[168px] w-[168px] items-center justify-center">
        <svg className="absolute inset-0 -rotate-90" viewBox="0 0 140 140">
          <circle
            cx="70"
            cy="70"
            r={r}
            fill="none"
            stroke="var(--ring-track)"
            strokeWidth="7"
          />
          <circle
            cx="70"
            cy="70"
            r={r}
            fill="none"
            stroke="var(--accent)"
            strokeWidth="7"
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={offset}
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <span className="tabular text-[52px] font-bold leading-none tracking-tight text-[var(--score)]">
          {score}
        </span>
      </div>

      <div className="mt-5 flex items-center gap-1.5 rounded-full bg-[var(--accent-soft)] px-3 py-1">
        <svg className="h-3 w-3 text-accent" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
            clipRule="evenodd"
          />
        </svg>
        <span className="text-[11px] font-medium text-accent">{risk}</span>
      </div>
    </div>
  );
}

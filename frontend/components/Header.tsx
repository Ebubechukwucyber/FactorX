export default function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-border-subtle bg-bg/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-accent/15">
            <span className="text-sm font-bold tracking-tight text-accent">X</span>
          </div>
          <div className="leading-none">
            <p className="text-[13px] font-semibold tracking-wide text-white">FACTORX</p>
            <p className="text-[10px] text-muted">Commercial Cashflow Passport</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 shadow-soft">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            <span className="font-mono text-[11px] text-muted">0x7a3b…9cE2</span>
          </div>
        </div>
      </div>
    </header>
  );
}

"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import ThemeToggle from "@/components/ThemeToggle";

const LINKS = [
  { href: "/docs", label: "Docs" },
  { href: "/", label: "Brief", file: "/FactorX-Protocol-Brief.pdf" },
  { href: "/explorer", label: "Explorer" },
  { href: "/dashboard", label: "App" },
];

export default function SiteNav({
  right,
  compact,
}: {
  right?: ReactNode;
  compact?: boolean;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [nav, setNav] = useState(false);

  useEffect(() => {
    setOpen(false);
    setNav(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-50 border-b border-border-subtle bg-bg/90 backdrop-blur-md">
      {nav && (
        <div className="absolute inset-x-0 top-0 h-0.5 overflow-hidden">
          <div className="h-full w-1/3 animate-nav-bar bg-accent" />
        </div>
      )}
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
        <Link href="/" className="flex min-w-0 items-center gap-2" onClick={() => setNav(true)}>
          <Image src="/logo.png" alt="FactorX" width={28} height={28} className="h-7 w-7 shrink-0 object-contain" priority />
          <span className="truncate text-[14px] font-semibold">FactorX</span>
        </Link>

        <nav className="hidden items-center gap-5 md:flex">
          <Link href="/docs" onClick={() => setNav(true)} className="text-[13px] text-muted hover:text-[var(--text)]">Docs</Link>
          <a href="/FactorX-Protocol-Brief.pdf" className="text-[13px] text-muted hover:text-[var(--text)]">Brief</a>
          <Link href="/explorer" onClick={() => setNav(true)} className="text-[13px] text-muted hover:text-[var(--text)]">Explorer</Link>
        </nav>

        <div className="flex items-center gap-2">
          {nav && (
            <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-border border-t-accent md:hidden" />
          )}
          <ThemeToggle />
          <div className="hidden sm:block">{right}</div>
          <button
            type="button"
            aria-label="Menu"
            onClick={() => setOpen((v) => !v)}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-border md:hidden"
          >
            <span className="flex flex-col gap-1.5">
              <i className={`block h-px w-4 bg-[var(--text)] transition ${open ? "translate-y-[3.5px] rotate-45" : ""}`} />
              <i className={`block h-px w-4 bg-[var(--text)] transition ${open ? "opacity-0" : ""}`} />
              <i className={`block h-px w-4 bg-[var(--text)] transition ${open ? "-translate-y-[3.5px] -rotate-45" : ""}`} />
            </span>
          </button>
          <div className="hidden md:block">{!compact && !right ? (
            <Link href="/dashboard" onClick={() => setNav(true)} className="btn-primary btn-small">Open App</Link>
          ) : null}</div>
        </div>
      </div>

      {open && (
        <div className="border-t border-border bg-card px-4 py-3 md:hidden">
          <Link href="/docs" className="block py-2.5 text-[14px]" onClick={() => setNav(true)}>Documentation</Link>
          <a href="/FactorX-Protocol-Brief.pdf" className="block py-2.5 text-[14px]">Protocol brief</a>
          <Link href="/explorer" className="block py-2.5 text-[14px]" onClick={() => setNav(true)}>Explorer</Link>
          <Link href="/dashboard" className="block py-2.5 text-[14px]" onClick={() => setNav(true)}>Dashboard</Link>
          <div className="pt-2 sm:hidden">{right}</div>
        </div>
      )}
    </header>
  );
}

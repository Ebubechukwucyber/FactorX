"use client";

import Link from "next/link";
import Image from "next/image";
import SiteNav from "@/components/SiteNav";

type IconProps = { className?: string };
function Icon({ type, className = "h-5 w-5" }: { type: string } & IconProps) {
  const paths: Record<string, React.ReactNode> = {
    shield: <><path d="M12 3 4.5 6v5.2c0 4.6 3.1 8.8 7.5 9.8 4.4-1 7.5-5.2 7.5-9.8V6L12 3Z"/><path d="m8.8 12 2.1 2.1 4.4-4.5"/></>,
    chart: <><path d="M4 19V5"/><path d="M4 19h16"/><path d="m7 15 4-4 3 2 5-6"/></>,
    wallet: <><path d="M4 7.5A2.5 2.5 0 0 1 6.5 5H18a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6.5A2.5 2.5 0 0 1 4 16.5v-9Z"/><path d="M4 8h13"/><path d="M16 13h4"/></>,
    link: <><path d="M10 13.5 8.5 15a3 3 0 1 1-4.2-4.2l3-3a3 3 0 0 1 4.2 0"/><path d="m14 10.5 1.5-1.5a3 3 0 1 1 4.2 4.2l-3 3a3 3 0 0 1-4.2 0"/><path d="m9.5 14.5 5-5"/></>,
    file: <><path d="M6 3h8l4 4v14H6z"/><path d="M14 3v5h5"/><path d="M9 14h6"/></>,
    scale: <><path d="M12 4v16"/><path d="M5 8h14"/><path d="m6 8-3 6h6l-3-6Zm12 0-3 6h6l-3-6Z"/></>,
    network: <><circle cx="12" cy="5" r="2"/><circle cx="5" cy="18" r="2"/><circle cx="19" cy="18" r="2"/><path d="m10.5 6.5-4 9M13.5 6.5l4 9M7 18h10"/></>,
    badge: <><circle cx="12" cy="10" r="5"/><path d="m8.5 14-1 7 4.5-2.5 4.5 2.5-1-7"/><path d="m10 10 1.3 1.3L14 8.8"/></>,
    gauge: <><path d="M5 18a7 7 0 1 1 14 0"/><path d="m12 12 3-3"/><path d="M4 20h16"/></>,
    receipt: <><path d="M7 3h10v18l-2-1.5L12 21l-3-1.5L7 21V3Z"/><path d="M10 8h4M10 12h4"/></>,
    bank: <><path d="m3 10 9-6 9 6"/><path d="M5 10v7M9 10v7M15 10v7M19 10v7"/><path d="M3 21h18"/></>,
  };
  return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">{paths[type]}</svg>;
}

const IconBox = ({ type }: { type: string }) => <div className="icon-box"><Icon type={type} /></div>;

function PassportPreview() {
  return <div className="passport-shell animate-fade-up delay-2">
    <div className="passport-card">
      <div className="flex items-start justify-between"><div><p className="eyebrow">FACTORX PASSPORT</p><p className="mt-1 text-xs text-muted">Commercial Cashflow Profile</p></div><Icon type="badge" className="h-6 w-6 text-accent" /></div>
      <div className="mt-8"><p className="text-xs text-muted">Commercial score</p><div className="mt-1 flex items-end gap-3"><span className="text-5xl font-bold tracking-tight">742</span><span className="mb-1 rounded-full bg-[var(--accent-soft)] px-2.5 py-1 text-xs font-semibold text-accent">Strong</span></div><div className="score-track mt-4"><span /></div></div>
      <div className="mt-7 grid grid-cols-3 gap-3 border-t border-border pt-5 text-center"><div><p className="metric-value">$48.2k</p><p className="metric-label">Verified volume</p></div><div><p className="metric-value">12</p><p className="metric-label">Payments</p></div><div><p className="metric-value">94%</p><p className="metric-label">Reliability</p></div></div>
    </div>
  </div>;
}

export default function LandingPage() {
  const metrics = [
    { icon: "gauge", label: "Passport score", value: "742", sub: "Strong · Low risk" },
    { icon: "wallet", label: "Potential working capital", value: "$12.4k", sub: "Based on verified cashflow" },
    { icon: "shield", label: "Verified payments", value: "12", sub: "Cryptographically attested" },
  ];
  return <div className="min-h-screen bg-bg text-[var(--text)]">
    <SiteNav />

    <main>
      <section className="hero relative overflow-hidden"><div className="hero-glow hero-glow-one"/><div className="hero-glow hero-glow-two"/><div className="relative mx-auto grid max-w-6xl items-center gap-14 px-6 py-24 md:grid-cols-[1.05fr_.95fr] md:py-32"><div className="animate-fade-up"><div className="protocol-pill"><span className="status-dot"/> Attestcoin Protocol <span className="opacity-50">·</span> Creditcoin</div><h1 className="hero-title mt-6">Verified commercial payments become <span>portable financial reputation.</span></h1><p className="hero-copy">Agencies and exporters get paid on-chain. Banks still see a blank file. FactorX turns those verified invoices into a passport a lender can read on Creditcoin.</p><div className="mt-8 flex flex-wrap gap-3"><Link href="/dashboard" className="btn-primary">Launch Passport</Link><Link href="/docs" className="btn-secondary">Documentation</Link><a href="/FactorX-Protocol-Deck.pdf" className="btn-secondary">Protocol deck</a></div><div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-xs text-muted"><span>Verified payments</span><span>Living score</span><span>Portable identity</span></div></div><PassportPreview /></div></section>

      <section className="relative z-10 mx-auto max-w-6xl px-6 pb-24"><div className="metrics-card grid overflow-hidden rounded-3xl border border-border bg-card shadow-card md:grid-cols-3">{metrics.map((m,i)=><div key={m.label} className={`metric-item ${i>0?"md:border-l md:border-border":""}`}><div className="flex items-center gap-2 text-muted"><Icon type={m.icon} className="h-4 w-4 text-accent"/><p className="text-[11px] font-semibold uppercase tracking-[0.12em]">{m.label}</p></div><p className="mt-4 text-3xl font-bold tracking-tight">{m.value}</p><p className="mt-1 text-[12px] text-muted">{m.sub}</p></div>)}</div></section>

      <section className="section-tint border-y border-border-subtle"><div className="mx-auto max-w-6xl px-6 py-24"><p className="section-kicker">The problem</p><div className="mt-3 grid gap-8 md:grid-cols-[.85fr_1.15fr] md:items-end"><h2 className="section-title">Real commercial activity still doesn't translate into access.</h2><p className="section-copy">Businesses can have genuine payment history and recurring customers yet remain financially invisible to the systems that determine access to credit.</p></div><div className="mt-12 grid gap-5 md:grid-cols-3">{[{icon:"file",title:"Thin files ignored",body:"Banks want years of statements. Freelancers and SMEs can get paid every month and still remain difficult to underwrite."},{icon:"scale",title:"Over-collateralized access",body:"Most DeFi lending still requires more collateral than the loan. Proven cashflow is rarely part of the equation."},{icon:"network",title:"Fragmented commercial identity",body:"Payment history is scattered across transactions and apps instead of becoming a continuous, portable reputation."}].map(c=><article key={c.title} className="premium-card"><IconBox type={c.icon}/><h3>{c.title}</h3><p>{c.body}</p></article>)}</div></div></section>

      <section className="mx-auto max-w-6xl px-6 py-24"><div className="text-center"><p className="section-kicker">How it works</p><h2 className="section-title mx-auto mt-3 max-w-xl">From payment to portable passport.</h2></div><div className="process-grid relative mt-14 grid gap-6 md:grid-cols-3">{[{n:"01",icon:"receipt",title:"Commercial payment occurs",body:"A client settles an invoice or transfer on a supported chain. The transaction becomes the starting point."},{n:"02",icon:"shield",title:"Attestcoin proves it",body:"The proof verifies payment success and relevant transaction data without relying on a bank or manual paperwork."},{n:"03",icon:"badge",title:"Your passport updates",body:"FactorX updates the living profile, creating portable reputation that other protocols can read."}].map(s=><article key={s.n} className="process-card"><div className="process-number">{s.n}</div><IconBox type={s.icon}/><h3>{s.title}</h3><p>{s.body}</p></article>)}</div></section>

      <section className="section-tint border-y border-border-subtle"><div className="mx-auto max-w-6xl px-6 py-24"><div className="text-center"><p className="section-kicker">Product</p><h2 className="section-title mx-auto mt-3 max-w-xl">What the passport unlocks.</h2></div><div className="mt-14 grid gap-5 md:grid-cols-3"><article className="feature-featured md:col-span-2"><div className="flex items-start justify-between"><IconBox type="gauge"/><span className="text-xs font-semibold text-accent">LIVING PROFILE</span></div><h3>Living commercial score</h3><p>Built from frequency, volume, counterparties and recency of verified payments — not a single deposit or isolated transaction.</p><div className="mini-score"><div><span>Payment frequency</span><b>↑</b></div><div><span>Verified volume</span><b>↑</b></div><div><span>Counterparty history</span><b>↑</b></div><div><span>Recency</span><b>↑</b></div></div></article>{[{icon:"bank",title:"Working-capital advances",body:"Request advances through FactorCredit as verified commercial history grows."},{icon:"network",title:"Composable identity",body:"Protocols can read the passport and tailor terms to verified activity."},{icon:"badge",title:"Soulbound passport",body:"A non-transferable on-chain identity representing commercial cashflow history."}].map(f=><article key={f.title} className="premium-card compact-card"><IconBox type={f.icon}/><h3>{f.title}</h3><p>{f.body}</p></article>)}</div></div></section>

      <section className="mx-auto max-w-6xl px-6 py-24"><div className="trust-card"><div className="trust-intro"><IconBox type="shield"/><div><p className="section-kicker">Verification model</p><h2 className="mt-2 text-2xl font-bold tracking-tight">Reputation begins with a verifiable payment.</h2><p className="mt-3 max-w-lg text-sm leading-relaxed text-muted">Every meaningful FactorX passport update follows the same auditable path from commercial activity to cryptographic proof to portable reputation.</p></div></div><div className="trust-flow"><div><Icon type="receipt"/><span>Commercial payment</span></div><i>→</i><div><Icon type="shield"/><span>Attestcoin proof</span></div><i>→</i><div><Icon type="badge"/><span>Creditcoin passport</span></div></div></div></section>

      <section className="mx-auto max-w-6xl px-6 pb-8">
        <p className="section-kicker">Who it is for</p>
        <h2 className="section-title mt-3 max-w-2xl">Cashflow the bank cannot see. Credit a lender can read.</h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">Built first for digital studios, freelancers, and exporters who collect USDC or ETH from abroad and still cannot borrow against that trail.</p>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <article className="premium-card compact-card">
            <p className="text-[11px] font-medium uppercase tracking-wider text-muted">The studio</p>
            <h3 className="mt-2">Get paid. Prove it. Keep the file.</h3>
            <p>Paste a source-chain settlement. Attestcoin attests it. Your score and soulbound passport update. No bank PDF.</p>
          </article>
          <article className="premium-card compact-card">
            <p className="text-[11px] font-medium uppercase tracking-wider text-muted">The lender</p>
            <h3 className="mt-2">Four reads. An offer.</h3>
            <p>Score, volume, counterparties, open advance. MockConsumer already does this live. Your vault would disburse next.</p>
          </article>
          <article className="premium-card compact-card">
            <p className="text-[11px] font-medium uppercase tracking-wider text-muted">The judge</p>
            <h3 className="mt-2">Follow the receipt.</h3>
            <p>Explorer → payment hash → Attestcoin → Creditcoin. Same path a creditor would audit.</p>
          </article>
        </div>
      </section>

      <section className="px-6 pb-24"><div className="cta-panel mx-auto max-w-5xl text-center"><p className="section-kicker">Ready to explore</p><h2 className="mx-auto mt-3 max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl">Build commercial reputation that moves with you.</h2><p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-muted">Open the app. Submit a verified payment. Watch the passport, the score, and the lender offer move.</p><div className="mt-8"><Link href="/dashboard" className="btn-primary">Open Passport Dashboard</Link></div><p className="mt-6 text-xs text-muted">Powered by Attestcoin verification · Recorded on Creditcoin</p></div></section>
    </main>
    <footer className="border-t border-border-subtle py-7 text-center text-[12px] text-muted">FactorX · Creditcoin testnet 102031 · Attestcoin readability · <a href="/docs" className="text-accent hover:underline">Docs</a> · Live contracts</footer>
  </div>;
}

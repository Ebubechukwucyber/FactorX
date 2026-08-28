"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  formatEther,
  keccak256,
  toBytes,
  parseEther,
  type Address,
  type WalletClient,
} from "viem";
import ThemeToggle from "@/components/ThemeToggle";
import ScoreHero from "@/components/ScoreHero";
import CreditCard from "@/components/CreditCard";
import ActivityList from "@/components/ActivityList";
import SubmitProof from "@/components/SubmitProof";
import StatsRow from "@/components/StatsRow";
import { publicClient, connectWallet, connectDemo, errMsg } from "@/lib/chain";
import {
  ADDRESSES,
  scoreAbi,
  registryAbi,
  creditAbi,
  verifierAbi,
  consumerAbi,
} from "@/lib/contracts";

type Activity = {
  id: number;
  from: string;
  amount: string;
  invoice: string;
  date: string;
  verified: boolean;
};

export default function DashboardPage() {
  const [address, setAddress] = useState<Address | null>(null);
  const [walletClient, setWalletClient] = useState<WalletClient | null>(null);
  const [showSubmit, setShowSubmit] = useState(false);
  const [score, setScore] = useState(300);
  const [payments, setPayments] = useState(0);
  const [volumeEth, setVolumeEth] = useState("0");
  const [counterparties, setCounterparties] = useState(0);
  const [availableCredit, setAvailableCredit] = useState(0);
  const [debt, setDebt] = useState(0);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [activities, setActivities] = useState<Activity[]>([]);

  const isConnected = !!address;

  const refresh = useCallback(async () => {
    if (!address) return;
    try {
      const [s, count, vol, unique, avail, recs, debtAmt] = await Promise.all([
        publicClient.readContract({
          address: ADDRESSES.score,
          abi: scoreAbi,
          functionName: "getCommercialScore",
          args: [address],
        }),
        publicClient.readContract({
          address: ADDRESSES.registry,
          abi: registryAbi,
          functionName: "getReceivableCount",
          args: [address],
        }),
        publicClient.readContract({
          address: ADDRESSES.registry,
          abi: registryAbi,
          functionName: "totalVolume",
          args: [address],
        }),
        publicClient.readContract({
          address: ADDRESSES.registry,
          abi: registryAbi,
          functionName: "uniquePayerCount",
          args: [address],
        }),
        publicClient.readContract({
          address: ADDRESSES.credit,
          abi: creditAbi,
          functionName: "getAvailableCredit",
          args: [address],
        }),
        publicClient.readContract({
          address: ADDRESSES.registry,
          abi: registryAbi,
          functionName: "getReceivables",
          args: [address],
        }),
        publicClient.readContract({
          address: ADDRESSES.credit,
          abi: creditAbi,
          functionName: "outstanding",
          args: [address],
        }),
      ]);
      setScore(Number(s));
      setPayments(Number(count));
      setVolumeEth(formatEther(vol as bigint));
      setCounterparties(Number(unique));
      setAvailableCredit(Number(formatEther(avail as bigint)));
      setDebt(Number(formatEther(debtAmt as bigint)));
      const raw = (Array.isArray(recs) ? recs : []) as unknown[];
      const list = raw.map((row) => {
        const r = row as Record<string, unknown> | unknown[];
        if (Array.isArray(r)) {
          return {
            payer: r[0] as Address,
            amount: r[1] as bigint,
            sourceTxHash: r[2] as `0x${string}`,
            timestamp: r[3] as bigint,
          };
        }
        return {
          payer: r.payer as Address,
          amount: r.amount as bigint,
          sourceTxHash: r.sourceTxHash as `0x${string}`,
          timestamp: r.timestamp as bigint,
        };
      });
      const pays = [...list].reverse().map((r, i) => ({
          id: Number(r.timestamp) + i,
          from: r.payer ? `${r.payer.slice(0, 6)}…${r.payer.slice(-4)}` : "payer",
          amount: `${Number(formatEther(r.amount || BigInt(0))).toFixed(4)} ETH`,
          invoice: r.sourceTxHash ? String(r.sourceTxHash).slice(0, 10) : "—",
          date: r.timestamp
            ? new Date(Number(r.timestamp) * 1000).toLocaleString()
            : "",
          verified: true,
        }));
      if (Number(count) > 0) {
        setStatus(`Loaded ${Number(count)} payment(s) for ${address.slice(0, 6)}…${address.slice(-4)}`);
      }
      const advances: typeof pays = [];
      const debtEth = Number(formatEther(debtAmt as bigint));
      if (debtEth > 0) {
        advances.push({
          id: 9_000_001,
          from: "Advance",
          amount: `${debtEth.toFixed(4)} ETH open`,
          invoice: "credit line",
          date: "Outstanding",
          verified: true,
        });
      }
      try {
        const logs = await publicClient.getContractEvents({
          address: ADDRESSES.credit,
          abi: creditAbi,
          eventName: "AdvanceOpened",
          args: { user: address },
          fromBlock: BigInt(5_300_000),
        });
        for (const [i, lg] of logs.entries()) {
          const amt = (lg.args as { amount?: bigint }).amount || BigInt(0);
          advances.push({
            id: 10_000_000 + i,
            from: "Advance opened",
            amount: `${Number(formatEther(amt)).toFixed(4)} ETH`,
            invoice: lg.transactionHash.slice(0, 10),
            date: "Creditcoin",
            verified: true,
          });
        }
      } catch (err) {
        console.warn("advance logs", err);
      }
      setActivities([...advances, ...pays]);
    } catch (e) {
      console.error(e);
      setStatus(e instanceof Error ? e.message : "Contract read failed");
    }
  }, [address]);

  useEffect(() => {
    refresh();
    const t = setInterval(refresh, 8000);
    return () => clearInterval(t);
  }, [refresh]);

  async function onConnect() {
    setStatus("Opening wallet…");
    try {
      const { address: addr, walletClient: wc } = await connectWallet();
      setAddress(addr);
      setWalletClient(wc);
      setStatus(`Connected: ${addr.slice(0, 6)}…${addr.slice(-4)}`);
    } catch (e: unknown) {
      console.error("[FactorX] connect error", e);
      setStatus(errMsg(e));
    }
  }

  async function onDemoConnect() {
    setStatus("Demo Connect disabled on Creditcoin.");
    try {
      const { address: addr, walletClient: wc } = await connectDemo();
      setAddress(addr);
      setWalletClient(wc);
      setStatus(`Demo connected: ${addr.slice(0, 6)}…${addr.slice(-4)}`);
    } catch (e: unknown) {
      console.error("[FactorX] demo connect", e);
      setStatus(errMsg(e));
    }
  }

  function onDisconnect() {
    setAddress(null);
    setWalletClient(null);
    setStatus("");
  }

  async function onSubmitProof(txHash: string, eventType: number) {
    if (!walletClient || !address) {
      setStatus("Connect wallet first");
      return;
    }
    if (!txHash.startsWith("0x") || txHash.length !== 66) {
      setStatus("Paste a real Sepolia tx hash (0x + 64 hex).");
      return;
    }
    setLoading(true);
    setStatus("Fetching Attestcoin proof (wait if the Sepolia block is not attested yet)…");
    try {
      const hash = txHash as `0x${string}`;
      const proofRes = await fetch(`/api/attestcoin/proof?tx=${hash}`);
      const proofJson = await proofRes.json();
      if (!proofRes.ok) {
        setStatus(proofJson.error || "Proof lookup failed");
        setLoading(false);
        return;
      }
      if (proofJson.proofError || !proofJson.proof) {
        setStatus(
          proofJson.proofError ||
            `Sepolia block ${proofJson.blockNumber} found. Wait for attestation, then retry.`
        );
        setLoading(false);
        return;
      }
      if (proofJson.verifiedOnPrecompile === false) {
        setStatus("Attestcoin verifySingle returned false. See dashboard status.");
        setLoading(false);
        return;
      }
      setStatus(
        proofJson.verifiedOnPrecompile
          ? "Attestcoin precompile verified — recording on FactorX…"
          : "Proof fetched — recording on FactorX…"
      );
      if (!proofJson.amountWei || BigInt(proofJson.amountWei) === BigInt(0)) {
        setStatus("Could not read payment amount from the Sepolia tx (value and Transfer logs were 0).");
        setLoading(false);
        return;
      }
      const amount = BigInt(proofJson.amountWei);
      const payer = (proofJson.from ||
        "0x70997970C51812dc3A010C7d01b50e0d17dc79C8") as Address;
      if (payer.toLowerCase() === address.toLowerCase()) {
        setStatus("Payer cannot be your own wallet (self-transfer blocked).");
        setLoading(false);
        return;
      }

      const hashTx = await walletClient.writeContract({
        address: ADDRESSES.verifier,
        abi: verifierAbi,
        functionName: "verifyAndRecord",
        args: ["0x", hash, eventType, address, payer, amount],
        account: address,
        chain: undefined,
      });
      setStatus(`Tx ${hashTx.slice(0, 10)}… confirming`);
      await publicClient.waitForTransactionReceipt({ hash: hashTx });
      /* activity reloads from chain in refresh() */
      setStatus("Payment verified & recorded");
      await refresh();
      setShowSubmit(false);
    } catch (e: unknown) {
      console.error(e);
      setStatus(errMsg(e));
    } finally {
      setLoading(false);
    }
  }

  async function onRequestAdvance() {
    if (!walletClient || !address) {
      setStatus("Connect wallet first");
      return;
    }
    setLoading(true);
    setStatus("Requesting advance…");
    try {
      const hashTx = await walletClient.writeContract({
        address: ADDRESSES.credit,
        abi: creditAbi,
        functionName: "requestAdvance",
        args: [parseEther("1")],
        account: address,
        chain: undefined,
      });
      await publicClient.waitForTransactionReceipt({ hash: hashTx });
      setStatus("Advance opened");
      await refresh();
    } catch (e: unknown) {
      console.error(e);
      setStatus(errMsg(e));
    } finally {
      setLoading(false);
    }
  }

  async function onCheckTerms() {
    if (!walletClient || !address) {
      setStatus("Connect wallet first");
      return;
    }
    setLoading(true);
    try {
      const hashTx = await walletClient.writeContract({
        address: ADDRESSES.consumer,
        abi: consumerAbi,
        functionName: "checkAndOfferTerms",
        args: [address],
        account: address,
        chain: undefined,
      });
      await publicClient.waitForTransactionReceipt({ hash: hashTx });
      const scoreNow = await publicClient.readContract({
        address: ADDRESSES.score,
        abi: scoreAbi,
        functionName: "getCommercialScore",
        args: [address],
      });
      const s = Number(scoreNow);
      setStatus(
        s >= 700
          ? "Premium terms unlocked: 0% collateral, priority queue"
          : s >= 500
            ? "Improved terms: 20% lower collateral"
            : s >= 400
              ? "Standard terms available"
              : "Score too low for improved terms"
      );
    } catch (e: unknown) {
      console.error(e);
      setStatus(errMsg(e));
    } finally {
      setLoading(false);
    }
  }

  const short = address ? `${address.slice(0, 6)}…${address.slice(-4)}` : "";

  return (
    <div className="min-h-screen bg-bg text-[var(--text)]">
      <header className="sticky top-0 z-40 border-b border-border-subtle bg-bg/90 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
          <Link href="/explorer" className="text-[13px] text-muted hover:text-[var(--text)]">Explorer</Link>
        <Link href="/" className="flex items-center gap-2.5">
            <Image src="/logo.png" alt="FactorX" width={28} height={28} className="h-7 w-7 object-contain" priority />
            <div className="leading-none">
              <p className="text-[13px] font-semibold tracking-wide">FactorX</p>
              <p className="text-[10px] text-muted">Commercial Cashflow Passport</p>
            </div>
          </Link>
          <div className="flex items-center gap-2.5">
            <ThemeToggle />
            {isConnected ? (
              <button
                type="button"
                onClick={onDisconnect}
                className="relative z-50 flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-[11px]"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                <span className="font-mono text-muted">{short}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => void onConnect()}
                className="relative z-50 cursor-pointer rounded-full bg-accent px-3.5 py-1.5 text-[12px] font-semibold text-white hover:bg-accent-dim"
              >
                Connect wallet
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">
        <div className="mb-7 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Passport Overview</h1>
            <p className="mt-0.5 text-[13px] text-muted">Live · Creditcoin Testnet 102031</p>
          </div>
          <button
            onClick={() => setShowSubmit(true)}
            disabled={!isConnected || loading}
            className="rounded-xl border border-border bg-card px-3.5 py-2 text-[13px] font-medium transition hover:border-accent/30 disabled:opacity-50"
          >
            + Submit Proof
          </button>
        </div>

        {status && (
          <div className="mb-4 rounded-xl border border-border bg-card px-4 py-2 text-[13px] text-muted">
            {status}
          </div>
        )}

        {!isConnected && (
          <div className="mb-6 rounded-xl border border-accent/30 bg-[var(--accent-soft)] px-4 py-3 text-[13px]">
            Connect MetaMask on Creditcoin Testnet (chain 102031). Use the deployer wallet — it needs tCTC.
          </div>
        )}

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
          <div className="lg:col-span-3">
            <CreditCard available={availableCredit} onRequest={onRequestAdvance} />
          </div>
          <div className="space-y-4 lg:col-span-5">
            <ScoreHero score={score} />
            <StatsRow
              payments={payments}
              volume={`${Number(volumeEth).toFixed(2)} ETH`}
              counterparties={counterparties}
            />
          </div>
          <div className="lg:col-span-4">
            <ActivityList
              items={
                activities.length
                  ? activities
                  : [
                      {
                        id: 0,
                        from: "No payments yet",
                        amount: "—",
                        invoice: "Submit a proof",
                        date: "",
                        verified: false,
                      },
                    ]
              }
            />
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 rounded-2xl border border-border bg-card p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[13px] font-medium">Other protocols can read this passport</p>
            <p className="mt-0.5 text-[12px] text-muted">MockConsumer reads your on-chain score</p>
          </div>
          <button
            onClick={onCheckTerms}
            disabled={!isConnected || loading}
            className="shrink-0 rounded-xl bg-accent px-4 py-2.5 text-[13px] font-semibold text-white disabled:opacity-50"
          >
            Check Better Terms
          </button>
        </div>
      </main>

      {showSubmit && (
        <SubmitProof onClose={() => setShowSubmit(false)} onSubmit={onSubmitProof} loading={loading} />
      )}
    </div>
  );
}

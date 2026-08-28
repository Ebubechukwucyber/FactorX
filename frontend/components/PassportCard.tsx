"use client";

interface Props {
  tokenId: number | null;
  hasPassport: boolean;
}

export default function PassportCard({ tokenId, hasPassport }: Props) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
      <p className="text-[11px] font-medium uppercase tracking-wider text-muted">
        Soulbound passport
      </p>
      {hasPassport && tokenId ? (
        <>
          <p className="mt-2 text-2xl font-semibold">FXPASS #{tokenId}</p>
          <p className="mt-1 text-[13px] text-muted">
            Non-transferable commercial identity on Creditcoin.
          </p>
          <a
            className="mt-3 inline-block text-[12px] text-accent hover:underline"
            href={`https://creditcoin-testnet.blockscout.com/token/0xa1C6E03E9d0aa5610a9098d723BDA6241C2daCC1/instance/${tokenId}`}
            target="_blank"
            rel="noreferrer"
          >
            View on Blockscout
          </a>
        </>
      ) : (
        <p className="mt-2 text-[13px] text-muted">
          Minted automatically on your first verified payment.
        </p>
      )}
    </div>
  );
}

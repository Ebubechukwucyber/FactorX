import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

const SEPOLIA_RPC =
  process.env.SEPOLIA_RPC_URL || "https://ethereum-sepolia-rpc.publicnode.com";
const CREDITCOIN_RPC = "https://rpc.cc3-testnet.creditcoin.network";
const PROOF_BUILDER = "https://prover.cc3-testnet.creditcoin.network";
const CHAIN_KEY = 1;

export async function GET(req: NextRequest) {
  const tx = req.nextUrl.searchParams.get("tx");
  if (!tx || !tx.startsWith("0x") || tx.length !== 66) {
    return NextResponse.json({ error: "Need a Sepolia tx hash (0x + 64 hex)" }, { status: 400 });
  }

  try {
    const receiptRes = await fetch(SEPOLIA_RPC, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "eth_getTransactionReceipt",
        params: [tx],
      }),
    });
    const receiptJson = await receiptRes.json();
    const receipt = receiptJson.result;
    if (!receipt) {
      return NextResponse.json({ error: "Sepolia tx not found" }, { status: 404 });
    }

    const blockNumber = parseInt(receipt.blockNumber, 16);
    if (receipt.status !== "0x1") {
      return NextResponse.json({ error: "Source tx reverted on Sepolia" }, { status: 400 });
    }

    const txRes = await fetch(SEPOLIA_RPC, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 2,
        method: "eth_getTransactionByHash",
        params: [tx],
      }),
    });
    const txObj = (await txRes.json()).result || {};
    let amountWei = BigInt(txObj.value || "0x0");
    const TRANSFER =
      "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";
    for (const log of receipt.logs || []) {
      if ((log.topics?.[0] || "").toLowerCase() === TRANSFER && log.data && log.data !== "0x") {
        try {
          const v = BigInt(log.data);
          if (v > amountWei) amountWei = v;
        } catch {
          /* ignore */
        }
      }
    }

    let proof: unknown = null;
    let verifiedOnPrecompile: boolean | null = null;
    let proofError: string | null = null;

    try {
      const sdk = await import("@gluwa/usc-sdk");
      const { JsonRpcProvider } = await import("ethers");
      const creditcoin = new JsonRpcProvider(CREDITCOIN_RPC);
      const chainInfo = (sdk as { chainInfo: any }).chainInfo;
      const proofProvider = (sdk as { proofProvider: any }).proofProvider;
      const blockProver = (sdk as { blockProver: any }).blockProver;

      const info = new chainInfo.PrecompileChainInfoProvider(creditcoin);
      await info.waitUntilHeightAttested(CHAIN_KEY, blockNumber, undefined, 180_000);

      const builder = new proofProvider.service.ProofBuilder(CHAIN_KEY, PROOF_BUILDER, 30_000);
      const result = await builder.getProof(tx);
      if (!result.success || !result.data) {
        proofError = String(result.error || "Proof Builder empty");
      } else {
        proof = result.data;
        try {
          const prover = new blockProver.PrecompileBlockProver(creditcoin);
          verifiedOnPrecompile = Boolean(
            await prover.verifySingle(
              result.data.chainKey,
              result.data.headerNumber,
              result.data.txBytes,
              result.data.merkleProof,
              result.data.continuityProof
            )
          );
        } catch (ve: unknown) {
          verifiedOnPrecompile = false;
          proofError = ve instanceof Error ? ve.message : "verifySingle failed";
        }
      }
    } catch (e: unknown) {
      proofError = e instanceof Error ? e.message : "SDK / attestation wait failed";
    }

    return NextResponse.json({
      chainKey: CHAIN_KEY,
      txHash: tx,
      blockNumber,
      from: txObj.from || receipt.from,
      to: txObj.to || receipt.to,
      amountWei: amountWei.toString(),
      proof,
      verifiedOnPrecompile,
      proofError,
      dashboard: "https://dashboard.cc3-testnet.creditcoin.network/",
    });
  } catch (e: unknown) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "lookup failed" },
      { status: 500 }
    );
  }
}

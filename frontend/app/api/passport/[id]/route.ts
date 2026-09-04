import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  ctx: { params: { id: string } }
) {
  const id = String(ctx.params?.id || "0").replace(/[^0-9]/g, "") || "0";
  return NextResponse.json({
    name: `FXPASS #${id}`,
    description:
      "FactorX soulbound commercial cashflow passport on Creditcoin. Non-transferable.",
    image: "https://factorx.vercel.app/logo.png",
    attributes: [
      { trait_type: "Token ID", value: id },
      { trait_type: "Type", value: "Soulbound" },
    ],
  });
}

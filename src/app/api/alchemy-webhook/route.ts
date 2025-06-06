import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { broadcastTx } from "@/lib/sse";

const ALCHEMY_WEBHOOK_KEY = process.env.ALCHEMY_WEBHOOK_KEY!;

export async function POST(req: NextRequest) {
  const signature = req.headers.get("x-alchemy-signature");
  const bodyText = await req.text();

  const calculatedSignature = crypto
    .createHmac("sha256", ALCHEMY_WEBHOOK_KEY)
    .update(bodyText, "utf8")
    .digest("hex");

  if (signature !== calculatedSignature) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const body = JSON.parse(bodyText);
  const tx = body?.event?.transaction;

  if (tx) {
    broadcastTx(tx);
  }

  return NextResponse.json({ success: true });
}

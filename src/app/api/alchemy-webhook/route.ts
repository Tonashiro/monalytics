import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { broadcastTx } from "@/lib/sse";

const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY!;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const transactions: any[] = [];

export async function POST(req: NextRequest) {
  const signature = req.headers.get("x-alchemy-signature");
  const bodyText = await req.text();

  const calculatedSignature = crypto
    .createHmac("sha256", ALCHEMY_API_KEY)
    .update(bodyText, "utf8")
    .digest("hex");

  if (signature !== calculatedSignature) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const body = JSON.parse(bodyText);
  const tx = body?.event?.transaction;

  if (tx) {
    transactions.unshift(tx);
    transactions.splice(100);

    broadcastTx(tx); // 🔥 Broadcast to SSE clients
  }

  return NextResponse.json({ success: true });
}

export function GET() {
  return NextResponse.json({ transactions });
}

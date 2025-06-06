import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

// 🔐 Set this in your .env.local
const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY as string;

// Simple in-memory store for now
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
    transactions.unshift(tx); // Add to the beginning of the list
    transactions.splice(100); // Keep only last 100
  }

  return NextResponse.json({ success: true });
}

// ⬅️ This is important to make data accessible from frontend
export function GET() {
  return NextResponse.json({ transactions });
}

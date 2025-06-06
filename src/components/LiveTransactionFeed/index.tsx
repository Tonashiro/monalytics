"use client";

import { useTransactionStream } from "@/hooks/useTransactionStream";

export function LiveTransactionFeed() {
  const txs = useTransactionStream();

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">📡 Live Monad Transactions</h2>
      <ul className="space-y-2">
        {txs.map((tx) => (
          <li key={tx.hash} className="bg-white border p-4 rounded shadow">
            <div>
              <strong>Hash:</strong> {tx.hash.slice(0, 20)}...
            </div>
            <div>
              <strong>From:</strong> {tx.from}
            </div>
            <div>
              <strong>To:</strong> {tx.to}
            </div>
            <div>
              <strong>Value:</strong> {tx.value}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

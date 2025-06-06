/* eslint-disable @typescript-eslint/no-explicit-any */
export default async function Home() {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/alchemy-webhook`,
    {
      cache: "no-store",
    }
  );
  const data = await res.json();

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">📦 Latest Monad Transactions</h1>
      <ul className="space-y-2">
        {data.transactions.map((tx: any) => (
          <li key={tx.hash} className="border p-4 rounded bg-white shadow">
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
    </main>
  );
}

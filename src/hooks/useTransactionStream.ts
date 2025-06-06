import { useEffect, useState } from "react";

export const useTransactionStream = () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [txs, setTxs] = useState<any[]>([]);

  useEffect(() => {
    const source = new EventSource("/api/tx-stream");

    source.onmessage = (e) => {
      const tx = JSON.parse(e.data);
      console.log("🟢 Received TX via SSE:", tx);
      setTxs((prev) => [tx, ...prev]);
    };

    return () => source.close();
  }, []);

  return txs;
};

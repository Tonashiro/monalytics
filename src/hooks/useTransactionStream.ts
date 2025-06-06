import { useEffect, useState, useRef } from "react";

interface Transaction {
  hash: string;
  from: string;
  to: string;
  value: string;
}

export const useTransactionStream = () => {
  const [txs, setTxs] = useState<Transaction[]>([]);
  const [error, setError] = useState<string | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;

  const connect = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const eventSource = new EventSource("/api/tx-stream");
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      setError(null);
      reconnectAttemptsRef.current = 0;
    };

    eventSource.onmessage = (e) => {
      try {
        const tx: Transaction = JSON.parse(e.data);
        console.log("🟢 Received TX via SSE:", tx);
        setTxs((prev) => [tx, ...prev]);
      } catch (err) {
        console.error("Failed to parse message:", err);
      }
    };

    eventSource.onerror = () => {
      setError("Connection lost, attempting to reconnect...");
      eventSource.close();
      handleReconnect();
    };
  };

  const handleReconnect = () => {
    if (reconnectAttemptsRef.current < maxReconnectAttempts) {
      const retryTimeout = 1000 * Math.pow(2, reconnectAttemptsRef.current); // Exponential backoff
      setTimeout(() => {
        reconnectAttemptsRef.current += 1;
        connect();
      }, retryTimeout);
    } else {
      setError("Maximum reconnect attempts reached.");
    }
  };

  useEffect(() => {
    connect();

    return () => {
      eventSourceRef.current?.close(); // Clean up connection on unmount
    };
  }, [connect]);

  return { txs, error };
};

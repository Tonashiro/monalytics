type Client = {
  id: string;
  write: (msg: string) => void;
};

const clients: Client[] = [];

export function addClient(id: string, write: (msg: string) => void) {
  clients.push({ id, write });
}

export function removeClient(id: string) {
  const index = clients.findIndex((c) => c.id === id);
  if (index !== -1) clients.splice(index, 1);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function broadcastTx(tx: any) {
  const data = `data: ${JSON.stringify(tx)}\n\n`;
  for (const client of clients) {
    try {
      client.write(data);
    } catch (e) {
      console.error("Failed to send to client:", e);
    }
  }
}

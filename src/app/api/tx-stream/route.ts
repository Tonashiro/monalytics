import { nanoid } from "nanoid";
import { addClient, removeClient } from "@/lib/sse";

export async function GET(): Promise<Response> {
  const stream = new TransformStream();
  const writer = stream.writable.getWriter();
  const encoder = new TextEncoder();
  const id = nanoid();

  const write = (msg: string) => {
    writer.write(encoder.encode(msg));
  };

  addClient(id, write);

  // Keep-alive every 15s
  const keepAlive = setInterval(() => {
    write(`: keep-alive\n\n`);
  }, 15000);

  stream.readable.getReader().closed.then(() => {
    clearInterval(keepAlive);
    removeClient(id);
  });

  // Must write this immediately to initiate stream
  write(`retry: 10000\n\n`);

  return new Response(stream.readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}

import { nanoid } from "nanoid";
import { addClient, removeClient } from "@/lib/sse";

export async function GET(): Promise<Response> {
  const encoder = new TextEncoder();
  const id = nanoid();

  const stream = new ReadableStream({
    start(controller) {
      const write = (msg: string) => {
        controller.enqueue(encoder.encode(msg));
      };

      addClient(id, write);

      // Keep-alive every 15s
      const keepAlive = setInterval(() => {
        write(`: keep-alive\n\n`);
      }, 15000);

      controller.close = () => {
        clearInterval(keepAlive);
        removeClient(id);
      };

      // Must write this immediately to initiate stream
      write(`retry: 10000\n\n`);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}

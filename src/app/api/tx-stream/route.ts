import { nanoid } from "nanoid";
import { addClient, removeClient } from "@/lib/sse";

export const runtime = "edge";

export async function GET(): Promise<Response> {
  const encoder = new TextEncoder();
  const id = nanoid();

  let send: (msg: string) => void;
  let keepAlive: NodeJS.Timeout;

  const stream = new ReadableStream({
    start(controller) {
      send = (msg: string) => {
        try {
          controller.enqueue(encoder.encode(msg));
        } catch (err) {
          console.error("Failed to enqueue message:", err);
        }
      };

      addClient(id, send);

      controller.enqueue(encoder.encode(`retry: 10000\n\n`)); // initial retry

      keepAlive = setInterval(() => {
        send(`: keep-alive\n\n`);
      }, 15000);
    },
    cancel() {
      clearInterval(keepAlive);
      removeClient(id);
      console.log("Stream canceled for client:", id);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  });
}

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
      send = (msg: string) => controller.enqueue(encoder.encode(msg));

      addClient(id, send);

      controller.enqueue(encoder.encode(`retry: 10000\n\n`)); // initial retry

      keepAlive = setInterval(() => {
        send(`: keep-alive\n\n`);
      }, 15000);
    },
    cancel() {
      clearInterval(keepAlive);
      removeClient(id);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}

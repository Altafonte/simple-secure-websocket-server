import { ConnectionHandler, RequestHandler } from "./types.ts";

export const defaultConnectionHandler: ConnectionHandler = (requestHandler) =>
  async (conn) => {
    const httpConn = Deno.serveHttp(conn);

    for await (const requestEvent of httpConn) {
      await requestEvent.respondWith(requestHandler(requestEvent.request));
    }
  };

export const defaultRequestHandler: RequestHandler = (socketHandler) =>
  (request) => {
    if (!request.url.endsWith("/websocket")) {
      return new Response("requested route doesn't exist");
    }

    const upgrade = request.headers.get("upgrade") || "";
    if (upgrade.toLowerCase() !== "websocket") {
      return new Response("request isn't trying to upgrade to websocket.");
    }

    const { socket, response } = Deno.upgradeWebSocket(request);

    socketHandler(socket);

    return response;
  };

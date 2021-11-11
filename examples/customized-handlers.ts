import { createSimpleSecureWebsocketServer, RequestHandler } from "../mod.ts";

const socketHandler = (socket: WebSocket) => {
  socket.onerror = (e) => console.error("socket error", e);
  socket.onopen = () => console.log("new socket connection", socket);
  socket.onclose = () => console.log("bye, socket connection", socket);
};

const requestHandler: RequestHandler = socketHandler => request => {
  if (!request.url.endsWith("/hit-this-url-for-websocket-connection")) {
    return new Response("wooops!");
  }

  const upgrade = request.headers.get("upgrade") || "";
  if (upgrade.toLowerCase() !== "websocket") {
    return new Response("not a websocket request");
  }

  const { socket, response } = Deno.upgradeWebSocket(request);

  socketHandler(socket);

  return response;
}

const server = createSimpleSecureWebsocketServer({
  socketHandler,
  requestHandler,
  port: 8888,
  certFile: "./certs/certfile.pem",
  keyFile: "./certs/keyfile.pem",
});

server.listen();

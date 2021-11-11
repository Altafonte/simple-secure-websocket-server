import { createSimpleSecureWebsocketServer } from "../mod.ts";

const server = await Deno.listenTls({
  port: 8888,
  certFile: "./certs/certfile.pem",
  keyFile: "./certs/keyfile.pem",
})

const socketHandler = (socket: WebSocket) => {
  socket.onerror = (e) => console.error("socket error", e);
  socket.onopen = () => console.log("new socket connection", socket);
  socket.onclose = () => console.log("bye, socket connection", socket);
};

const wss = createSimpleSecureWebsocketServer({
  socketHandler,
  server,
});

wss.listen();

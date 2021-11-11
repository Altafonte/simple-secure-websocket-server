import { createSimpleSecureWebsocketServer, WebsocketHandler } from "../mod.ts";

const socketHandler: WebsocketHandler = socket => {
  socket.onerror = e => console.error("socket error", e);
  socket.onopen = () => console.log("new socket connection", socket);
  socket.onclose = () => console.log("bye, socket connection", socket);
}

const server = createSimpleSecureWebsocketServer({
  socketHandler,
  port: 8888,
  certFile: "./certs/certfile.pem",
  keyFile: "./certs/keyfile.pem",
});

server.listen();

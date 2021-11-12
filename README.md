# @altafonte/simple-secure-websocket-server

> Package to easily create a WebSocket server that runs over [TLS](https://en.wikipedia.org/wiki/Transport_Layer_Security).

## Quick Links

- [Examples](./examples)

## Usage

### Server

```ts
import { createSimpleSecureWebsocketServer } from "https://deno.land/x/wss@1.0.1/mod.ts";

const socketHandler = (socket: WebSocket) => {
  socket.onerror = (e) => console.error("socket error", e);
  socket.onopen = () => console.log("new socket connection", socket);
  socket.onclose = () => console.log("bye, socket connection", socket);
};

const server = createSimpleSecureWebsocketServer({
  socketHandler,
  port: 8888,
  certFile: "./certs/certfile.pem", // certfile path
  keyFile: "./certs/keyfile.pem", // keyfile path
});

server.listen();
```

### Client

```js
const ws = new WebSocket("wss://127.0.0.1:8888/websocket");
ws.addEventListener("open", () => console.log("open"));
ws.addEventListener("close", () => console.log("close"));
ws.addEventListener("message", e => console.log("message!", e));
```

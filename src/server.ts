export type WebsocketHandler = (s: WebSocket) => void;

export type RequestHandler = (sh: WebsocketHandler) => (r: Request) => Response;

export type ConnectionHandler = (
  rh: (r: Request) => Response,
) => (c: Deno.Conn) => Promise<void>;

interface SimpleSecureWebsocketServerCommonOptions {
  socketHandler: WebsocketHandler;
  requestHandler?: RequestHandler;
  connectionHandler?: ConnectionHandler;
}

interface SimpleSecureWebsocketServerOptionsWithoutServerInstance {
  port: number;
  certFile: string;
  keyFile: string;
}

interface SimpleSecureWebsocketServerOptionsWithServerInstance {
  server: Deno.Listener;
}

export type SimpleSecureWebsocketServerOptions =
  | (
    & SimpleSecureWebsocketServerCommonOptions
    & SimpleSecureWebsocketServerOptionsWithoutServerInstance
  )
  | (
    & SimpleSecureWebsocketServerCommonOptions
    & SimpleSecureWebsocketServerOptionsWithServerInstance
  );

export interface SimpleSecureWebsocketServer {
  listen: () => Promise<void>;
}

function isOptionsWithServer(
  options: SimpleSecureWebsocketServerOptions,
): options is (
  & SimpleSecureWebsocketServerCommonOptions
  & SimpleSecureWebsocketServerOptionsWithServerInstance
) {
  return (options as SimpleSecureWebsocketServerOptionsWithServerInstance)
    .server !== undefined;
}

export const createSimpleSecureWebsocketServer: (
  opts: SimpleSecureWebsocketServerOptions,
) => SimpleSecureWebsocketServer = (options) => ({
  listen: async () => {
    const { socketHandler, requestHandler, connectionHandler } = options;

    const internalServer = isOptionsWithServer(options)
      ? options.server
      : await Deno.listenTls({
        port: options.port,
        certFile: options.certFile,
        keyFile: options.keyFile,
      });

    const rHandler = requestHandler
      ? requestHandler(socketHandler)
      : defaultRequestHandler(socketHandler);

    const internalConnectionHandler = connectionHandler
      ? connectionHandler(rHandler)
      : defaultConnectionHandler(rHandler);

    for await (const conn of internalServer) {
      internalConnectionHandler(conn);
    }
  },
});

const defaultConnectionHandler: ConnectionHandler = (requestHandler) =>
  async (conn) => {
    const httpConn = Deno.serveHttp(conn);

    for await (const requestEvent of httpConn) {
      await requestEvent.respondWith(requestHandler(requestEvent.request));
    }
  };

const defaultRequestHandler: RequestHandler = (socketHandler) =>
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

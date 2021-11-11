export type WebsocketHandler = (s: WebSocket) => void;

export type RequestHandler = (sh: WebsocketHandler) => (r: Request) => Response;

export type ConnectionHandler = (
  rh: (r: Request) => Response,
) => (c: Deno.Conn) => Promise<void>;

export interface SimpleSecureWebsocketServerCommonOptions {
  socketHandler: WebsocketHandler;
  requestHandler?: RequestHandler;
  connectionHandler?: ConnectionHandler;
}

export interface SimpleSecureWebsocketServerOptionsWithoutServerInstance {
  port: number;
  certFile: string;
  keyFile: string;
}

export interface SimpleSecureWebsocketServerOptionsWithServerInstance {
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
